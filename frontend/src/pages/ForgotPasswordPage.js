import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authService';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setSuccess(data.message);
    } catch (err) {
      if (!err.response) {
        setError('Serveur indisponible. Vérifiez que le backend Django est lancé sur le port 8000.');
      } else {
        setError(err.response.data?.detail || 'Une erreur est survenue. Réessayez.');
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
          <h2 className="form-title">Mot de passe oublié</h2>
          <p className="form-subtitle">
            Saisissez votre email : nous vous enverrons un lien pour choisir un nouveau mot de passe.
          </p>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {!success && (
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

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          <div className="back-to-login">
            <Link to="/login">← Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
