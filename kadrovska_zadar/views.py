from rest_framework.viewsets import ModelViewSet

from kadrovska_zadar.models import RadnaDozvola, Radnik
from kadrovska_zadar.serializers import RadnaDozvolaSerializer, RadnikSerializer


class RadnikViewSet(ModelViewSet):
    queryset = Radnik.objects.prefetch_related('dozvole')
    serializer_class = RadnikSerializer
    filterset_fields = ['status', 'struka', 'dozvole__vrsta']
    search_fields = ['ime', 'prezime', 'oib']


class RadnaDozvolaViewSet(ModelViewSet):
    queryset = RadnaDozvola.objects.select_related('radnik')
    serializer_class = RadnaDozvolaSerializer
    filterset_fields = ['radnik', 'vrsta']
