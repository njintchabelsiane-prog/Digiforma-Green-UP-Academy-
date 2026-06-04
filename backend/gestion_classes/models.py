import random
import string
from django.db import models
from users.models import User


def generer_code_invitation():
    # Génère un code unique de 6 caractères (lettres + chiffres)
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Classe(models.Model):
    nom = models.CharField(max_length=100, verbose_name='Nom de la classe')
    matiere = models.CharField(max_length=100, verbose_name='Matière')
    annee_scolaire = models.CharField(max_length=9, verbose_name='Année scolaire')
    # ex: "2025-2026"

    enseignant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='classes',
        limit_choices_to={'role': 'enseignant'},
        verbose_name='Enseignant'
    )

    code_invitation = models.CharField(
        max_length=6,
        unique=True,
        default=generer_code_invitation,
        verbose_name='Code invitation'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.matiere} ({self.annee_scolaire})"

    class Meta:
        verbose_name = 'Classe'
        verbose_name_plural = 'Classes'
        