from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):

    def create_user(self, email, nom, prenom, role, password=None):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user  = self.model(email=email, nom=nom, prenom=prenom, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nom, prenom, role='admin', password=None):
        user = self.create_user(email, nom, prenom, role, password)
        user.is_staff     = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
