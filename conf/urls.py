"""
URL configuration for conf project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
"""
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.views.decorators.cache import never_cache
from rest_framework.permissions import IsAdminUser
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def frontend_index_html(request):  # NOQA
    return HttpResponse(settings.FRONTEND_INDEX_HTML)


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include([
        path('kadrovska-zadar/', include('kadrovska_zadar.urls')),
        path('accounts/', include('accounts.urls')),
    ])),

    # Swagger (staff-only — schema exposes the full data model, incl. PII field names)
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=[IsAdminUser]), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[IsAdminUser]), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[IsAdminUser]), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r'^(?!admin|api|media|static).*', never_cache(frontend_index_html), name='frontend.home'),
]
