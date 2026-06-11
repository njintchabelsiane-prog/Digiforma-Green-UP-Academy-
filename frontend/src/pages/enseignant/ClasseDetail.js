import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { getClasse, getElevesClasse, retirerEleve } from '../../api/classesService';
import './DashboardEnseignant.css';

export default function ClasseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classe, setClasse]   = useState(null);
  const [eleves, setEleves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tri, setTri]         = useState('nom'); // 'nom' | 'date'

  const fetchData = () => {
    setLoading(true);
    Promise.all([getClasse(id), getElevesClasse(id)])
      .then(([classeRes, elevesRes]) => {
        setClasse(classeRes.data);
        setEleves(elevesRes.data);
      })
      .catch(() => setError('Impossible de charger les données de la classe.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRetirer = async (eleveId, nomComplet) => {
    if (!window.confirm(`Retirer ${nomComplet} de cette classe ?`)) return;
    try {
      await retirerEleve(id, eleveId);
      fetchData();
    } catch {
      alert('Erreur lors du retrait de l\'élève.');
    }
  };

  const elevesTries = [...eleves].sort((a, b) => {
    if (tri === 'nom') return a.nom.localeCompare(b.nom);
    return new Date(a.date_inscription) - new Date(b.date_inscription);
  });

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/classes')}>
              Retour
            </button>
            {classe && (
              <>
                <h1>{classe.nom}</h1>
                <p className="dashboard-subtitle">
                  {classe.matiere} {classe.niveau && `· ${classe.niveau}`} · Code : {classe.code_invitation}
                </p>
              </>
            )}
          </div>
          {classe && !classe.archivee && (
            <button className="btn-primary" onClick={() => navigate(`/classes/${id}/appel`)}>
              Faire l'appel
            </button>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : (
          <section className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Élèves inscrits ({eleves.length})</h2>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#555', marginRight: '0.5rem' }}>Trier par :</label>
                <select
                  value={tri}
                  onChange={(e) => setTri(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.85rem' }}
                >
                  <option value="nom">Nom</option>
                  <option value="date">Date d'inscription</option>
                </select>
              </div>
            </div>

            {eleves.length === 0 ? (
              <div className="empty-state">
                <p>Aucun élève inscrit pour le moment.</p>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>
                  Partagez le code <strong>{classe?.code_invitation}</strong> avec vos élèves pour qu'ils rejoignent la classe.
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Date d'inscription</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {elevesTries.map((eleve) => (
                    <tr key={eleve.id}>
                      <td>{eleve.nom}</td>
                      <td>{eleve.prenom}</td>
                      <td>{eleve.email}</td>
                      <td>{new Date(eleve.date_inscription).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleRetirer(eleve.id, `${eleve.prenom} ${eleve.nom}`)}
                        >
                          Retirer
                        </button>
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