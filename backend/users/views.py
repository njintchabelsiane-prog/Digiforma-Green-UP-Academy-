import logging

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User

logger = logging.getLogger(__name__)


TEMP_USER_PASSWORD = 'Test1234!'


def get_effective_role(user):
    if user.is_superuser:
        return 'admin'
    return user.role


def is_admin_user(user):
    return user.role == 'admin' or user.is_superuser


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


class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/ — envoie un lien de réinitialisation par email"""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        if not email:
            return Response({'detail': "L'adresse email est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL.rstrip('/')}/reinitialiser-mot-de-passe/{uid}/{token}"
            message = (
                f"Bonjour {user.prenom},\n\n"
                "Vous avez demandé à réinitialiser votre mot de passe Green UP Academy.\n"
                f"Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n\n"
                f"{link}\n\n"
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : "
                "votre mot de passe actuel reste valable.\n\n"
                "L'équipe Green UP Academy"
            )
            try:
                send_mail(
                    'Réinitialisation de votre mot de passe',
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                )
            except Exception:
                # On ne révèle pas l'erreur au client pour ne pas indiquer si le compte existe
                logger.exception("Échec de l'envoi de l'email de réinitialisation à %s", user.email)

        # Même réponse que le compte existe ou non (ne pas révéler les emails inscrits)
        return Response({
            'message': "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé."
        })


class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset/confirm/ — définit le nouveau mot de passe"""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        uid = request.data.get('uid') or ''
        token = request.data.get('token') or ''
        new_password = request.data.get('new_password') or ''

        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)), is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response(
                {'detail': 'Ce lien est invalide ou a expiré. Faites une nouvelle demande.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Déconnecte les sessions existantes : les anciens refresh tokens ne sont plus valables
        for outstanding in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=outstanding)

        return Response({'message': 'Votre mot de passe a été modifié. Vous pouvez vous connecter.'})


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
            "role":   get_effective_role(user),
        })


class UsersAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin_user(request.user):
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
        if not is_admin_user(request.user):
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
        if not is_admin_user(request.user):
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
