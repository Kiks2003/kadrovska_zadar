from django.contrib import admin

from kadrovska_zadar.models import Radnik


@admin.register(Radnik)
class RadnikAdmin(admin.ModelAdmin):
    list_display = ('ime', 'prezime', 'oib', 'struka', 'status', 'poslodavac')
    search_fields = ('ime', 'prezime', 'oib')
    list_filter = ('status', 'vrsta_dozvole')
