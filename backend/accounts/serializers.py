from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajoute le rôle de l'utilisateur au payload du token
        token['role'] = user.role
        return token

class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle User personnalisé.
    """
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'matricule',
            'email',
            'first_name',
            'last_name',
            'post_name',
            'role',
            'full_name',
            'profile_picture',
            # Ajoutez d'autres champs que vous voulez exposer via l'API
        )
        read_only_fields = ('id', 'full_name')

    def get_full_name(self, obj):
        return obj.get_full_name()
