import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath } from '../api/authService';
import '../login.css';

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
      // Redirige vers le dashboard du rôle
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err) {
      // On ne précise pas si c'est l'email ou le mot de passe (AC2 GUA-4)
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Partie gauche */}
      <div className="left-panel">
        <h1>Green UP Academy</h1>
        <p>Toute la vie académique, une seule plateforme</p>
      </div>

      {/* Partie droite */}
      <div className="right-panel">
        <div className="form-box">
          <h2>Bienvenue</h2>
          <p className="subtitle">Connectez-vous à votre espace</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />

            <a href="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </a>

            <button type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}