import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { getElevesClasse } from '../../api/classesService';
import { enregistrerAppel } from '../../api/presencesService';
import './DashboardEnseignant.css';
import './AppelPage.css';

const STATUTS = [
  { value: 'present',  label: 'Présent',  className: 'btn-appel--present' },
  { value: 'absent',   label: 'Absent',   className: 'btn-appel--absent'  },
  { value: 'retard',   label: 'Retard',   className: 'btn-appel--retard'  },
  { value: 'justifie', label: 'Justifié', className: 'btn-appel--justifie'},
];

export default function AppelPage() {
  const { id: classeId } = useParams();
  const navigate = useNavigate();

  const [eleves, setEleves]     = useState([]);
  const [appel, setAppel]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    getElevesClasse(classeId)
      .then((res) => {
        setEleves(res.data);
        const defaults = {};
        res.data.forEach((e) => { defaults[e.id] = 'present'; });
        setAppel(defaults);
      })
      .catch(() => setError('Impossible de charger les élèves.'))
      .finally(() => setLoading(false));
  }, [classeId]);

  const setStatut = (eleveId, statut) => {
    setAppel((prev) => ({ ...prev, [eleveId]: statut }));
  };

  const handleValider = async () => {
    setSaving(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const presences = Object.entries(appel).map(([eleve, statut]) => ({
        eleve: parseInt(eleve),
        statut,
      }));
      await enregistrerAppel({ classe: parseInt(classeId), date: today, presences });
      setSuccess(true);
      setTimeout(() => navigate(`/classes/${classeId}`), 1500);
    } catch {
      setError('Erreur lors de l\'enregistrement. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const nbAbsents = Object.values(appel).filter((s) => s === 'absent').length;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <button className="btn-back" onClick={() => navigate(`/classes/${classeId}`)}>
              Retour
            </button>
            <h1>Faire l'appel</h1>
            <p className="dashboard-subtitle">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">Appel enregistré avec succès.</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : (
          <>
            <div className="appel-summary">
              <span>Total : <strong>{eleves.length}</strong></span>
              <span className="badge badge--present">Présents : {Object.values(appel).filter(s => s === 'present').length}</span>
              <span className="badge badge--absent">Absents : {nbAbsents}</span>
              <span className="badge badge--retard">Retards : {Object.values(appel).filter(s => s === 'retard').length}</span>
            </div>

            <div className="appel-list">
              {eleves.map((eleve) => (
                <div key={eleve.id} className={`appel-row appel-row--${appel[eleve.id]}`}>
                  <div className="appel-row__name">
                    <div className="appel-row__avatar">
                      {eleve.prenom?.[0]}{eleve.nom?.[0]}
                    </div>
                    <span>{eleve.prenom} {eleve.nom}</span>
                  </div>
                  <div className="appel-row__btns">
                    {STATUTS.map((s) => (
                      <button
                        key={s.value}
                        className={`btn-appel ${s.className} ${appel[eleve.id] === s.value ? 'btn-appel--selected' : ''}`}
                        onClick={() => setStatut(eleve.id, s.value)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="appel-footer">
              <button
                className="btn-primary btn-valider"
                onClick={handleValider}
                disabled={saving || success}
              >
                {saving ? 'Enregistrement...' : 'Valider l\'appel'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}