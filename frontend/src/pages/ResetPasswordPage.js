import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmPasswordReset } from '../api/authService';
import PasswordInput from '../components/PasswordInput';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirm) {
      setError('Veuillez remplir les deux champs.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const data = await confirmPasswordReset(uid, token, password);
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
          <h2 className="form-title">Nouveau mot de passe</h2>
          <p className="form-subtitle">Au moins 8 caractères, pas uniquement des chiffres.</p>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {success ? (
            <Link className="login-btn back-to-login-btn" to="/login">Se connecter</Link>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <PasswordInput
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="input-group">
                <PasswordInput
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          )}

          {!success && (
            <div className="back-to-login">
              <Link to="/mot-de-passe-oublie">Lien expiré ? Faire une nouvelle demande</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
