from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Ajoute le rôle de l'utilisateur au token
        try:
            role = user.role.role
        except Role.DoesNotExist:
            role = None
        
        token['role'] = role

        return token
