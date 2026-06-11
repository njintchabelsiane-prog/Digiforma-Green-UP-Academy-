from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Classe, Inscription
from .serializers import ClasseSerializer, InscriptionSerializer


# ─────────────────────────────────────────────────────────────
# CLASSES — Liste & Création
# ─────────────────────────────────────────────────────────────

class ClasseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET /api/classes/
        - Admin       → toutes les classes
        - Enseignant  → ses propres classes (actives par défaut)
        - Elève       → les classes où il est inscrit
        Query param : ?archived=true pour inclure les archivées
        """
        archived = request.query_params.get('archived', 'false').lower() == 'true'

        if request.user.role == 'admin':
            classes = Classe.objects.all() if archived else Classe.objects.filter(is_archived=False)

        elif request.user.role == 'enseignant':
            classes = Classe.objects.filter(enseignant=request.user) if archived \
                      else Classe.objects.filter(enseignant=request.user, is_archived=False)

        else:  # élève
            inscriptions = Inscription.objects.filter(eleve=request.user).select_related('classe')
            classes = [i.classe for i in inscriptions]
            if not archived:
                classes = [c for c in classes if not c.is_archived]

        serializer = ClasseSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
        """POST /api/classes/ — Créer une classe (enseignant ou admin uniquement)"""
        if request.user.role not in ['enseignant', 'admin']:
            return Response(
                {'error': 'Seul un enseignant peut créer une classe.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ClasseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(enseignant=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# CLASSES — Détail, Modification, Suppression
# ─────────────────────────────────────────────────────────────

class ClasseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return None

    def _check_owner(self, classe, user):
        """Vérifie que l'utilisateur est le propriétaire ou un admin"""
        return classe.enseignant == user or user.role == 'admin'

    def get(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClasseSerializer(classe)
        return Response(serializer.data)

    def put(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if not self._check_owner(classe, request.user):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ClasseSerializer(classe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if not self._check_owner(classe, request.user):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        classe.delete()
        return Response({'message': 'Classe supprimée.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────
# ARCHIVER / DÉSARCHIVER
# ─────────────────────────────────────────────────────────────

class ClasseArchiverView(APIView):
    """POST /api/classes/{id}/archiver/ — toggle archivage"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if classe.enseignant != request.user and request.user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        # Toggle : archivée → désarchivée et inversement
        classe.is_archived = not classe.is_archived
        classe.save()

        etat = 'archivée' if classe.is_archived else 'désarchivée'
        return Response({
            'message':     f'Classe {etat} avec succès.',
            'is_archived': classe.is_archived,
        })


# ─────────────────────────────────────────────────────────────
# REJOINDRE UNE CLASSE (côté élève)
# ─────────────────────────────────────────────────────────────

class RejoindreClasseView(APIView):
    """POST /api/classes/rejoindre/ — un élève rejoint une classe via son code"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Seul un élève peut rejoindre une classe
        if request.user.role != 'eleve':
            return Response(
                {'error': 'Seul un élève peut rejoindre une classe.'},
                status=status.HTTP_403_FORBIDDEN
            )

        code = request.data.get('code', '').strip().upper()

        if not code:
            return Response(
                {'error': 'Le code d\'invitation est obligatoire.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que la classe existe et est active
        try:
            classe = Classe.objects.get(code_invitation=code, is_archived=False)
        except Classe.DoesNotExist:
            return Response(
                {'error': 'Code invalide ou classe introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que l'élève n'est pas déjà inscrit
        if Inscription.objects.filter(eleve=request.user, classe=classe).exists():
            return Response(
                {'error': f'Tu es déjà inscrit(e) dans la classe "{classe.nom}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer l'inscription
        inscription = Inscription.objects.create(eleve=request.user, classe=classe)

        return Response({
            'message': f'Tu as rejoint la classe "{classe.nom}" avec succès.',
            'classe':  ClasseSerializer(classe).data,
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────
# ÉLÈVES D'UNE CLASSE
# ─────────────────────────────────────────────────────────────

class ElevesClasseView(APIView):
    """
    GET    /api/classes/{id}/eleves/          — liste les élèves
    DELETE /api/classes/{id}/eleves/{eleve_id}/ — retire un élève
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # Seul l'enseignant de la classe ou un admin peut voir la liste
        if classe.enseignant != request.user and request.user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        inscriptions = Inscription.objects.filter(classe=classe).select_related('eleve')
        serializer   = InscriptionSerializer(inscriptions, many=True)
        return Response(serializer.data)


class RetirerEleveView(APIView):
    """DELETE /api/classes/{pk}/eleves/{eleve_id}/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, eleve_id):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if classe.enseignant != request.user and request.user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            inscription = Inscription.objects.get(classe=classe, eleve__id=eleve_id)
        except Inscription.DoesNotExist:
            return Response({'error': 'Élève non inscrit dans cette classe.'}, status=status.HTTP_404_NOT_FOUND)

        inscription.delete()
        return Response({'message': 'Élève retiré de la classe.'}, status=status.HTTP_204_NO_CONTENT)
