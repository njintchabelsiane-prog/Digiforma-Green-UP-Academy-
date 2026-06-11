 import axiosInstance from './axiosConfig';

// Sauvegarde des tokens 
export const saveTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!localStorage.getItem('access_token');

// Sauvegarde et lecture du profil utilisateur 
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const getRole = () => {
  const user = getUser();
  return user?.role || null;
};

//  Login : appel API + sauvegarde tokens + profil 
export const login = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login/', { email, password });
  const { access, refresh } = response.data;
  saveTokens(access, refresh);

  // Récupère le profil de l'utilisateur connecté
  const profileRes = await axiosInstance.get('/api/auth/me/');
  saveUser(profileRes.data);

  return profileRes.data; // retourne { id, nom, prenom, email, role }
};

// Logout : invalide le refresh token côté serveur 
export const logout = async () => {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await axiosInstance.post('/api/auth/logout/', { refresh });
    }
  } catch {
    // Même si ça échoue, on nettoie localement
  } finally {
    removeTokens();
  }
};

// Redirection selon le rôle 
export const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':       return '/dashboard/admin';
    case 'enseignant':  return '/dashboard/enseignant';
    case 'eleve':       return '/dashboard/eleve';
    default:            return '/login';
  }
};