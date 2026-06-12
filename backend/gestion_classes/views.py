from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Classe, Inscription
from .serializers import ClasseSerializer, InscriptionSerializer
from users.models import User


TEMP_ELEVE_PASSWORD = 'Eleve123!'


def user_can_view_classe(user, classe):
    if user.role == 'admin' or classe.enseignant_id == user.id:
        return True
    if user.role == 'eleve':
        return Inscription.objects.filter(classe=classe, eleve=user).exists()
    return False


def user_can_manage_classe(user, classe):
    return user.role == 'admin' or classe.enseignant_id == user.id


class ClasseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        archivee = request.query_params.get('archivee', request.query_params.get('is_archived', 'false')).lower() == 'true'
        if request.user.role == 'admin':
            classes = Classe.objects.filter(is_archived=archivee)
        else:
            classes = Classe.objects.filter(enseignant=request.user, is_archived=archivee)
        serializer = ClasseSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
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


class ClasseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return None

    def get(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if not user_can_view_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ClasseSerializer(classe)
        return Response(serializer.data)

    def put(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        if classe.is_archived:
            return Response(
                {'error': 'Cette classe est archivée et accessible en lecture seule.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ClasseSerializer(classe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        classe = self.get_object(pk)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        if classe.is_archived:
            return Response(
                {'error': 'Cette classe est archivée et accessible en lecture seule.'},
                status=status.HTTP_403_FORBIDDEN
            )
        classe.delete()
        return Response({'message': 'Classe supprimée.'}, status=status.HTTP_204_NO_CONTENT)


class ClasseArchiverView(APIView):
    """Archiver ou désarchiver une classe."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        classe.is_archived = not classe.is_archived
        classe.save()
        return Response({
            'message': 'Classe archivée.' if classe.is_archived else 'Classe désarchivée.',
            'is_archived': classe.is_archived,
            'archivee': classe.is_archived,
        })


class ClasseElevesView(APIView):
    """Lister et retirer les élèves d'une classe."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

        inscriptions = Inscription.objects.filter(classe=classe).select_related('eleve')
        data = [
            {
                'id': i.eleve.id,
                'nom': i.eleve.nom,
                'prenom': i.eleve.prenom,
                'email': i.eleve.email,
                'date_inscription': i.date_inscription,
            }
            for i in inscriptions
        ]
        return Response(data)

    def post(self, request, pk):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        if classe.is_archived:
            return Response(
                {'error': 'Cette classe est archivée et accessible en lecture seule.'},
                status=status.HTTP_403_FORBIDDEN
            )

        eleves = request.data.get('eleves', [])
        if not isinstance(eleves, list) or not eleves:
            return Response(
                {'error': 'Envoyez une liste eleves avec nom, prenom et email.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        errors = []

        for index, item in enumerate(eleves, start=1):
            nom = (item.get('nom') or '').strip()
            prenom = (item.get('prenom') or '').strip()
            email = (item.get('email') or '').strip().lower()

            if not nom or not prenom or not email:
                errors.append({'ligne': index, 'error': 'Nom, prénom et email sont obligatoires.'})
                continue

            user, user_created = User.objects.get_or_create(
                email=email,
                defaults={'nom': nom, 'prenom': prenom, 'role': 'eleve'},
            )
            if user.role != 'eleve':
                errors.append({'ligne': index, 'email': email, 'error': 'Cet email appartient déjà à un autre rôle.'})
                continue

            if not user_created:
                user.nom = nom
                user.prenom = prenom
                user.save(update_fields=['nom', 'prenom'])
            else:
                user.set_password(TEMP_ELEVE_PASSWORD)
                user.save()

            inscription, inscription_created = Inscription.objects.get_or_create(
                classe=classe,
                eleve=user,
            )
            created.append({
                'id': user.id,
                'nom': user.nom,
                'prenom': user.prenom,
                'email': user.email,
                'date_inscription': inscription.date_inscription,
                'compte_cree': user_created,
                'inscription_creee': inscription_created,
            })

        status_code = status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST
        return Response({
            'eleves': created,
            'errors': errors,
            'mot_de_passe_temporaire': TEMP_ELEVE_PASSWORD,
        }, status=status_code)

    def delete(self, request, pk, eleve_id):
        try:
            classe = Classe.objects.get(pk=pk)
        except Classe.DoesNotExist:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if not user_can_manage_classe(request.user, classe):
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        if classe.is_archived:
            return Response(
                {'error': 'Cette classe est archivée et accessible en lecture seule.'},
                status=status.HTTP_403_FORBIDDEN
            )

        Inscription.objects.filter(classe=classe, eleve_id=eleve_id).delete()
        return Response({'message': 'Élève retiré.'}, status=status.HTTP_204_NO_CONTENT)


class RejoindreClasseView(APIView):
    """Un élève rejoint une classe via son code d'invitation."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'eleve':
            return Response(
                {'error': 'Seul un élève peut rejoindre une classe.'},
                status=status.HTTP_403_FORBIDDEN
            )

        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response({'detail': 'Code requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            classe = Classe.objects.get(code_invitation=code, is_archived=False)
        except Classe.DoesNotExist:
            return Response(
                {'detail': 'Code invalide ou classe introuvable.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Anti-doublon
        if Inscription.objects.filter(classe=classe, eleve=request.user).exists():
            return Response(
                {'detail': 'Vous êtes déjà inscrit(e) dans cette classe.'},
                status=status.HTTP_409_CONFLICT
            )

        Inscription.objects.create(classe=classe, eleve=request.user)
        return Response({
            'message': 'Inscription réussie.',
            'nom': classe.nom,
            'classe_id': classe.id,
        }, status=status.HTTP_201_CREATED)
