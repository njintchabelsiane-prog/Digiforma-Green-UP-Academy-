from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Classe
from .serializers import ClasseSerializer


class ClasseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Un enseignant voit ses classes, un admin voit tout
        if request.user.role == 'admin':
            classes = Classe.objects.all()
        else:
            classes = Classe.objects.filter(enseignant=request.user)
        serializer = ClasseSerializer(classes, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Seul un enseignant peut créer une classe
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

    def get_object(self, pk, user):
        try:
            classe = Classe.objects.get(pk=pk)
            return classe
        except Classe.DoesNotExist:
            return None

    def get(self, request, pk):
        classe = self.get_object(pk, request.user)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClasseSerializer(classe)
        return Response(serializer.data)

    def put(self, request, pk):
        classe = self.get_object(pk, request.user)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        # Seul l'enseignant propriétaire peut modifier
        if classe.enseignant != request.user and request.user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ClasseSerializer(classe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        classe = self.get_object(pk, request.user)
        if not classe:
            return Response({'error': 'Classe introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        # Seul l'enseignant propriétaire peut supprimer
        if classe.enseignant != request.user and request.user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        classe.delete()
        return Response({'message': 'Classe supprimée.'}, status=status.HTTP_204_NO_CONTENT)  