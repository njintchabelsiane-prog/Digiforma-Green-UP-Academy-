from django.conf import settings
from django.db import models
from django.utils import timezone
from gestion_classes.models import Classe


def current_time():
    return timezone.localtime().time()


class Presence(models.Model):
    class Statut(models.TextChoices):
        PRESENT = 'present', 'Présent'
        ABSENT = 'absent', 'Absent'
        RETARD = 'retard', 'Retard'
        JUSTIFIE = 'justifie', 'Justifié'

    eleve = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='presences',
        limit_choices_to={'role': 'eleve'},
    )
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='presences')
    date = models.DateField()
    heure = models.TimeField(default=current_time)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.PRESENT)
    justificatif = models.FileField(upload_to='justificatifs/', blank=True, null=True)
    justificatif_valide = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('eleve', 'classe', 'date')
        ordering = ['-date', 'eleve__nom', 'eleve__prenom']

    def __str__(self):
        return f'{self.eleve} - {self.classe} - {self.date} - {self.statut}'


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    eleve = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alertes_absence')
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    nb_absences = models.PositiveIntegerField(default=0)
    lue = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.message
