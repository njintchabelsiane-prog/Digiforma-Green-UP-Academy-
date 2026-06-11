import React, { useState, useEffect } from "react";
import "./ClassesPage.css";
import api from "./api/axiosConfig";

function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newClasse, setNewClasse] = useState({ nom: "", matiere: "" });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/classes/");
      setClasses(res.data);
    } catch (err) {
      setError("Impossible de charger les classes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newClasse.nom || !newClasse.matiere) return;
    setCreating(true);
    try {
      const res = await api.post("/classes/", newClasse);
      setClasses([...classes, res.data]);
      setShowModal(false);
      setNewClasse({ nom: "", matiere: "" });
    } catch (err) {
      setError("Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="classes-page">

      {/* ── Header ── */}
      <div className="classes-header">
        <div>
          <h1 className="classes-title">Mes classes</h1>
          <p className="classes-subtitle">
            {classes.length} classe{classes.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          + Créer une classe
        </button>
      </div>

      {error && <div className="classes-error">{error}</div>}

      {loading ? (
        <div className="classes-loading">
          <div className="spinner" />
          <p>Chargement des classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="classes-empty">
          <div className="empty-icon">📚</div>
          <p className="empty-title">Aucune classe pour l'instant</p>
          <p className="empty-sub">Créez votre première classe pour commencer</p>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            + Créer une classe
          </button>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((cls) => (
            <div key={cls.id} className="classe-card">

              <div className="card-header">
                <div className="card-avatar">
                  {cls.nom.charAt(0).toUpperCase()}
                </div>
                <div className="card-info">
                  <h3 className="card-nom">{cls.nom}</h3>
                  <span className="card-matiere">{cls.matiere}</span>
                </div>
              </div>

              <div className="card-stats">
                <div className="stat">
                  <span className="stat-value">{cls.nb_eleves ?? 0}</span>
                  <span className="stat-label">élèves</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">{cls.nb_devoirs ?? 0}</span>
                  <span className="stat-label">devoirs</span>
                </div>
              </div>

              <div className="card-code">
                <span className="code-label">Code invitation</span>
                <div className="code-row">
                  <span className="code-value">{cls.code_invitation}</span>
                  <button
                    className={`btn-copy ${copied === cls.id ? "copied" : ""}`}
                    onClick={() => copyCode(cls.code_invitation, cls.id)}
                  >
                    {copied === cls.id ? "✓" : "📋"}
                  </button>
                </div>
              </div>

              <button className="btn-voir">Voir la classe →</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nouvelle classe</h2>
            <p className="modal-subtitle">Renseignez les informations de la classe</p>

            <div className="modal-form">
              <input
                className="modal-input"
                type="text"
                placeholder="Nom de la classe (ex : Terminale B)"
                value={newClasse.nom}
                onChange={(e) => setNewClasse({ ...newClasse, nom: e.target.value })}
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Matière (ex : Mathématiques)"
                value={newClasse.matiere}
                onChange={(e) => setNewClasse({ ...newClasse, matiere: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreate}
                disabled={creating || !newClasse.nom || !newClasse.matiere}
              >
                {creating ? "Création..." : "Créer la classe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassesPage;