from rest_framework import serializers
from .models import Classe, Inscription


class ClasseSerializer(serializers.ModelSerializer):
    enseignant_nom = serializers.SerializerMethodField()
    nb_eleves      = serializers.SerializerMethodField()
    archivee       = serializers.SerializerMethodField()

    class Meta:
        model  = Classe
        fields = [
            'id', 'nom', 'matiere', 'niveau', 'annee_scolaire',
            'enseignant', 'enseignant_nom',
            'code_invitation', 'is_archived', 'archivee',
            'nb_eleves', 'created_at',
        ]
        read_only_fields = ['code_invitation', 'created_at', 'enseignant']

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.prenom} {obj.enseignant.nom}"

    def get_nb_eleves(self, obj):
        return obj.inscriptions.count()

    def get_archivee(self, obj):
        return obj.is_archived


class InscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inscription
        fields = ['id', 'eleve', 'classe', 'date_inscription']
        read_only_fields = ['date_inscription']
