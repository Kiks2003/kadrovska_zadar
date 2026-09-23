import os

from django.conf import settings
from rest_framework import serializers

from kadrovska_zadar.models import Dokument, RadnaDozvola, Radnik


class RadnaDozvolaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RadnaDozvola
        fields = [
            'id',
            'radnik',
            'vrsta',
            'broj_dozvole',
            'izdao',
            'datum_izdavanja',
            'datum_isteka',
            'napomena',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'datum_isteka': {'required': True, 'allow_null': False},
        }

    def validate(self, attrs):
        izdavanje = attrs.get('datum_izdavanja', getattr(self.instance, 'datum_izdavanja', None))
        istek = attrs.get('datum_isteka', getattr(self.instance, 'datum_isteka', None))
        if izdavanje and istek and istek < izdavanje:
            raise serializers.ValidationError(
                {'datum_isteka': 'Datum isteka ne može biti prije datuma izdavanja.'}
            )
        return attrs


class DokumentSerializer(serializers.ModelSerializer):
    datoteka = serializers.FileField(write_only=True)
    naziv = serializers.CharField(max_length=200, required=False, allow_blank=True)

    class Meta:
        model = Dokument
        fields = [
            'id',
            'radnik',
            'dozvola',
            'vrsta',
            'naziv',
            'datoteka',
            'izvorni_naziv',
            'velicina',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'izvorni_naziv', 'velicina', 'created_at', 'updated_at']

    def get_fields(self):
        fields = super().get_fields()
        # Kod izmjene se mijenjaju samo podaci o dokumentu, ne i sam PDF ni radnik.
        if self.instance is not None:
            fields['datoteka'].read_only = True
            fields['radnik'].read_only = True
        return fields

    def validate_datoteka(self, datoteka):
        max_mb = settings.DOKUMENT_MAX_MB
        if datoteka.size > max_mb * 1024 * 1024:
            raise serializers.ValidationError(f'Datoteka je veća od {max_mb} MB.')
        if not datoteka.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('Dopušteni su samo PDF dokumenti.')
        # Provjera sadržaja, ne samo ekstenzije (npr. preimenovana slika).
        pocetak = datoteka.read(5)
        datoteka.seek(0)
        if pocetak != b'%PDF-':
            raise serializers.ValidationError('Datoteka nije ispravan PDF dokument.')
        return datoteka

    def validate(self, attrs):
        radnik = attrs.get('radnik', getattr(self.instance, 'radnik', None))
        dozvola = attrs.get('dozvola')
        if dozvola and dozvola.radnik_id != radnik.id:
            raise serializers.ValidationError({'dozvola': 'Dozvola ne pripada ovom radniku.'})
        return attrs

    def create(self, validated_data):
        datoteka = validated_data['datoteka']
        izvorni_naziv = os.path.basename(datoteka.name)
        validated_data['izvorni_naziv'] = izvorni_naziv
        validated_data['velicina'] = datoteka.size
        if not validated_data.get('naziv'):
            validated_data['naziv'] = os.path.splitext(izvorni_naziv)[0]
        return super().create(validated_data)


class RadnikSerializer(serializers.ModelSerializer):
    dozvole = RadnaDozvolaSerializer(many=True, read_only=True)
    dokumenti = DokumentSerializer(many=True, read_only=True)

    class Meta:
        model = Radnik
        fields = [
            'id',
            'ime',
            'prezime',
            'oib',
            'struka',
            'datum_rodjenja',
            'drzavljanstvo',
            'adresa',
            'telefon',
            'email',
            'poslodavac',
            'datum_zaposlenja',
            'status',
            'broj_putovnice',
            'napomena',
            'dozvole',
            'dokumenti',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
