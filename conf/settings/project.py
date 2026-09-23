from conf.settings.django import BASE_DIR, INSTALLED_APPS
from conf.version import get_git_version, get_frontend_version

GIT_VERSION = get_git_version()


INSTALLED_APPS.extend(['kadrovska_zadar', 'accounts'])

# Dokumenti radnika (PDF) – izvan MEDIA_ROOT-a jer se ne smiju posluživati javno,
# nego samo preko API-ja prijavljenim korisnicima.
PRIVATE_MEDIA_ROOT = BASE_DIR / 'private_media'
DOKUMENT_MAX_MB = 10
