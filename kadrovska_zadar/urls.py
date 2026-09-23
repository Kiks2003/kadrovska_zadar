from rest_framework.routers import DefaultRouter

from kadrovska_zadar import views

app_name = 'kadrovska_zadar'

router = DefaultRouter()
router.register('radnici', views.RadnikViewSet, basename='radnik')
router.register('dozvole', views.RadnaDozvolaViewSet, basename='radna-dozvola')
router.register('dokumenti', views.DokumentViewSet, basename='dokument')

urlpatterns = router.urls
