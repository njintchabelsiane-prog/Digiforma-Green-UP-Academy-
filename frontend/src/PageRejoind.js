import React, { useState } from "react";
import "./PageRejoind.css";
import api from "./api/axiosConfig";

function PageRejoind() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoindre = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/classes/rejoindre/", { code_invitation: code.trim() });
      setSuccess(true);
      setTimeout(() => { window.location.href = `/classes/${res.data.id}`; }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Code invalide. Vérifiez et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon-wrap">🎓</div>
          <span className="logo-text">EduClass</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: "🏠", label: "Tableau de bord",  path: "/dashboard" },
            { icon: "👥", label: "Mes classes",       path: "/classes" },
            { icon: "📝", label: "Devoirs",           path: "/devoirs" },
            { icon: "📅", label: "Calendrier",        path: "/calendrier" },
            { icon: "💬", label: "Messages",          path: "/messages" },
            { icon: "👤", label: "Rejoindre",         path: "/rejoindre", active: true },
            { icon: "⚙️", label: "Paramètres",       path: "/parametres" },
          ].map((item) => (
            <a key={item.label} href={item.path} className={`nav-item ${item.active ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="topbar-title">Rejoindre une classe</h1>
          <div className="topbar-icons">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">👤</button>
          </div>
        </header>

        <div className="content">
          <div className="card">
            <h2 className="card-title">Rejoindre une classe</h2>
            <p className="card-subtitle">Entrez le code d'invitation fourni par votre enseignant.</p>

            <input
              className="code-input"
              type="text"
              placeholder="Code d'invitation"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoindre()}
              maxLength={9}
            />

            {error && <div className="join-error">{error}</div>}

            <button className="btn-join" onClick={handleJoindre} disabled={loading || !code.trim()}>
              {loading ? "Vérification..." : "Rejoindre"}
            </button>

            {success && (
              <div className="success-banner">
                <span className="success-icon">✓</span>
                <div>
                  <p className="success-title">Inscription réussie !</p>
                  <p className="success-sub">Redirection vers votre classe...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageRejoind;