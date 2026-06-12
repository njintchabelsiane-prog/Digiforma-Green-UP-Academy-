import django.db.models.deletion
import presences.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('gestion_classes', '0005_classe_niveau'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Presence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('heure', models.TimeField(default=presences.models.current_time)),
                ('statut', models.CharField(choices=[('present', 'Présent'), ('absent', 'Absent'), ('retard', 'Retard'), ('justifie', 'Justifié')], default='present', max_length=20)),
                ('justificatif', models.FileField(blank=True, null=True, upload_to='justificatifs/')),
                ('justificatif_valide', models.BooleanField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('classe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='presences', to='gestion_classes.classe')),
                ('eleve', models.ForeignKey(limit_choices_to={'role': 'eleve'}, on_delete=django.db.models.deletion.CASCADE, related_name='presences', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-date', 'eleve__nom', 'eleve__prenom'],
                'unique_together': {('eleve', 'classe', 'date')},
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=255)),
                ('nb_absences', models.PositiveIntegerField(default=0)),
                ('lue', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('classe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='gestion_classes.classe')),
                ('eleve', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alertes_absence', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
