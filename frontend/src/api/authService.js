 import axios from './axiosConfig';

// ── Gestion des tokens ──────────────────────────
export const saveToken = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// ── Appels API vers Django ──────────────────────
export const login = async (username, password) => {
  const response = await axios.post('/login/', { username, password });
  saveToken(response.data.access, response.data.refresh);
  return response.data;
};

export const logout = async () => {
  await axios.post('/logout/');
  removeToken();
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await axios.post('/refresh/', { refresh });
  saveToken(response.data.access, refresh);
  return response.data;
};

export const getMe = () => axios.get('/me/');