from rest_framework import serializers

from kadrovska_zadar.models import Radnik


class RadnikSerializer(serializers.ModelSerializer):
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
            'vrsta_dozvole',
            'datum_izdavanja_dozvole',
            'datum_isteka_dozvole',
            'napomena',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
