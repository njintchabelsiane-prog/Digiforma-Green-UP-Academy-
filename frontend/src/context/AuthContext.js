import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated, login as apiLogin, logout as apiLogout, getRedirectPath } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true le temps de vérifier la session

  // Au démarrage : recharge l'utilisateur depuis localStorage si connecté
  useEffect(() => {
    // vérifie si un access_token est présent dans le localStorage et récupère le profil utilisateur
    if (isAuthenticated()) {
      // Récupère le profil utilisateur depuis le localStorage
      const storedUser = getUser();
      //Injecte l'utilisateur dans l'etat global React
      setUser(storedUser);
    }
    // Fin du chargement initial
    setLoading(false);
  }, []);

  const login = async (email, password) => {// Appel API pour se connecter et récupérer le profil utilisateur
    const userData = await apiLogin(email, password); // appel API
    setUser(userData);// Met à jour l'état global avec le profil utilisateur
    return userData;
  };

  const logout = async () => {// Appel API pour se déconnecter et nettoyer l'état global
    await apiLogout();// Appel API pour se déconnecter côté serveur
    setUser(null);// Nettoie l'état global
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
    redirectPath: user ? getRedirectPath(user.role) : '/login',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};