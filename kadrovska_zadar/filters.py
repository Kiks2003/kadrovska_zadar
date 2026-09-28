from datetime import timedelta

import django_filters
from django.db.models import BooleanField, Case, Exists, OuterRef, Q, Subquery, Value, When
from django.utils import timezone

from kadrovska_zadar.models import Dokument, RadnaDozvola, Radnik

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


def _ima_dokument(vrsta):
    return Exists(Dokument.objects.filter(radnik=OuterRef('pk'), vrsta=vrsta))


def s_potpunom_dokumentacijom(queryset):
    """Dodaje anotaciju `dokumentacija_potpuna`.

    Pravila moraju odgovarati provjeriDokumentaciju() na frontendu (shared/dokumentacija.ts).
    """
    danas = timezone.localdate()
    queryset = queryset.annotate(
        dok_aktualna_dozvola=_aktualna_dozvola('id'),
        dok_aktualni_istek=_aktualna_dozvola('datum_isteka'),
    ).annotate(
        ima_pdf_putovnice=_ima_dokument(Dokument.Vrsta.PUTOVNICA),
        ima_ugovor=_ima_dokument(Dokument.Vrsta.UGOVOR),
        # PDF dozvole vrijedi ako je povezan s aktualnom dozvolom ili ni s jednom
        # (PDF stare, zamijenjene dozvole se ne računa).
        ima_pdf_dozvole=Exists(
            Dokument.objects
            .filter(radnik=OuterRef('pk'), vrsta=Dokument.Vrsta.RADNA_DOZVOLA)
            .filter(Q(dozvola__isnull=True) | Q(dozvola=OuterRef('dok_aktualna_dozvola')))
        ),
    )
    potpuna = (
        ~Q(broj_putovnice='')
        & Q(ima_pdf_putovnice=True)
        & Q(dok_aktualni_istek__gte=danas)
        & Q(ima_pdf_dozvole=True)
        & Q(ima_ugovor=True)
    )
    # Case umjesto izravnog Q: istek može biti NULL, a NOT (NULL >= x) ne bi vratio ništa.
    return queryset.annotate(
        dokumentacija_potpuna=Case(When(potpuna, then=Value(True)), default=Value(False), output_field=BooleanField())
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
    dokumentacija = django_filters.ChoiceFilter(
        choices=[('potpuna', 'Potpuna'), ('nepotpuna', 'Nepotpuna')], method='filter_dokumentacija'
    )

    class Meta:
        model = Radnik
        fields = ['status', 'struka', 'poslodavac', 'vrsta_dozvole', 'stanje_dozvole', 'dokumentacija']

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

    def filter_dokumentacija(self, queryset, name, value):
        return s_potpunom_dokumentacijom(queryset).filter(dokumentacija_potpuna=value == 'potpuna')
