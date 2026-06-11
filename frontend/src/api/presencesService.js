import axiosInstance from './axiosConfig';

// Appel numérique 

// Enregistrer l'appel complet d'une classe
// data = { classe: id, date: 'YYYY-MM-DD', presences: [{ eleve: id, statut: 'present|absent|retard|justifie' }] }
export const enregistrerAppel = (data) =>
  axiosInstance.post('/api/presences/appel/', data);

// Modifier un enregistrement de présence (jusqu'à 2h après)
export const modifierPresence = (id, data) =>
  axiosInstance.patch(`/api/presences/${id}/`, data);

// Historique 

// Historique des présences d'une classe (enseignant)
export const getHistoriqueClasse = (classeId, params = {}) =>
  axiosInstance.get(`/api/presences/classe/${classeId}/`, { params });

// Historique des absences de l'élève connecté
export const getMesAbsences = (params = {}) =>
  axiosInstance.get('/api/presences/mes-absences/', { params });

// Stats 

// Taux de présence par élève pour une classe
// params: { periode: 'semaine' | 'mois' | 'trimestre' }
export const getStatsClasse = (classeId, params = {}) =>
  axiosInstance.get(`/api/presences/stats/${classeId}/`, { params });

// Stats globales admin
export const getStatsGlobales = () =>
  axiosInstance.get('/api/presences/stats/globales/');

// Justificatifs 

// Uploader un justificatif pour une absence
export const uploadJustificatif = (presenceId, fichier) => {
  const formData = new FormData();
  formData.append('justificatif', fichier);
  return axiosInstance.post(`/api/presences/${presenceId}/justificatif/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Valider ou refuser un justificatif (enseignant)
export const validerJustificatif = (presenceId, decision) =>
  axiosInstance.patch(`/api/presences/${presenceId}/valider-justificatif/`, { decision });

// Notifications / Alertes 
export const getNotifications = () =>
  axiosInstance.get('/api/presences/notifications/');

export const marquerNotificationLue = (id) =>
  axiosInstance.patch(`/api/presences/notifications/${id}/`, { lue: true });