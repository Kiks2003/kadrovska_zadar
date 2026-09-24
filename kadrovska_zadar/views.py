from django.http import FileResponse, Http404
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.viewsets import ModelViewSet

from kadrovska_zadar.filters import RadnikFilter
from kadrovska_zadar.models import Dokument, RadnaDozvola, Radnik
from kadrovska_zadar.serializers import DokumentSerializer, RadnaDozvolaSerializer, RadnikSerializer


class RadnikViewSet(ModelViewSet):
    queryset = Radnik.objects.prefetch_related('dozvole', 'dokumenti')
    serializer_class = RadnikSerializer
    filterset_class = RadnikFilter
    search_fields = ['ime', 'prezime', 'oib']


class RadnaDozvolaViewSet(ModelViewSet):
    queryset = RadnaDozvola.objects.select_related('radnik')
    serializer_class = RadnaDozvolaSerializer
    filterset_fields = ['radnik', 'vrsta']


class DokumentViewSet(ModelViewSet):
    queryset = Dokument.objects.select_related('radnik')
    serializer_class = DokumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['radnik', 'dozvola', 'vrsta']

    @action(detail=True, methods=['get'])
    def sadrzaj(self, request, pk=None):
        """PDF za pregled u pregledniku; s ?preuzmi=1 kao preuzimanje."""
        dokument = self.get_object()
        try:
            datoteka = dokument.datoteka.open('rb')
        except FileNotFoundError:
            raise Http404('Datoteka nije pronađena.')
        response = FileResponse(
            datoteka,
            content_type='application/pdf',
            as_attachment=request.query_params.get('preuzmi') == '1',
            filename=dokument.izvorni_naziv,
        )
        response['X-Content-Type-Options'] = 'nosniff'
        response['Cache-Control'] = 'private, no-store'
        return response
