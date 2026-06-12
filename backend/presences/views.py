from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gestion_classes.models import Classe, Inscription
from users.models import User
from .models import Presence, Notification
from .serializers import PresenceSerializer, NotificationSerializer


SEUIL_ABSENCES = 3


def user_can_manage_classe(user, classe):
    return user.role == 'admin' or classe.enseignant_id == user.id


def apply_period_filter(queryset, periode):
    today = timezone.localdate()
    if periode == 'semaine':
        return queryset.filter(date__gte=today - timedelta(days=7))
    if periode == 'mois':
        return queryset.filter(date__gte=today - timedelta(days=30))
    if periode == 'trimestre':
        return queryset.filter(date__gte=today - timedelta(days=90))
    return queryset


def creer_alertes_si_necessaire(presence):
    if presence.statut not in ['absent', 'retard']:
        return

    nb_absences = Presence.objects.filter(
        eleve=presence.eleve,
        classe=presence.classe,
        statut='absent',
        justificatif__isnull=True,
    ).count()

    if nb_absences < SEUIL_ABSENCES:
        return

    destinataires = [presence.classe.enseignant]
    destinataires.extend(User.objects.filter(role='admin'))
    message = (
        f'{presence.eleve.prenom} {presence.eleve.nom} a {nb_absences} '
        f'absences non justifiées en {presence.classe.nom}.'
    )

    for user in destinataires:
        Notification.objects.update_or_create(
            user=user,
            eleve=presence.eleve,
            classe=presence.classe,
            lue=False,
            defaults={'message': message, 'nb_absences': nb_absences},
        )


class AppelCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        classe_id = request.data.get('classe')
        date = request.data.get('date') or timezone.localdate()
        presences = request.data.get('presences', [])

        try:
            classe = Classe.objects.get(pk=classe_id, is_archived=False)
        except Classe.DoesNotExist:
            return Response({'detail': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        eleves_ids = set(Inscription.objects.filter(classe=classe).values_list('eleve_id', flat=True))
        saved = []

        for item in presences:
            eleve_id = item.get('eleve')
            statut_appel = item.get('statut', 'present')
            if eleve_id not in eleves_ids:
                continue
            if statut_appel not in Presence.Statut.values:
                return Response({'detail': f'Statut invalide: {statut_appel}'}, status=status.HTTP_400_BAD_REQUEST)

            presence, _ = Presence.objects.update_or_create(
                eleve_id=eleve_id,
                classe=classe,
                date=date,
                defaults={'statut': statut_appel},
            )
            creer_alertes_si_necessaire(presence)
            saved.append(presence)

        return Response(PresenceSerializer(saved, many=True).data, status=status.HTTP_201_CREATED)


class PresenceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            presence = Presence.objects.select_related('classe').get(pk=pk)
        except Presence.DoesNotExist:
            return Response({'detail': 'Présence introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, presence.classe):
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role != 'admin' and timezone.now() - presence.created_at > timedelta(hours=2):
            return Response({'detail': 'Modification impossible après 2 heures.'}, status=status.HTTP_403_FORBIDDEN)

        statut_appel = request.data.get('statut')
        if statut_appel not in Presence.Statut.values:
            return Response({'detail': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        presence.statut = statut_appel
        presence.save()
        creer_alertes_si_necessaire(presence)
        return Response(PresenceSerializer(presence).data)


class HistoriqueClasseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classe_id):
        try:
            classe = Classe.objects.get(pk=classe_id)
        except Classe.DoesNotExist:
            return Response({'detail': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        qs = Presence.objects.filter(classe=classe).select_related('eleve', 'classe')
        qs = apply_period_filter(qs, request.query_params.get('periode'))
        if request.query_params.get('date'):
            qs = qs.filter(date=request.query_params['date'])
        return Response(PresenceSerializer(qs, many=True).data)


class MesAbsencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'eleve':
            return Response({'detail': 'Réservé aux élèves.'}, status=status.HTTP_403_FORBIDDEN)
        qs = Presence.objects.filter(eleve=request.user).select_related('classe')
        qs = apply_period_filter(qs, request.query_params.get('periode'))
        return Response(PresenceSerializer(qs, many=True).data)


class StatsClasseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classe_id):
        try:
            classe = Classe.objects.get(pk=classe_id)
        except Classe.DoesNotExist:
            return Response({'detail': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        eleves = User.objects.filter(inscriptions__classe=classe, role='eleve').order_by('nom', 'prenom')
        rows = []
        for eleve in eleves:
            qs = Presence.objects.filter(classe=classe, eleve=eleve)
            qs = apply_period_filter(qs, request.query_params.get('periode'))
            total = qs.count()
            presents = qs.filter(statut='present').count()
            absences = qs.filter(statut='absent').count()
            retards = qs.filter(statut='retard').count()
            taux = round((presents / total) * 100) if total else 100
            rows.append({
                'eleve_id': eleve.id,
                'nom': eleve.nom,
                'prenom': eleve.prenom,
                'email': eleve.email,
                'total': total,
                'presents': presents,
                'absences': absences,
                'retards': retards,
                'taux_presence': taux,
            })
        return Response(rows)


class StatsGlobalesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'detail': 'Réservé aux administrateurs.'}, status=status.HTTP_403_FORBIDDEN)

        classes = Classe.objects.filter(is_archived=False).annotate(
            total=Count('presences'),
            presents=Count('presences', filter=Q(presences__statut='present')),
        )
        data = []
        for classe in classes:
            taux = round((classe.presents / classe.total) * 100) if classe.total else 100
            data.append({
                'classe_id': classe.id,
                'classe_nom': classe.nom,
                'matiere': classe.matiere,
                'total': classe.total,
                'taux_presence': taux,
            })
        return Response(sorted(data, key=lambda item: item['taux_presence']))


class JustificatifUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            presence = Presence.objects.get(pk=pk, eleve=request.user)
        except Presence.DoesNotExist:
            return Response({'detail': 'Absence introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        fichier = request.FILES.get('justificatif')
        if not fichier:
            return Response({'detail': 'Fichier requis.'}, status=status.HTTP_400_BAD_REQUEST)
        if fichier.size > 5 * 1024 * 1024:
            return Response({'detail': 'Le fichier ne doit pas dépasser 5 Mo.'}, status=status.HTTP_400_BAD_REQUEST)

        presence.justificatif = fichier
        presence.justificatif_valide = None
        if presence.statut == Presence.Statut.JUSTIFIE:
            presence.statut = Presence.Statut.ABSENT
        presence.save()
        return Response(PresenceSerializer(presence).data)


class JustificatifValidationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            presence = Presence.objects.select_related('classe').get(pk=pk)
        except Presence.DoesNotExist:
            return Response({'detail': 'Présence introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, presence.classe):
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        decision = request.data.get('decision')
        if decision not in ['valide', 'refuse', True, False]:
            return Response({'detail': 'Décision invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        presence.justificatif_valide = decision in ['valide', True]
        if presence.justificatif_valide and presence.statut == 'absent':
            presence.statut = 'justifie'
        elif not presence.justificatif_valide and presence.statut == 'justifie':
            presence.statut = 'absent'
        presence.save()
        return Response(PresenceSerializer(presence).data)


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).select_related('eleve', 'classe')
        return Response(NotificationSerializer(notifications, many=True).data)


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        notification.lue = request.data.get('lue', True)
        notification.save()
        return Response(NotificationSerializer(notification).data)
