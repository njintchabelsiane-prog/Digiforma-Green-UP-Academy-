 import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur REQUEST : injecte le token JWT automatiquement
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

// Intercepteur RESPONSE : si 401, tente un refresh automatique
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // Pas de refresh token → déconnexion forcée
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh expiré → déconnexion forcée
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;