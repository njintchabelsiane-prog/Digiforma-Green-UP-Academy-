from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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
    
