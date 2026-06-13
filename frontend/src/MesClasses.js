import React, { useState, useEffect } from "react";
import "./MesClasses.css";

function MesClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClasse, setNewClasse] = useState({ nom: "", matiere: "" });
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    setClasses([
      { id: 1, nom: "Niveau 3", matiere: "Mathématiques", nb_eleves: 28, code_invitation: "MATH-NIV3-7X9B" },
      { id: 2, nom: "Niveau 2", matiere: "Français",      nb_eleves: 24, code_invitation: "FRAN-NIV2-4K2M" },
    ]);
    setLoading(false);
  }, []);

  const handleCreate = () => {
    if (!newClasse.nom || !newClasse.matiere) return;
    const newItem = {
      id: classes.length + 1,
      nom: newClasse.nom,
      matiere: newClasse.matiere,
      nb_eleves: 0,
      code_invitation: `${newClasse.nom.slice(0,4).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
    };
    setClasses([...classes, newItem]);
    setShowModal(false);
    setNewClasse({ nom: "", matiere: "" });
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Green up academy</div>
        <nav className="sidebar-nav">
          {[
            { label: "Accueil",     path: "/accueil" },
            { label: "Mes classes", path: "/classes", active: true },
            { label: "Devoirs",     path: "/devoirs" },
            { label: "Élèves",      path: "/eleves" },
            { label: "Messages",    path: "/messages" },
            { label: "Ressources",  path: "/ressources" },
            { label: "Paramètres",  path: "/parametres" },
          ].map((item) => (
            <a key={item.label} href={item.path} className={`nav-item ${item.active ? "active" : ""}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="main-header">
          <div>
            <h1 className="main-title">Mes classes</h1>
            <p className="main-subtitle">Retrouvez ici toutes vos classes.</p>
          </div>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            Créer une classe
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="classes-list">
            {classes.map((cls) => (
              <div key={cls.id} className="classe-card">
                <div className="card-top">
                  <div className="card-avatar">
                    <span>{cls.nom}</span>
                  </div>
                  <div className="card-info">
                    <h2 className="card-nom">{cls.nom}</h2>
                    <p className="card-matiere">{cls.matiere}</p>
                    <p className="card-eleves">
                      <strong>{cls.nb_eleves}</strong> élèves
                    </p>
                  </div>
                </div>

                <div className="card-divider" />

                <div className="card-code-row">
                  <span className="code-label">Code invitation</span>
                  <div className="code-box">
                    <span className="code-value">{cls.code_invitation}</span>
                    <button className="btn-copy" onClick={() => copyCode(cls.code_invitation, cls.id)}>
                      {copied === cls.id ? "✓" : "⧉"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Créer une classe</h2>
            <input className="modal-input" type="text" placeholder="Nom de la classe" value={newClasse.nom} onChange={(e) => setNewClasse({ ...newClasse, nom: e.target.value })} />
            <input className="modal-input" type="text" placeholder="Matière" value={newClasse.matiere} onChange={(e) => setNewClasse({ ...newClasse, matiere: e.target.value })} />
            <div className="modal-actions">
              <button className="btn-annuler" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-confirmer" onClick={handleCreate}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesClasses;