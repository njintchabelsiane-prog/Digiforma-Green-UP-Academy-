from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Classe

User = get_user_model()

class ClasseModelTest(TestCase):
    
    def setUp(self):
        self.enseignant = User.objects.create_user(
            email='prof@test.com',
            password='Test1234!',
            nom='Dupont',
            prenom='jean',
            role='enseignant'
        )
    
    def test_creation_classe(self):
        classe = Classe.objects.create(
            nom='Mathématiques',
            matiere='Maths',
            annee_scolaire='2025-2026',
            enseignant=self.enseignant
        )
        self.assertEqual(classe.nom, 'Mathématiques')
        self.assertEqual(classe.matiere, 'Maths')
    
    def test_code_invitation_genere(self):
        classe = Classe.objects.create(
            nom='Français',
            matiere='Français',
            annee_scolaire='2025-2026',
            enseignant=self.enseignant
        )
        self.assertIsNotNone(classe.code_invitation)
        self.assertEqual(len(classe.code_invitation), 6)
    
    def test_str_classe(self):
        classe = Classe.objects.create(
            nom='Physique',
            matiere='Sciences',
            annee_scolaire='2025-2026',
            enseignant=self.enseignant
        )
        self.assertIn('Physique', str(classe))  


class ClasseArchivageApiTest(APITestCase):
    def setUp(self):
        self.enseignant = User.objects.create_user(
            email='archive-prof@test.com',
            password='Test1234!',
            nom='Dupont',
            prenom='Jean',
            role='enseignant',
        )
        self.classe = Classe.objects.create(
            nom='Histoire L1',
            matiere='Histoire',
            niveau='Licence 1',
            annee_scolaire='2025-2026',
            enseignant=self.enseignant,
        )
        refresh = RefreshToken.for_user(self.enseignant)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_archiver_classe_filtre_et_bloque_modifications(self):
        archive_response = self.client.post(f'/api/classes/{self.classe.id}/archiver/')
        self.assertEqual(archive_response.status_code, status.HTTP_200_OK)
        self.assertTrue(archive_response.data['is_archived'])

        active_response = self.client.get('/api/classes/')
        self.assertEqual(active_response.status_code, status.HTTP_200_OK)
        self.assertEqual(active_response.data, [])

        archived_response = self.client.get('/api/classes/?archivee=true')
        self.assertEqual(archived_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(archived_response.data), 1)
        self.assertEqual(archived_response.data[0]['id'], self.classe.id)

        update_response = self.client.put(
            f'/api/classes/{self.classe.id}/',
            {'nom': 'Classe modifiée'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        unarchive_response = self.client.post(f'/api/classes/{self.classe.id}/archiver/')
        self.assertEqual(unarchive_response.status_code, status.HTTP_200_OK)
        self.assertFalse(unarchive_response.data['is_archived'])
