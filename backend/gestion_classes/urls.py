from django.urls import path
from .views import (
    ClasseListCreateView,
    ClasseDetailView,
    ClasseArchiverView,
    RejoindreClasseView,
    ElevesClasseView,
    RetirerEleveView,
)

urlpatterns = [
    # Classes 
    path('',                ClasseListCreateView.as_view(), name='classes-list'),
    path('<int:pk>/',       ClasseDetailView.as_view(),     name='classe-detail'),
    path('<int:pk>/archiver/', ClasseArchiverView.as_view(), name='classe-archiver'),

    #  Rejoindre (élève) 
    # IMPORTANT : 'rejoindre/' doit être avant '<int:pk>/' pour ne pas être
    # intercepté par la route dynamique
    path('rejoindre/',      RejoindreClasseView.as_view(),  name='rejoindre-classe'),

    # Élèves 
    path('<int:pk>/eleves/',              ElevesClasseView.as_view(),  name='eleves-classe'),
    path('<int:pk>/eleves/<int:eleve_id>/', RetirerEleveView.as_view(), name='retirer-eleve'),
]
