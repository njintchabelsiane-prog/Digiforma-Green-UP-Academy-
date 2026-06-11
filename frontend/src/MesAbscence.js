import React, { useState } from "react";
import "./MesAbsences.css";

const absences = [
  { id: 1, date: "15/05", cours: "Linux",                   duree: "2h", statut: "justifiee",    justificatif: true },
  { id: 2, date: "22/05", cours: "Base de données (Big Data)", duree: "2h", statut: "attente",   justificatif: false },
  { id: 3, date: "29/05", cours: "DevOps Python",           duree: "2h", statut: "non_justifiee", justificatif: false },
];

const statutLabel = {
  justifiee:     { label: "Justifiée",     className: "badge-vert" },
  attente:       { label: "En attente",    className: "badge-orange" },
  non_justifiee: { label: "Non justifiée", className: "badge-rouge" },
};

function CircleProgress({ pct }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={r} fill="none" stroke="#e8e8e8" strokeWidth="12" />
      <circle cx="80" cy="80" r={r} fill="none" stroke="#22c55e" strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        transform="rotate(-90 80 80)"
      />
      <text x="80" y="74" textAnchor="middle" fontSize="28" fontWeight="700" fill="#22c55e">{pct}%</text>
      <text x="80" y="96" textAnchor="middle" fontSize="12" fill="#888">de présence</text>
    </svg>
  );
}

function MesAbsences() {
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div className="abs-layout">

      {/* ── Sidebar ── */}
      <aside className="abs-sidebar">
        <div className="abs-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">EduDirect</span>
        </div>
        <nav className="abs-nav">
          <a href="/accueil"   className="abs-nav-item">🏠 Accueil</a>
          <a href="/cours"     className="abs-nav-item">📖 Cours</a>
          <a href="/absences"  className="abs-nav-item active">📅 Mes absences</a>
          <a href="/messages"  className="abs-nav-item">
            ✉️ Messages <span className="badge-notif">2</span>
          </a>
          <a href="/profil"    className="abs-nav-item">👤 Profil</a>
        </nav>
        <div className="abs-user">
          <div className="abs-avatar">👤</div>
          <div>
            <p className="abs-user-name">Élève</p>
            <a href="/login" className="abs-logout">Déconnexion</a>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="abs-main">

        {/* Topbar */}
        <header className="abs-topbar">
          <div />
          <div className="abs-topbar-icons">
            <div className="notif-btn">🔔<span className="notif-dot">1</span></div>
            <div className="avatar-btn">👤</div>
          </div>
        </header>

        <div className="abs-content">
          <h1 className="abs-title">Mes absences</h1>
          <p className="abs-subtitle">Consultez vos absences et déposez vos justificatifs.</p>

          {/* ── Carte taux de présence ── */}
          <div className="abs-card">
            <h2 className="card-section-title">Taux de présence</h2>
            <div className="presence-row">
              <CircleProgress pct={93} />
              <div className="presence-stats">
                <div className="presence-stat">
                  <span className="dot dot-green" />
                  <div>
                    <p className="stat-label">Présent(e)</p>
                    <p className="stat-value">162h / 174h</p>
                  </div>
                </div>
                <div className="presence-stat">
                  <span className="dot dot-red" />
                  <div>
                    <p className="stat-label">Absent(e)</p>
                    <p className="stat-value">12h / 174h</p>
                  </div>
                </div>
              </div>
              <div className="presence-trend">
                <span className="trend-icon">📈</span>
                <span className="trend-value">+2,4%</span>
                <span className="trend-sub">vs mois dernier</span>
              </div>
            </div>
          </div>

          {/* ── Carte absences ── */}
          <div className="abs-card">
            <div className="abs-card-header">
              <h2 className="card-section-title">Mes absences</h2>
              <button className="btn-deposer">⬆️ Déposer un justificatif</button>
            </div>

            <table className="abs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cours</th>
                  <th>Durée</th>
                  <th>Statut</th>
                  <th>Justificatif</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {absences.map((abs) => (
                  <tr key={abs.id}>
                    <td>{abs.date}</td>
                    <td>{abs.cours}</td>
                    <td>{abs.duree}</td>
                    <td>
                      <span className={`badge ${statutLabel[abs.statut].className}`}>
                        {statutLabel[abs.statut].label}
                      </span>
                    </td>
                    <td>
                      {abs.justificatif ? <span className="justif-icon">📄✓</span> : <span className="dash">—</span>}
                    </td>
                    <td>
                      <button className="menu-btn" onClick={() => setMenuOpen(menuOpen === abs.id ? null : abs.id)}>⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Info */}
            <div className="abs-info">
              <span className="info-icon">ℹ️</span>
              <p>Déposez votre justificatif dans les 48h suivant votre absence.<br />Un justificatif accepté rendra l'absence "justifiée".</p>
              
              <a href="/en-savoir-plus" className="info-link">En savoir plus</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MesAbsences;