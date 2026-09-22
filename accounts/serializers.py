from rest_framework import serializers


class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserInfoSerializer(serializers.Serializer):
    logged_in = serializers.BooleanField()
    username = serializers.CharField(required=False, allow_blank=True)
    is_superuser = serializers.BooleanField(required=False)
    git_version = serializers.CharField(required=False, allow_blank=True)
    app_version = serializers.CharField(required=False, allow_blank=True)
    permissions = serializers.ListField(child=serializers.CharField(), required=False)


class LogoutResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
