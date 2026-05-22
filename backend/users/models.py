from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):

    def create_user(self, email, nom, prenom, role, password=None):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, nom=nom, prenom=prenom, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nom, prenom, role, password=None):
        user = self.create_user(email, nom, prenom, role, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN      = 'admin',      'Administrateur'
        ENSEIGNANT = 'enseignant', 'Enseignant'
        ELEVE      = 'eleve',      'Élève'

    username = None
    email    = models.EmailField(unique=True, verbose_name="Email")
    nom      = models.CharField(max_length=100, verbose_name="Nom")
    prenom   = models.CharField(max_length=100, verbose_name="Prénom")
    role     = models.CharField(
                   max_length=20,
                   choices=Role.choices,
                   default=Role.ELEVE,
                   verbose_name="Rôle"
               )

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'role']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.role})"

    class Meta:
        verbose_name        = "Utilisateur"
        verbose_name_plural = "Utilisateurs"