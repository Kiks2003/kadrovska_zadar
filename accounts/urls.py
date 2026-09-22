from django.urls import path

from accounts import views

app_name = "accounts"
urlpatterns = [
    path("login/", views.Prijava.as_view(), name="login"),
    path("logout/", views.Odjava.as_view(), name="logout"),
    path("check-user/", views.CheckUser.as_view(), name="check-user"),
]
