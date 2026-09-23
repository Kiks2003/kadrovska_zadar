from django.contrib import admin

from kadrovska_zadar.models import Dokument, RadnaDozvola, Radnik


class RadnaDozvolaInline(admin.TabularInline):
    model = RadnaDozvola
    extra = 0


class DokumentInline(admin.TabularInline):
    model = Dokument
    extra = 0
    fields = ('naziv', 'vrsta', 'dozvola', 'izvorni_naziv', 'velicina', 'created_at')
    readonly_fields = ('izvorni_naziv', 'velicina', 'created_at')


@admin.register(Radnik)
class RadnikAdmin(admin.ModelAdmin):
    list_display = ('ime', 'prezime', 'oib', 'struka', 'status', 'poslodavac')
    search_fields = ('ime', 'prezime', 'oib')
    list_filter = ('status', 'dozvole__vrsta')
    inlines = [RadnaDozvolaInline, DokumentInline]


@admin.register(RadnaDozvola)
class RadnaDozvolaAdmin(admin.ModelAdmin):
    list_display = ('radnik', 'vrsta', 'broj_dozvole', 'datum_izdavanja', 'datum_isteka')
    search_fields = ('radnik__ime', 'radnik__prezime', 'radnik__oib', 'broj_dozvole')
    list_filter = ('vrsta',)
