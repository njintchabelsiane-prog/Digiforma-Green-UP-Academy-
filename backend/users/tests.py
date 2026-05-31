from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AuthTests(APITestCase):
	def setUp(self):
		self.email = "testuser@example.com"
		self.password = "testpass123"
		self.user = User.objects.create_user(email=self.email, password=self.password, nom="Test", prenom="User", role="user")

	def test_login_success(self):
		url = reverse('login')
		data = {"email": self.email, "password": self.password}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)

	def test_login_wrong_password(self):
		url = reverse('login')
		data = {"email": self.email, "password": "wrongpass"}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertIn("No active account", str(response.data))

	def test_login_nonexistent_email(self):
		url = reverse('login')
		data = {"email": "notfound@example.com", "password": "irrelevant"}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertIn("No active account", str(response.data))

	def test_logout_success(self):
		refresh = RefreshToken.for_user(self.user)
		self.client.force_authenticate(user=self.user)
		url = reverse('logout')
		data = {"refresh": str(refresh)}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("message", response.data)

	def test_logout_invalid_token(self):
		self.client.force_authenticate(user=self.user)
		url = reverse('logout')
		data = {"refresh": "invalidtoken"}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("error", response.data)

	def test_logout_requires_authentication(self):
		url = reverse('logout')
		data = {"refresh": "invalidtoken"}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
