from rest_framework import serializers
from .models import Classe, Inscription

class ClasseSerializer(serializers.ModelSerializer):
    enseignant_nom = serializers.SerializerMethodField()
<<<<<<< HEAD
    nb_eleves = serializers.SerializerMethodField()  # ← AJOUTER
=======
    nb_eleves      = serializers.SerializerMethodField()
>>>>>>> 5df4d22 (feat(classes): ajout modele Inscription + archivage + endpoints rejoindre/eleves)

    class Meta:
        model  = Classe
        fields = [
            'id',
            'nom',
            'matiere',
            'annee_scolaire',
            'enseignant',
            'enseignant_nom',
            'code_invitation',
            'is_archived',
            'nb_eleves',
            'created_at',
            'nb_eleves',  # ← AJOUTER
        ]
        read_only_fields = ['code_invitation', 'created_at', 'enseignant', 'is_archived']

    def get_enseignant_nom(self, obj):
        return f"{obj.enseignant.prenom} {obj.enseignant.nom}"

<<<<<<< HEAD
    def get_nb_eleves(self, obj):  # ← AJOUTER
        return 0 
    
=======
    def get_nb_eleves(self, obj):
        return obj.inscriptions.count()


class InscriptionSerializer(serializers.ModelSerializer):
    """Sérialiseur pour afficher un élève dans la liste d'une classe"""
    eleve_id     = serializers.IntegerField(source='eleve.id',     read_only=True)
    nom          = serializers.CharField(source='eleve.nom',       read_only=True)
    prenom       = serializers.CharField(source='eleve.prenom',    read_only=True)
    email        = serializers.CharField(source='eleve.email',     read_only=True)
    date_inscription = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = Inscription
        fields = ['id', 'eleve_id', 'nom', 'prenom', 'email', 'date_inscription']
>>>>>>> 5df4d22 (feat(classes): ajout modele Inscription + archivage + endpoints rejoindre/eleves)
