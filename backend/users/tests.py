from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()


class AuthTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.enseignant = User.objects.create_user(
            email="enseignant@example.com",
            password="testpass123",
            nom="Enseignant",
            prenom="User",
            role="enseignant"
        )

    def test_login(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'enseignant@example.com',
            'password': 'testpass123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        print("Login successful, access token received.")

    def test_logout(self):
        refresh = RefreshToken.for_user(self.enseignant)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.post('/api/auth/logout/', {
            'refresh': str(refresh)
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("Logout successful.")

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.enseignant)
        response = self.client.post('/api/auth/refresh/', {
            'refresh': str(refresh)
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        print("Token refresh successful, new access token received.")

    def test_me(self):
        refresh = RefreshToken.for_user(self.enseignant)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get('/api/auth/me/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'enseignant@example.com')
        print("Me successful, user data received.")


class PasswordResetTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="eleve@example.com",
            password="ancienMotDePasse1!",
            nom="Eleve",
            prenom="Paul",
            role="eleve"
        )

    def _uid_token(self):
        return (
            urlsafe_base64_encode(force_bytes(self.user.pk)),
            default_token_generator.make_token(self.user),
        )

    def test_demande_envoie_un_email(self):
        response = self.client.post('/api/auth/password-reset/', {'email': 'ELEVE@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['eleve@example.com'])
        self.assertIn('/reinitialiser-mot-de-passe/', mail.outbox[0].body)

    def test_demande_email_inconnu_meme_reponse_sans_email(self):
        response = self.client.post('/api/auth/password-reset/', {'email': 'inconnu@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_demande_sans_email(self):
        response = self.client.post('/api/auth/password-reset/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirmation_change_le_mot_de_passe(self):
        refresh = RefreshToken.for_user(self.user)
        uid, token = self._uid_token()
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid, 'token': token, 'new_password': 'NouveauMdp2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NouveauMdp2026!'))

        # Le lien ne peut servir qu'une fois
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid, 'token': token, 'new_password': 'EncoreUnAutre2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Les anciennes sessions sont déconnectées
        response = self.client.post('/api/auth/refresh/', {'refresh': str(refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_confirmation_token_invalide(self):
        uid, _ = self._uid_token()
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid, 'token': 'faux-token', 'new_password': 'NouveauMdp2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirmation_mot_de_passe_trop_faible(self):
        uid, token = self._uid_token()
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'uid': uid, 'token': token, 'new_password': '123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('ancienMotDePasse1!'))
