from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion_classes', '0004_rename_archivee_classe_is_archived_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='classe',
            name='niveau',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='Niveau'),
        ),
        migrations.AlterField(
            model_name='classe',
            name='annee_scolaire',
            field=models.CharField(blank=True, default='', max_length=9, verbose_name='Année scolaire'),
        ),
    ]
