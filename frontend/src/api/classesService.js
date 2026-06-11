import axiosInstance from './axiosConfig';

// Classes 

// Lister les classes — archived=true pour voir les archivées
export const getClasses = (archived = false) =>
  axiosInstance.get(`/api/classes/?archived=${archived}`);

// Détail d'une classe
export const getClasse = (id) => axiosInstance.get(`/api/classes/${id}/`);

// Créer une classe
export const createClasse = (data) => axiosInstance.post('/api/classes/', data);

// Modifier une classe
export const updateClasse = (id, data) => axiosInstance.put(`/api/classes/${id}/`, data);

// Supprimer une classe
export const deleteClasse = (id) => axiosInstance.delete(`/api/classes/${id}/`);

// Archiver / désarchiver (toggle)
export const archiverClasse = (id) => axiosInstance.post(`/api/classes/${id}/archiver/`);

//  Élèves d'une classe 

// Lister les élèves d'une classe
export const getElevesClasse = (classeId) =>
  axiosInstance.get(`/api/classes/${classeId}/eleves/`);

// Retirer un élève d'une classe
export const retirerEleve = (classeId, eleveId) =>
  axiosInstance.delete(`/api/classes/${classeId}/eleves/${eleveId}/`);

// Rejoindre une classe (côté élève) 

export const rejoindreClasse = (code) =>
  axiosInstance.post('/api/classes/rejoindre/', { code });