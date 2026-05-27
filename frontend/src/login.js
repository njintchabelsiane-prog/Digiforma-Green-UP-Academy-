// LoginPage.jsx
import React, { useState } from "react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    // Exemple de vérification
    if (email !== "admin@gmail.com" || password !== "123456") {
      setError("Identifiants incorrects.");
      return;
    }

    setError("");
    alert("Connexion réussie !");
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
          <p className="subtitle">
            Connectez-vous à votre espace
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <a href="/" className="forgot-password">
              Mot de passe oublié
            </a>

            <button type="submit">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}