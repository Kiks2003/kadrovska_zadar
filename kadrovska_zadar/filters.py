from datetime import timedelta

import django_filters
from django.db.models import OuterRef, Subquery
from django.utils import timezone

from kadrovska_zadar.models import RadnaDozvola, Radnik

# Mora odgovarati USKORO_ISTJECE_DANA na frontendu (shared/stanje-dozvole.ts).
USKORO_ISTJECE_DANA = 60


def _aktualna_dozvola(polje):
    """Vrijednost polja aktualne dozvole (one s najkasnijim datumom isteka)."""
    return Subquery(
        RadnaDozvola.objects
        .filter(radnik=OuterRef('pk'), datum_isteka__isnull=False)
        .order_by('-datum_isteka')
        .values(polje)[:1]
    )


class RadnikFilter(django_filters.FilterSet):
    STANJA = [
        ('vazeca', 'Važeća'),
        ('uskoro', 'Uskoro istječe'),
        ('istekla', 'Istekla'),
        ('bez', 'Bez dozvole'),
    ]

    status = django_filters.ChoiceFilter(choices=Radnik.Status.choices)
    struka = django_filters.CharFilter(lookup_expr='icontains')
    poslodavac = django_filters.CharFilter(lookup_expr='icontains')
    vrsta_dozvole = django_filters.ChoiceFilter(
        choices=RadnaDozvola.Vrsta.choices, method='filter_vrsta_dozvole'
    )
    stanje_dozvole = django_filters.ChoiceFilter(choices=STANJA, method='filter_stanje_dozvole')

    class Meta:
        model = Radnik
        fields = ['status', 'struka', 'poslodavac', 'vrsta_dozvole', 'stanje_dozvole']

    def filter_vrsta_dozvole(self, queryset, name, value):
        return queryset.annotate(aktualna_vrsta=_aktualna_dozvola('vrsta')).filter(aktualna_vrsta=value)

    def filter_stanje_dozvole(self, queryset, name, value):
        danas = timezone.localdate()
        granica = danas + timedelta(days=USKORO_ISTJECE_DANA)
        queryset = queryset.annotate(aktualni_istek=_aktualna_dozvola('datum_isteka'))
        if value == 'bez':
            return queryset.filter(aktualni_istek__isnull=True)
        if value == 'istekla':
            return queryset.filter(aktualni_istek__lt=danas)
        if value == 'uskoro':
            return queryset.filter(aktualni_istek__gte=danas, aktualni_istek__lte=granica)
        return queryset.filter(aktualni_istek__gt=granica)
