import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated, login as apiLogin, logout as apiLogout, getRedirectPath } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true le temps de vérifier la session

  // Au démarrage : recharge l'utilisateur depuis localStorage si connecté
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getUser();
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await apiLogin(email, password); // appel API
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
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