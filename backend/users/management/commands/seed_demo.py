from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from gestion_classes.models import Classe, Inscription


DEMO_PASSWORD = 'Test1234!'


class Command(BaseCommand):
    help = 'Cree les comptes et donnees de demo Green UP Academy.'

    def handle(self, *args, **options):
        User = get_user_model()

        users = [
            {
                'email': 'admin@greenup.test',
                'nom': 'Green',
                'prenom': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'email': 'prof@test.com',
                'nom': 'Dupont',
                'prenom': 'Marie',
                'role': 'enseignant',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'email': 'eleve@test.com',
                'nom': 'Martin',
                'prenom': 'Paul',
                'role': 'eleve',
                'is_staff': False,
                'is_superuser': False,
            },
        ]

        created_users = {}
        for data in users:
            user, _ = User.objects.update_or_create(
                email=data['email'],
                defaults={
                    'nom': data['nom'],
                    'prenom': data['prenom'],
                    'role': data['role'],
                    'is_staff': data['is_staff'],
                    'is_superuser': data['is_superuser'],
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            created_users[data['email']] = user

        classe, _ = Classe.objects.get_or_create(
            nom='Mathématiques L1',
            enseignant=created_users['prof@test.com'],
            defaults={
                'matiere': 'Mathématiques',
                'niveau': 'Licence 1',
                'annee_scolaire': '2025-2026',
            },
        )
        Inscription.objects.get_or_create(
            classe=classe,
            eleve=created_users['eleve@test.com'],
        )

        self.stdout.write(self.style.SUCCESS('Donnees de demo pretes.'))
        self.stdout.write('Comptes:')
        self.stdout.write(f"  admin@greenup.test / {DEMO_PASSWORD}")
        self.stdout.write(f"  prof@test.com / {DEMO_PASSWORD}")
        self.stdout.write(f"  eleve@test.com / {DEMO_PASSWORD}")
