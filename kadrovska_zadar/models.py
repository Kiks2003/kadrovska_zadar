from django.core.validators import RegexValidator
from django.db import models

oib_validator = RegexValidator(
    regex=r'^\d{11}$',
    message='OIB mora sadržavati točno 11 znamenki.',
)


class Radnik(models.Model):
    class Status(models.TextChoices):
        AKTIVAN = 'aktivan', 'Aktivan'
        NEAKTIVAN = 'neaktivan', 'Neaktivan'

    class VrstaDozvole(models.TextChoices):
        DOZVOLA_BORAVAK_RAD = 'dozvola_boravak_rad', 'Dozvola za boravak i rad'
        POTVRDA_PRIJAVA_RADA = 'potvrda_prijava_rada', 'Potvrda o prijavi rada'
        PLAVA_KARTA_EU = 'plava_karta_eu', 'EU plava karta'
        OSTALO = 'ostalo', 'Ostalo'

    # Osobni podaci
    ime = models.CharField(max_length=100)
    prezime = models.CharField(max_length=100)
    oib = models.CharField(max_length=11, unique=True, validators=[oib_validator])
    struka = models.CharField(max_length=150)
    datum_rodjenja = models.DateField(null=True, blank=True)
    drzavljanstvo = models.CharField(max_length=100, blank=True)
    adresa = models.CharField(max_length=255, blank=True)
    telefon = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)

    # Zaposlenje
    poslodavac = models.CharField(max_length=200, blank=True)
    datum_zaposlenja = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AKTIVAN)

    # Radna dozvola
    broj_putovnice = models.CharField(max_length=50, blank=True)
    vrsta_dozvole = models.CharField(max_length=30, choices=VrstaDozvole.choices, blank=True)
    datum_izdavanja_dozvole = models.DateField(null=True, blank=True)
    datum_isteka_dozvole = models.DateField(null=True, blank=True)

    napomena = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['prezime', 'ime']
        verbose_name = 'Radnik'
        verbose_name_plural = 'Radnici'

    def __str__(self):
        return f'{self.ime} {self.prezime}'
