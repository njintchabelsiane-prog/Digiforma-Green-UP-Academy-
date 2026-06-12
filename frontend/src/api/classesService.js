import axiosInstance from './axiosConfig';

// Lister les classes (archivee=true pour voir les archivées)
export const getClasses = (archivee = false) =>
  axiosInstance.get('/api/classes/', { params: { archivee } });

export const getClasse = (id) => axiosInstance.get(`/api/classes/${id}/`);

export const createClasse = (data) => axiosInstance.post('/api/classes/', data);

export const updateClasse = (id, data) => axiosInstance.put(`/api/classes/${id}/`, data);

export const deleteClasse = (id) => axiosInstance.delete(`/api/classes/${id}/`);

export const archiverClasse = (id) => axiosInstance.post(`/api/classes/${id}/archiver/`);

export const getElevesClasse = (classeId) =>
  axiosInstance.get(`/api/classes/${classeId}/eleves/`);

export const ajouterElevesClasse = (classeId, eleves) =>
  axiosInstance.post(`/api/classes/${classeId}/eleves/`, { eleves });

export const retirerEleve = (classeId, eleveId) =>
  axiosInstance.delete(`/api/classes/${classeId}/eleves/${eleveId}/`);

export const rejoindreClasse = (code) =>
  axiosInstance.post('/api/classes/rejoindre/', { code });
