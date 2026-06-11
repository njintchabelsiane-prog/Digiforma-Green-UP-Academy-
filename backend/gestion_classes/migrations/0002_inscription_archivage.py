# Migration manuelle — à placer dans gestion_classes/migrations/0002_inscription_archivage.py

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion_classes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Ajouter le champ is_archived sur Classe
        migrations.AddField(
            model_name='classe',
            name='is_archived',
            field=models.BooleanField(default=False, verbose_name='Archivée'),
        ),

        # Créer le modèle Inscription
        migrations.CreateModel(
            name='Inscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name='ID')),
                ('date_inscription', models.DateTimeField(auto_now_add=True)),
                ('eleve', models.ForeignKey(
                    limit_choices_to={'role': 'eleve'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='inscriptions',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Élève'
                )),
                ('classe', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='inscriptions',
                    to='gestion_classes.classe',
                    verbose_name='Classe'
                )),
            ],
            options={
                'verbose_name': 'Inscription',
                'verbose_name_plural': 'Inscriptions',
            },
        ),

        # Contrainte unique : un élève ne peut pas rejoindre deux fois la même classe
        migrations.AlterUniqueTogether(
            name='inscription',
            unique_together={('eleve', 'classe')},
        ),
    ]
