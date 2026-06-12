from rest_framework import serializers
from .models import Presence, Notification


class PresenceSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.SerializerMethodField()
    eleve_prenom = serializers.SerializerMethodField()
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)

    class Meta:
        model = Presence
        fields = [
            'id', 'eleve', 'eleve_nom', 'eleve_prenom', 'classe', 'classe_nom',
            'date', 'heure', 'statut', 'justificatif', 'justificatif_valide',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'heure']

    def get_eleve_nom(self, obj):
        return obj.eleve.nom

    def get_eleve_prenom(self, obj):
        return obj.eleve.prenom


class NotificationSerializer(serializers.ModelSerializer):
    eleve_nom = serializers.SerializerMethodField()
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'eleve', 'eleve_nom', 'classe', 'classe_nom', 'nb_absences', 'lue', 'created_at']

    def get_eleve_nom(self, obj):
        return f'{obj.eleve.prenom} {obj.eleve.nom}'
