from django.urls import path
from .views import (
    AppelCreateView,
    PresenceDetailView,
    HistoriqueClasseView,
    MesAbsencesView,
    StatsClasseView,
    StatsGlobalesView,
    JustificatifUploadView,
    JustificatifValidationView,
    NotificationsView,
    NotificationDetailView,
)


urlpatterns = [
    path('appel/', AppelCreateView.as_view(), name='presence-appel'),
    path('<int:pk>/', PresenceDetailView.as_view(), name='presence-detail'),
    path('classe/<int:classe_id>/', HistoriqueClasseView.as_view(), name='presence-classe'),
    path('mes-absences/', MesAbsencesView.as_view(), name='presence-mes-absences'),
    path('stats/<int:classe_id>/', StatsClasseView.as_view(), name='presence-stats-classe'),
    path('stats/globales/', StatsGlobalesView.as_view(), name='presence-stats-globales'),
    path('<int:pk>/justificatif/', JustificatifUploadView.as_view(), name='presence-justificatif'),
    path('<int:pk>/valider-justificatif/', JustificatifValidationView.as_view(), name='presence-valider-justificatif'),
    path('notifications/', NotificationsView.as_view(), name='presence-notifications'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='presence-notification-detail'),
]
