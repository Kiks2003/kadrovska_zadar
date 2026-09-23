import uuid

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver

oib_validator = RegexValidator(
    regex=r'^\d{11}$',
    message='OIB mora sadržavati točno 11 znamenki.',
)


class Radnik(models.Model):
    class Status(models.TextChoices):
        AKTIVAN = 'aktivan', 'Aktivan'
        NEAKTIVAN = 'neaktivan', 'Neaktivan'

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

    broj_putovnice = models.CharField(max_length=50, blank=True)

    napomena = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['prezime', 'ime']
        verbose_name = 'Radnik'
        verbose_name_plural = 'Radnici'

    def __str__(self):
        return f'{self.ime} {self.prezime}'


class RadnaDozvola(models.Model):
    class Vrsta(models.TextChoices):
        DOZVOLA_BORAVAK_RAD = 'dozvola_boravak_rad', 'Dozvola za boravak i rad'
        POTVRDA_PRIJAVA_RADA = 'potvrda_prijava_rada', 'Potvrda o prijavi rada'
        PLAVA_KARTA_EU = 'plava_karta_eu', 'EU plava karta'
        OSTALO = 'ostalo', 'Ostalo'

    radnik = models.ForeignKey(Radnik, on_delete=models.CASCADE, related_name='dozvole')
    vrsta = models.CharField(max_length=30, choices=Vrsta.choices)
    broj_dozvole = models.CharField(max_length=50, blank=True)
    izdao = models.CharField(max_length=150, blank=True)
    datum_izdavanja = models.DateField(null=True, blank=True)
    # null=True samo radi starih zapisa; API ga traži kao obvezno polje.
    datum_isteka = models.DateField(null=True)
    napomena = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-datum_isteka', '-datum_izdavanja']
        verbose_name = 'Radna dozvola'
        verbose_name_plural = 'Radne dozvole'

    def __str__(self):
        return f'{self.get_vrsta_display()} – {self.radnik} (do {self.datum_isteka})'


def privatni_storage():
    return FileSystemStorage(location=settings.PRIVATE_MEDIA_ROOT)


def putanja_dokumenta(instance, filename):
    # Izvorni naziv se čuva u bazi; na disku samo nasumično ime.
    return f'radnici/{instance.radnik_id}/{uuid.uuid4().hex}.pdf'


class Dokument(models.Model):
    class Vrsta(models.TextChoices):
        RADNA_DOZVOLA = 'radna_dozvola', 'Radna dozvola'
        PUTOVNICA = 'putovnica', 'Putovnica'
        UGOVOR = 'ugovor', 'Ugovor o radu'
        OSTALO = 'ostalo', 'Ostalo'

    radnik = models.ForeignKey(Radnik, on_delete=models.CASCADE, related_name='dokumenti')
    dozvola = models.ForeignKey(
        RadnaDozvola, on_delete=models.SET_NULL, null=True, blank=True, related_name='dokumenti'
    )
    vrsta = models.CharField(max_length=30, choices=Vrsta.choices, default=Vrsta.OSTALO)
    naziv = models.CharField(max_length=200)
    datoteka = models.FileField(upload_to=putanja_dokumenta, storage=privatni_storage)
    izvorni_naziv = models.CharField(max_length=255)
    velicina = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Dokument'
        verbose_name_plural = 'Dokumenti'

    def __str__(self):
        return f'{self.naziv} – {self.radnik}'


@receiver(post_delete, sender=Dokument)
def obrisi_datoteku(sender, instance, **kwargs):
    # Briše PDF s diska i kad se dokument briše kaskadno (brisanjem radnika).
    if instance.datoteka:
        instance.datoteka.delete(save=False)
