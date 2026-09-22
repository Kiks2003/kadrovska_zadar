from conf.settings.django import INSTALLED_APPS
from conf.version import get_git_version, get_frontend_version

GIT_VERSION = get_git_version()


INSTALLED_APPS.extend(['kadrovska_zadar', 'accounts'])
