from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User


TEMP_USER_PASSWORD = 'Greenup123!'


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — retourne access + refresh token"""
    permission_classes = []


class LogoutView(APIView):
    """POST /api/auth/logout/ — invalide le refresh token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Token invalide."}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """GET /api/auth/me/ — retourne le profil de l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id":     user.id,
            "email":  user.email,
            "nom":    user.nom,
            "prenom": user.prenom,
            "role":   user.role,
        })


class UsersAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.order_by('role', 'nom', 'prenom')
        return Response([
            {
                'id': user.id,
                'email': user.email,
                'nom': user.nom,
                'prenom': user.prenom,
                'role': user.role,
                'is_active': user.is_active,
            }
            for user in users
        ])

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

        email = (request.data.get('email') or '').strip().lower()
        nom = (request.data.get('nom') or '').strip()
        prenom = (request.data.get('prenom') or '').strip()
        role = (request.data.get('role') or '').strip()

        if not email or not nom or not prenom or role not in ['admin', 'enseignant', 'eleve']:
            return Response(
                {'detail': 'Email, nom, prénom et rôle valide sont obligatoires.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Un compte existe déjà avec cet email.'}, status=status.HTTP_409_CONFLICT)

        user = User.objects.create_user(email=email, nom=nom, prenom=prenom, role=role, password=TEMP_USER_PASSWORD)
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save(update_fields=['is_staff', 'is_superuser'])

        return Response({
            'id': user.id,
            'email': user.email,
            'nom': user.nom,
            'prenom': user.prenom,
            'role': user.role,
            'is_active': user.is_active,
            'mot_de_passe_temporaire': TEMP_USER_PASSWORD,
        }, status=status.HTTP_201_CREATED)


class UserAdminDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': 'Réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.id == pk and request.data.get('is_active') is False:
            return Response({'detail': 'Vous ne pouvez pas désactiver votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        for field in ['nom', 'prenom']:
            if field in request.data:
                setattr(user, field, request.data[field])
        if 'role' in request.data and request.data['role'] in ['admin', 'enseignant', 'eleve']:
            user.role = request.data['role']
        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
        user.save()

        return Response({
            'id': user.id,
            'email': user.email,
            'nom': user.nom,
            'prenom': user.prenom,
            'role': user.role,
            'is_active': user.is_active,
        })
