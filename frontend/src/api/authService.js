 // Sauvegarder le token après connexion
export const saveToken = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

// Récupérer le token
export const getToken = () => {
  return localStorage.getItem('access_token');
};

// Supprimer le token à la déconnexion
export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};
