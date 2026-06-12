from django.urls import path
from .views import (
    ClasseListCreateView,
    ClasseDetailView,
    ClasseArchiverView,
    ClasseElevesView,
    RejoindreClasseView,
)

urlpatterns = [
    path('', ClasseListCreateView.as_view(), name='classes-list'),
    path('<int:pk>/', ClasseDetailView.as_view(), name='classe-detail'),
    path('<int:pk>/archiver/', ClasseArchiverView.as_view(), name='classe-archiver'),
    path('<int:pk>/eleves/', ClasseElevesView.as_view(), name='classe-eleves'),
    path('<int:pk>/eleves/<int:eleve_id>/', ClasseElevesView.as_view(), name='classe-eleve-retirer'),
    path('rejoindre/', RejoindreClasseView.as_view(), name='classe-rejoindre'),
]
