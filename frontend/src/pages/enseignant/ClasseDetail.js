import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import {
  ajouterElevesClasse,
  archiverClasse,
  getClasse,
  getElevesClasse,
  retirerEleve,
} from '../../api/classesService';
import './DashboardEnseignant.css';

export default function ClasseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classe, setClasse]   = useState(null);
  const [eleves, setEleves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tri, setTri]         = useState('nom');
  const [bulkEleves, setBulkEleves] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getClasse(id), getElevesClasse(id)])
      .then(([classeRes, elevesRes]) => {
        setClasse(classeRes.data);
        setEleves(elevesRes.data);
      })
      .catch(() => setError('Impossible de charger les données de la classe.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRetirer = async (eleveId, nomComplet) => {
    if (!window.confirm(`Retirer ${nomComplet} de cette classe ?`)) return;
    try {
      await retirerEleve(id, eleveId);
      fetchData();
    } catch {
      alert("Erreur lors du retrait de l'élève.");
    }
  };

  const handleArchiver = async () => {
    const action = classe?.is_archived ? 'désarchiver' : 'archiver';
    if (!window.confirm(`Voulez-vous ${action} cette classe ?`)) return;

    try {
      const res = await archiverClasse(id);
      setClasse((current) => ({
        ...current,
        is_archived: res.data.is_archived,
        archivee: res.data.archivee,
      }));
    } catch {
      alert(`Erreur lors de l'action ${action}.`);
    }
  };

  const parseEleves = () => bulkEleves
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes(';')
        ? line.split(';').map((part) => part.trim())
        : line.split(/\s+/);
      const email = parts[parts.length - 1] || '';
      const prenom = parts[parts.length - 2] || '';
      const nom = parts.slice(0, -2).join(' ');
      return { nom, prenom, email };
    });

  const handleAjouterEleves = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const elevesAEnvoyer = parseEleves();
    if (elevesAEnvoyer.length === 0) {
      setError('Ajoutez au moins une ligne élève.');
      return;
    }

    setAdding(true);
    try {
      const res = await ajouterElevesClasse(id, elevesAEnvoyer);
      setBulkEleves('');
      setSuccess(
        `${res.data.eleves.length} élève(s) ajouté(s). Mot de passe temporaire : ${res.data.mot_de_passe_temporaire}`
      );
      fetchData();
    } catch (err) {
      const apiError = err.response?.data?.error || "Erreur lors de l'ajout des élèves.";
      setError(apiError);
    } finally {
      setAdding(false);
    }
  };

  const elevesTries = [...eleves].sort((a, b) => {
    if (tri === 'nom') {
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr');
    }
    return new Date(b.date_inscription) - new Date(a.date_inscription);
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
                  {classe.matiere}
                  {classe.niveau && ` · ${classe.niveau}`}
                  {' · '}Code : <strong>{classe.code_invitation}</strong>
                </p>
              </>
            )}
          </div>
          {classe && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/classes/${id}/stats`)}
              >
                Stats
              </button>
              {!classe.is_archived && (
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/classes/${id}/appel`)}
                >
                  Faire l'appel
                </button>
              )}
              <button
                className={classe.is_archived ? 'btn-secondary' : 'btn-danger'}
                onClick={handleArchiver}
              >
                {classe.is_archived ? 'Désarchiver' : 'Archiver'}
              </button>
            </div>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
        {classe?.is_archived && (
          <div className="alert-success">
            Cette classe est archivée. Ses données restent consultables en lecture seule.
          </div>
        )}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : (
          <section className="section">
            {!classe?.is_archived && (
              <form className="inline-form" onSubmit={handleAjouterEleves}>
                <div>
                  <h2>Ajouter plusieurs élèves</h2>
                  <p className="dashboard-subtitle">
                    Une ligne par élève : Nom Prénom email, ou Nom;Prénom;email
                  </p>
                </div>
                <textarea
                  className="bulk-textarea"
                  value={bulkEleves}
                  onChange={(e) => setBulkEleves(e.target.value)}
                  placeholder={'Mbarga Alice alice.mbarga@test.com\nNkoa;Paul;paul.nkoa@test.com'}
                  rows={4}
                />
                <button className="btn-primary" type="submit" disabled={adding}>
                  {adding ? 'Ajout...' : 'Ajouter les élèves'}
                </button>
              </form>
            )}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem'
            }}>
              <h2 style={{ margin: 0 }}>Élèves inscrits ({eleves.length})</h2>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#555', marginRight: '0.5rem' }}>
                  Trier par :
                </label>
                <select
                  value={tri}
                  onChange={(e) => setTri(e.target.value)}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: 6,
                    border: '1px solid #ddd', fontSize: '0.85rem'
                  }}
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
                  Partagez le code <strong>{classe?.code_invitation}</strong> avec vos élèves.
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
                      <td>
                        {new Date(eleve.date_inscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        {!classe?.is_archived && (
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() =>
                              handleRetirer(eleve.id, `${eleve.prenom} ${eleve.nom}`)
                            }
                          >
                            Retirer
                          </button>
                        )}
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
