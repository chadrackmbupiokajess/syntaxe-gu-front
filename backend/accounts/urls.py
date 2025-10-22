from django.urls import path, re_path
from .views import RegisterView, me


urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view(), name="register"),
    re_path(r"^me/?$", me, name="me"),
]
