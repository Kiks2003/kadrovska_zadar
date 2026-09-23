from rest_framework import serializers

from kadrovska_zadar.models import RadnaDozvola, Radnik


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


class RadnikSerializer(serializers.ModelSerializer):
    dozvole = RadnaDozvolaSerializer(many=True, read_only=True)

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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
