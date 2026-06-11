import random
import string
from django.db import models
from users.models import User


def generer_code_invitation():
    """Génère un code unique de 6 caractères (lettres majuscules + chiffres)"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Classe(models.Model):
    nom            = models.CharField(max_length=100, verbose_name='Nom de la classe')
    matiere        = models.CharField(max_length=100, verbose_name='Matière')
    annee_scolaire = models.CharField(max_length=9,   verbose_name='Année scolaire')

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

    # ── Archivage ────────────────────────────────────────────
    is_archived = models.BooleanField(default=False, verbose_name='Archivée')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.matiere} ({self.annee_scolaire})"

    class Meta:
<<<<<<< HEAD
        verbose_name = 'Classe'
        verbose_name_plural = 'Classes'
        
=======
        verbose_name        = 'Classe'
        verbose_name_plural = 'Classes'


class Inscription(models.Model):
    """Liaison élève ↔ classe via code d'invitation"""

    eleve  = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='inscriptions',
        limit_choices_to={'role': 'eleve'},
        verbose_name='Élève'
    )
    classe = models.ForeignKey(
        Classe,
        on_delete=models.CASCADE,
        related_name='inscriptions',
        verbose_name='Classe'
    )
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Inscription'
        verbose_name_plural = 'Inscriptions'
        # Un élève ne peut pas rejoindre deux fois la même classe
        unique_together = ('eleve', 'classe')

    def __str__(self):
        return f"{self.eleve} → {self.classe}"
>>>>>>> 5df4d22 (feat(classes): ajout modele Inscription + archivage + endpoints rejoindre/eleves)
