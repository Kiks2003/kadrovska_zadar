from django.conf import settings


def build_data(user):
    if not user.is_authenticated:
        return {'logged_in': False}

    return {
        'logged_in': True,
        'username': user.username,
        'is_superuser': user.is_superuser,
        'git_version': settings.GIT_VERSION,
        'app_version': settings.APP_VERSION,
        'permissions': list(user.get_all_permissions()),
    }
