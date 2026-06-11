import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Pendant le chargement initial, on ne redirige pas encore
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Non connecté → page login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais rôle non autorisé → dashboard de son rôle
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  return children;
};

export default PrivateRoute;