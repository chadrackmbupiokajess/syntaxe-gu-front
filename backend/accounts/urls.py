from django.urls import path
from .views import MyTokenObtainPairView, me, verify_identity, register_user
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
    path('verify-identity/', verify_identity, name='verify_identity'),
    path('register/', register_user, name='register_user'),
]
