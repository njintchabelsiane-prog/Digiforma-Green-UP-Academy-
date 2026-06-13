import React, { useState } from "react";
import "./PageRejoindreModifier.css";
import api from "./api/axiosConfig";

function PageRejoindre() {
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

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">Green up academy</div>
        <nav className="sidebar-nav">
          {[
            { label: "Tableau de bord",   path: "/dashboard" },
            { label: "Mes classes",        path: "/classes" },
            { label: "Devoirs",            path: "/devoirs" },
            { label: "Calendrier",         path: "/calendrier" },
            { label: "Messages",           path: "/messages" },
            { label: "Rejoindre une classe", path: "/rejoindre", active: true },
            { label: "Profil",             path: "/profil" },
            { label: "Paramètres",         path: "/parametres" },
          ].map((item) => (
            <a key={item.label} href={item.path} className={`nav-item ${item.active ? "active" : ""}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        <header className="topbar">
          <h1 className="topbar-title">Rejoindre une classe</h1>
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
                <p className="success-title">Inscription réussie !</p>
                <p className="success-sub">Redirection vers votre classe...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PageRejoindre;