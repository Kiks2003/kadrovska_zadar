from rest_framework.viewsets import ModelViewSet

from kadrovska_zadar.models import Radnik
from kadrovska_zadar.serializers import RadnikSerializer


class RadnikViewSet(ModelViewSet):
    queryset = Radnik.objects.all()
    serializer_class = RadnikSerializer
    filterset_fields = ['status', 'vrsta_dozvole', 'struka']
    search_fields = ['ime', 'prezime', 'oib']
