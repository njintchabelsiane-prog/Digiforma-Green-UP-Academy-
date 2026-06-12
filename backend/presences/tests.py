from datetime import date

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from gestion_classes.models import Classe, Inscription
from .models import Presence


User = get_user_model()


class PresenceApiTests(APITestCase):
    def setUp(self):
        self.enseignant = User.objects.create_user(
            email='prof@example.com',
            password='testpass123',
            nom='Dupont',
            prenom='Marie',
            role='enseignant',
        )
        self.eleve = User.objects.create_user(
            email='eleve@example.com',
            password='testpass123',
            nom='Martin',
            prenom='Paul',
            role='eleve',
        )
        self.classe = Classe.objects.create(
            nom='A1',
            matiere='Mathématique',
            niveau='L1',
            annee_scolaire='2025-2026',
            enseignant=self.enseignant,
        )
        Inscription.objects.create(eleve=self.eleve, classe=self.classe)

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_enseignant_enregistre_appel(self):
        self.authenticate(self.enseignant)
        response = self.client.post('/api/presences/appel/', {
            'classe': self.classe.id,
            'date': str(date.today()),
            'presences': [{'eleve': self.eleve.id, 'statut': 'absent'}],
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Presence.objects.filter(eleve=self.eleve, classe=self.classe, statut='absent').exists())

    def test_eleve_consulte_ses_absences(self):
        Presence.objects.create(eleve=self.eleve, classe=self.classe, date=date.today(), statut='absent')
        self.authenticate(self.eleve)

        response = self.client.get('/api/presences/mes-absences/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['classe_nom'], 'A1')
        self.assertEqual(response.data[0]['statut'], 'absent')

    def test_stats_classe_calculent_taux(self):
        Presence.objects.create(eleve=self.eleve, classe=self.classe, date=date.today(), statut='present')
        self.authenticate(self.enseignant)

        response = self.client.get(f'/api/presences/stats/{self.classe.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['taux_presence'], 100)

    def test_eleve_depose_justificatif_en_attente(self):
        presence = Presence.objects.create(
            eleve=self.eleve,
            classe=self.classe,
            date=date.today(),
            statut='absent',
        )
        self.authenticate(self.eleve)
        fichier = SimpleUploadedFile('justificatif.pdf', b'pdf-content', content_type='application/pdf')

        response = self.client.post(
            f'/api/presences/{presence.id}/justificatif/',
            {'justificatif': fichier},
            format='multipart',
        )

        presence.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(presence.justificatif.name)
        self.assertIsNone(presence.justificatif_valide)
        self.assertEqual(presence.statut, 'absent')

    def test_enseignant_valide_ou_refuse_justificatif(self):
        presence = Presence.objects.create(
            eleve=self.eleve,
            classe=self.classe,
            date=date.today(),
            statut='absent',
            justificatif=SimpleUploadedFile('justificatif.pdf', b'pdf-content', content_type='application/pdf'),
        )
        self.authenticate(self.enseignant)

        response = self.client.patch(
            f'/api/presences/{presence.id}/valider-justificatif/',
            {'decision': 'valide'},
            format='json',
        )

        presence.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(presence.justificatif_valide)
        self.assertEqual(presence.statut, 'justifie')

        response = self.client.patch(
            f'/api/presences/{presence.id}/valider-justificatif/',
            {'decision': 'refuse'},
            format='json',
        )

        presence.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(presence.justificatif_valide)
        self.assertEqual(presence.statut, 'absent')
