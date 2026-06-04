import React, { useState } from "react";
import "./LoginPage.css";
import { login, saveToken } from "./api/authService";  // chemin exact
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      saveToken(data.access, data.refresh);
      // Redirection selon le rôle
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.detail || "Identifiants incorrects. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* ── Panneau gauche ── */}
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="brand-title">Green UP Academy</h1>
          <p className="brand-subtitle">Toute la vie académique, une seule plateforme</p>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="form-title">Bienvenue</h2>
          <p className="form-subtitle">Connectez-vous à votre espace</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                autoComplete="current-password"
              />
              <div className="forgot-password">
                <a href="/mot-de-passe-oublie">Mot de passe oublié</a>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;