import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import { getMesAbsences, uploadJustificatif } from '../../api/presencesService';
import '../enseignant/DashboardEnseignant.css';
import './MesAbsences.css';

const STATUT_LABEL = {
  present:  { label: 'Présent',  cls: 'badge--present'  },
  absent:   { label: 'Absent',   cls: 'badge--absent'   },
  retard:   { label: 'Retard',   cls: 'badge--retard'   },
  justifie: { label: 'Justifié', cls: 'badge--justifie' },
};

export default function MesAbsences() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [uploading, setUploading] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const fetchAbsences = () => {
    getMesAbsences()
      .then((res) => setAbsences(res.data))
      .catch(() => setError('Impossible de charger vos absences.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAbsences(); }, []);

  const total       = absences.length;
  const nbPresents  = absences.filter((a) => a.statut === 'present').length;
  const taux        = total > 0 ? Math.round((nbPresents / total) * 100) : 100;
  const tauxCls     = taux >= 80 ? 'ok' : taux >= 70 ? 'warning' : 'danger';

  const mesAbsences = absences
    .filter((a) => a.statut !== 'present')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleUploadClick = (presenceId) => {
    setUploadTarget(presenceId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploading(uploadTarget);
    try {
      await uploadJustificatif(uploadTarget, file);
      fetchAbsences();
    } catch {
      alert('Erreur lors de l\'upload. Réessayez.');
    } finally {
      setUploading(null);
      setUploadTarget(null);
      e.target.value = '';
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Mes absences</h1>
            <p className="dashboard-subtitle">Consultez votre historique et déposez vos justificatifs</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {!loading && (
          <div className="taux-card">
            <div className="taux-card__label">Mon taux de présence global</div>
            <div className="taux-bar" style={{ maxWidth: 400 }}>
              <div className="taux-bar__track">
                <div
                  className={`taux-bar__fill taux-bar__fill--${tauxCls}`}
                  style={{ width: `${taux}%` }}
                />
              </div>
              <span className={`taux-bar__label taux--${tauxCls}`}>{taux}%</span>
            </div>
            {taux < 70 && (
              <div className="alert-error" style={{ marginTop: '0.75rem' }}>
                Votre taux est inférieur à 70%. Pensez à régulariser vos absences.
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : mesAbsences.length === 0 ? (
          <div className="empty-state">
            <p>Aucune absence enregistrée.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cours / Classe</th>
                <th>Statut</th>
                <th>Justificatif</th>
              </tr>
            </thead>
            <tbody>
              {mesAbsences.map((a) => {
                const s = STATUT_LABEL[a.statut] || { label: a.statut, cls: '' };
                return (
                  <tr key={a.id} className={a.statut === 'absent' ? 'row--absent' : ''}>
                    <td>{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                    <td>{a.classe_nom}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      {a.statut === 'absent' && !a.justificatif && (
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleUploadClick(a.id)}
                          disabled={uploading === a.id}
                        >
                          {uploading === a.id ? '...' : 'Déposer'}
                        </button>
                      )}
                      {a.justificatif && (
                        <span className="badge badge--justifie">
                          {a.justificatif_valide === true  && 'Validé'}
                          {a.justificatif_valide === false && 'Refusé'}
                          {a.justificatif_valide === null  && 'En attente'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}