from rest_framework import serializers
from .models import Classe


class ClasseSerializer(serializers.ModelSerializer):
    # Affiche le nom de l'enseignant au lieu de juste son ID
    enseignant_nom = serializers.SerializerMethodField()

    class Meta:
        model = Classe
        fields = [
            'id',
            'nom',
            'matiere',
            'annee_scolaire',
            'enseignant',
            'enseignant_nom',
            'code_invitation',
            'created_at',
        ]
        read_only_fields = ['code_invitation', 'created_at', 'enseignant']

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.prenom} {obj.enseignant.nom}"