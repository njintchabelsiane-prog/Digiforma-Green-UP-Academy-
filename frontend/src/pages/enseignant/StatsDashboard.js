import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { getHistoriqueClasse, getStatsClasse, validerJustificatif } from '../../api/presencesService';
import '../enseignant/DashboardEnseignant.css';

export default function StatsDashboard() {
  const { id } = useParams();
  const [periode, setPeriode] = useState('mois');
  const [stats, setStats] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getStatsClasse(id, { periode }),
      getHistoriqueClasse(id, { periode }),
    ])
      .then(([statsRes, historiqueRes]) => {
        setStats(statsRes.data);
        setHistorique(historiqueRes.data);
      })
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [id, periode]);

  const justificatifs = historique.filter(
    (presence) => presence.justificatif && presence.justificatif_valide === null
  );

  const handleValidation = async (presenceId, decision) => {
    await validerJustificatif(presenceId, decision);
    const historiqueRes = await getHistoriqueClasse(id, { periode });
    setHistorique(historiqueRes.data);
  };

  const exportCsv = () => {
    const header = ['Élève', 'Présences', 'Absences', 'Retards', 'Taux'];
    const rows = stats.map((row) => [
      `${row.prenom} ${row.nom}`,
      row.presents,
      row.absences,
      row.retards,
      `${row.taux_presence}%`,
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stats-presences-classe-${id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Stats présences</h1>
            <p className="dashboard-subtitle">Suivi par élève</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid #c8e6c9', borderRadius: 8 }}
            >
              <option value="semaine">7 derniers jours</option>
              <option value="mois">30 derniers jours</option>
              <option value="trimestre">90 derniers jours</option>
              <option value="">Tout</option>
            </select>
            <button className="btn-secondary" onClick={exportCsv} disabled={stats.length === 0}>
              Export CSV
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : stats.length === 0 ? (
          <div className="empty-state">
            <p>Aucune donnée de présence pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Présences</th>
                <th>Absences</th>
                <th>Retards</th>
                <th>Taux</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.eleve_id} className={row.taux_presence < 70 ? 'row--absent' : ''}>
                  <td>{row.prenom} {row.nom}</td>
                  <td>{row.presents}</td>
                  <td>{row.absences}</td>
                  <td>{row.retards}</td>
                  <td><strong>{row.taux_presence}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && (
          <section className="section" style={{ marginTop: '2rem' }}>
            <h2>Justificatifs en attente</h2>
            {justificatifs.length === 0 ? (
              <div className="empty-state">
                <p>Aucun justificatif à valider.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Fichier</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {justificatifs.map((presence) => (
                    <tr key={presence.id}>
                      <td>{presence.eleve_prenom} {presence.eleve_nom}</td>
                      <td>{new Date(presence.date).toLocaleDateString('fr-FR')}</td>
                      <td>{presence.statut}</td>
                      <td>
                        <a href={presence.justificatif} target="_blank" rel="noreferrer">
                          Ouvrir
                        </a>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => handleValidation(presence.id, 'valide')}
                          >
                            Accepter
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleValidation(presence.id, 'refuse')}
                          >
                            Refuser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
