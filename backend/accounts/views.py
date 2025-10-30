from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_identity(request):
    matricule = request.data.get('matricule')

    if not matricule:
        return Response({'detail': 'Le matricule est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.select_related('current_auditoire__departement__section').get(matricule__iexact=matricule)

        if user.has_usable_password() and user.status == 'active':
            return Response({'detail': 'Ce compte est déjà actif.'}, status=status.HTTP_409_CONFLICT)

        # Préparer les données de base
        user_data = {
            'nom_complet': user.get_full_name(),
            'sexe': user.get_sexe_display(),
            'role': user.get_role_display(),
        }

        # Ajouter les infos académiques si c'est un étudiant
        if user.role == 'etudiant' and user.current_auditoire:
            auditoire = user.current_auditoire
            user_data['auditoire'] = auditoire.name
            if auditoire.departement:
                user_data['departement'] = auditoire.departement.name
                if auditoire.departement.section:
                    user_data['section'] = auditoire.departement.section.name

        return Response(user_data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'detail': 'Aucun profil correspondant à ce matricule.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    matricule = request.data.get('matricule')
    password = request.data.get('password')

    if not all([matricule, password]):
        return Response({'detail': 'Matricule et mot de passe sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(matricule__iexact=matricule)

        if user.has_usable_password() and user.status == 'active':
            return Response({'detail': 'Ce compte est déjà actif.'}, status=status.HTTP_409_CONFLICT)

        user.set_password(password)
        user.status = 'active'
        user.save()

        return Response({'message': 'Compte utilisateur créé avec succès. Vous pouvez maintenant vous connecter.'}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({'detail': 'Profil non trouvé pour le matricule fourni.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
