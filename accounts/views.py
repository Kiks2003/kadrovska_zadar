from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.check_user import build_data
from accounts.serializers import (
    LoginRequestSerializer,
    UserInfoSerializer,
    LogoutResponseSerializer,
)


class Prijava(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Prijava korisnika",
        description="Validira korisničke podatke i kreira sesiju.",
        request=LoginRequestSerializer,
        responses=UserInfoSerializer,
    )
    def post(self, request):
        form = AuthenticationForm(data=request.data)
        if not form.is_valid():
            raise ValidationError(form.errors)

        user = form.get_user()
        login(request, user)

        return Response(build_data(user))


class Odjava(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Odjava korisnika",
        description="Briše aktivnu sesiju korisnika.",
        request=None,
        responses=LogoutResponseSerializer,
    )
    def post(self, request):
        logout(request)
        return Response({"status": "logged_out"})


class CheckUser(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Provjera prijave",
        description="Vraća informacije o trenutno prijavljenom korisniku.",
        responses=UserInfoSerializer,
    )
    def get(self, request):
        return Response(build_data(request.user))
