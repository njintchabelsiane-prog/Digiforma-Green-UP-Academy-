from django.urls import path
from .views import ClasseListCreateView, ClasseDetailView

urlpatterns = [
    path('', ClasseListCreateView.as_view(), name='classes-list'),
    path('<int:pk>/', ClasseDetailView.as_view(), name='classe-detail'),
]