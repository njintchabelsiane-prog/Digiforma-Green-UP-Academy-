import React, { useState } from "react";
import "./PageAppel.css";
import api from "./api/axiosConfig";

const eleves = [
  { id: 1, nom: "Lucas Andre" },
  { id: 2, nom: "Inès Benali" },
  { id: 3, nom: "Hugo Bertrand" },
  { id: 4, nom: "Clémence Bonnet" },
  { id: 5, nom: "Yassine Cherifi" },
];

function AppelClasse() {
  const [presences, setPresences] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric"
  });

  const setStatut = (id, statut) => {
    setPresences((prev) => ({ ...prev, [id]: statut }));
  };

  const handleValider = async () => {
    setSaving(true);
    try {
      await api.post("/presences/", { presences });
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="appel-page">
      <div className="appel-card">

        {/* ── Header ── */}
        <div className="appel-header">
          <div className="appel-header-left">
            <span className="appel-icon">👥</span>
            <div>
              <h1 className="appel-title">Appel de la classe</h1>
              <p className="appel-sub">Niveau 3• M. Dupont</p>
            </div>
          </div>
          <div className="appel-date">
            <span className="date-icon">📅</span>
            <span>{today}</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="appel-table">
          <div className="table-header">
            <span className="col-eleve">Élève</span>
            <span className="col-present">Présent</span>
            <span className="col-retard">En retard</span>
            <span className="col-absent">Absent</span>
          </div>

          {eleves.map((eleve, index) => (
            <div key={eleve.id} className="table-row">
              <span className="col-eleve">
                <span className="eleve-num">{index + 1}.</span>
                {eleve.nom}
              </span>
              <span className="col-present">
                <button
                  className={`btn-statut btn-present ${presences[eleve.id] === "present" ? "active" : ""}`}
                  onClick={() => setStatut(eleve.id, "present")}
                >
                  Présent
                </button>
              </span>
              <span className="col-retard">
                <button
                  className={`btn-statut btn-retard ${presences[eleve.id] === "retard" ? "active" : ""}`}
                  onClick={() => setStatut(eleve.id, "retard")}
                >
                  En retard
                </button>
              </span>
              <span className="col-absent">
                <button
                  className={`btn-statut btn-absent ${presences[eleve.id] === "absent" ? "active" : ""}`}
                  onClick={() => setStatut(eleve.id, "absent")}
                >
                  Absent
                </button>
              </span>
            </div>
          ))}
        </div>

        {/* ── Bouton valider ── */}
        <button className="btn-valider" onClick={handleValider} disabled={saving}>
          {saved ? "✓ Appel validé !" : saving ? "Enregistrement..." : "✓ Valider l'appel"}
        </button>

        {/* ── Légende ── */}
        <div className="legende">
          <span><span className="dot dot-green" /> Présent</span>
          <span><span className="dot dot-orange" /> En retard</span>
          <span><span className="dot dot-red" /> Absent</span>
        </div>

      </div>
    </div> 
  );
}

export default AppelClasse;

