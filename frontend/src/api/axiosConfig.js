 import axios from 'axios';

// URL de base de l'API
const API_URL = 'http://127.0.0.1:8000';

// Créer une instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : envoyer le token JWT automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
import axios from 'axios';
import { getToken } from './authService';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Intercepteur : ajoute automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = Bearer ${token};
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;