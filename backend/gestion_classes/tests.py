from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
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