import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirection selon le rôle — AC3 GUA-4
      if (user.role === 'enseignant') navigate('/dashboard/enseignant', { replace: true });
      else if (user.role === 'eleve') navigate('/dashboard/eleve',      { replace: true });
      else if (user.role === 'admin') navigate('/dashboard/admin',      { replace: true });
      else navigate('/login', { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Serveur indisponible. Vérifiez que le backend Django est lancé sur le port 8000.');
      } else {
        // AC2 GUA-4 — ne pas préciser si c'est email ou mot de passe
        setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Panneau gauche */}
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="brand-title">Green UP Academy</h1>
          <p className="brand-subtitle">Toute la vie académique, une seule plateforme</p>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="form-title">Bienvenue</h2>
          <p className="form-subtitle">Connectez-vous à votre espace</p>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                className="login-input"
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <input
                className="login-input"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="forgot-password">
              <span>Mot de passe oublié ?</span>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
