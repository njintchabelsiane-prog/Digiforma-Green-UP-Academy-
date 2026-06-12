import random
import string
from django.db import models
from users.models import User


def generer_code_invitation():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Classe(models.Model):
    nom             = models.CharField(max_length=100, verbose_name='Nom de la classe')
    matiere         = models.CharField(max_length=100, verbose_name='Matière')
    niveau          = models.CharField(max_length=100, verbose_name='Niveau', blank=True, default='')
    annee_scolaire  = models.CharField(max_length=9, verbose_name='Année scolaire', blank=True, default='')

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

    is_archived = models.BooleanField(default=False, verbose_name='Archivée')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.matiere}"

    class Meta:
        verbose_name        = 'Classe'
        verbose_name_plural = 'Classes'


class Inscription(models.Model):
    eleve             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscriptions', limit_choices_to={'role': 'eleve'}, verbose_name='Élève')
    classe            = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='inscriptions', verbose_name='Classe')
    date_inscription  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together     = ('eleve', 'classe')
        verbose_name        = 'Inscription'
        verbose_name_plural = 'Inscriptions'

    def __str__(self):
        return f"{self.eleve} → {self.classe}"
