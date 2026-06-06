from rest_framework import serializers
from .models import Classe

class ClasseSerializer(serializers.ModelSerializer):
    enseignant_nom = serializers.SerializerMethodField()
    nb_eleves = serializers.SerializerMethodField()  # ← AJOUTER

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
            'nb_eleves',  # ← AJOUTER
        ]
        read_only_fields = ['code_invitation', 'created_at', 'enseignant']

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.prenom} {obj.enseignant.nom}"

    def get_nb_eleves(self, obj):  # ← AJOUTER
        return 0 
    