import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { getClasses, createClasse, archiverClasse } from '../../api/classesService';
import './DashboardEnseignant.css';

export default function ClassesList() {
  const navigate = useNavigate();
  const [classes, setClasses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [voirArchivees, setVoirArchivees] = useState(false);
  const [form, setForm]                   = useState({
    nom: '', matiere: '', niveau: '', annee_scolaire: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);

  const fetchClasses = (archived = false) => {
    setLoading(true);
    getClasses(archived)
      .then((res) => setClasses(res.data))
      .catch(() => setError('Impossible de charger les classes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(voirArchivees); }, [voirArchivees]);

  const valider = () => {
    const e = {};
    if (!form.nom)     e.nom     = 'Le nom est obligatoire';
    if (!form.matiere) e.matiere = 'La matière est obligatoire';
    if (!form.niveau)  e.niveau  = 'Le niveau est obligatoire';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = valider();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      await createClasse(form);
      setShowForm(false);
      setForm({ nom: '', matiere: '', niveau: '', annee_scolaire: '' });
      setFormErrors({});
      fetchClasses(voirArchivees);
    } catch {
      setError('Erreur lors de la création. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiver = async (e, id) => {
    e.stopPropagation();
    try {
      await archiverClasse(id);
      fetchClasses(voirArchivees);
    } catch {
      setError("Erreur lors de l'archivage.");
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Mes classes</h1>
            <p className="dashboard-subtitle">Gérez vos classes et vos élèves</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-secondary"
              onClick={() => setVoirArchivees(!voirArchivees)}
            >
              {voirArchivees ? 'Classes actives' : 'Classes archivées'}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuler' : 'Nouvelle classe'}
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {showForm && (
          <div style={{
            background: '#fff', borderRadius: 12,
            padding: '1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1a2e1a' }}>Créer une classe</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { key: 'nom',            label: 'Nom de la classe *',  placeholder: 'Ex : Mathématiques L1' },
                  { key: 'matiere',        label: 'Matière *',           placeholder: 'Ex : Mathématiques' },
                  { key: 'niveau',         label: 'Niveau *',            placeholder: 'Ex : Licence 1' },
                  { key: 'annee_scolaire', label: 'Année scolaire',      placeholder: 'Ex : 2025-2026' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{
                      display: 'block', marginBottom: 4,
                      fontSize: '0.85rem', fontWeight: 600, color: '#333'
                    }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      style={{
                        width: '100%', padding: '0.6rem 0.75rem',
                        border: `1px solid ${formErrors[key] ? '#c62828' : '#ddd'}`,
                        borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box'
                      }}
                    />
                    {formErrors[key] && (
                      <span style={{ color: '#c62828', fontSize: '0.78rem' }}>
                        {formErrors[key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Création...' : 'Créer la classe'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <p>{voirArchivees ? 'Aucune classe archivée.' : 'Aucune classe pour le moment.'}</p>
            {!voirArchivees && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                Créer ma première classe
              </button>
            )}
          </div>
        ) : (
          <div className="classes-grid">
            {classes.map((classe) => (
              <div
                key={classe.id}
                className="classe-card"
                onClick={() => navigate(`/classes/${classe.id}`)}
              >
                <div className="classe-card__header">
                  <h3>{classe.nom}</h3>
                  <span className="classe-card__code">{classe.code_invitation}</span>
                </div>
                <div className="classe-card__meta">
                  <span>{classe.matiere}</span>
                  {classe.niveau && <span>{classe.niveau}</span>}
                </div>
                <div className="classe-card__footer">
                  <span>{classe.nb_eleves || 0} élève(s)</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Bouton Appel — uniquement si classe active */}
                    {!classe.is_archived && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/classes/${classe.id}/appel`);
                        }}
                      >
                        Appel
                      </button>
                    )}
                    <button
                      className="btn-secondary btn-sm"
                      onClick={(e) => handleArchiver(e, classe.id)}
                    >
                      {/* is_archived vient du backend */}
                      {classe.is_archived ? 'Désarchiver' : 'Archiver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}