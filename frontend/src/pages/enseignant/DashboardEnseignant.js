import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { getClasses } from '../../api/classesService';
import { useAuth } from '../../context/AuthContext';
import './DashboardEnseignant.css';

export default function DashboardEnseignant() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getClasses()
      .then((res) => setClasses(res.data))
      .catch(() => setError('Impossible de charger les classes.'))
      .finally(() => setLoading(false));
  }, []);

  const classesActives = classes.filter((c) => !c.archivee);
  const totalEleves    = classes.reduce((acc, c) => acc + (c.nb_eleves || 0), 0);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Bonjour, {user?.prenom}</h1>
            <p className="dashboard-subtitle">Voici un résumé de vos classes</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/classes')}>
            Nouvelle classe
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{classesActives.length}</div>
            <div className="stat-label">Classes actives</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalEleves}</div>
            <div className="stat-label">Élèves au total</div>
          </div>
        </div>

        {/* Liste des classes */}
        <section className="section">
          <h2>Mes classes</h2>

          {loading && <div className="spinner-wrapper"><div className="spinner" /></div>}
          {error   && <div className="alert-error">{error}</div>}

          {!loading && !error && classesActives.length === 0 && (
            <div className="empty-state">
              <p>Vous n'avez pas encore de classe.</p>
              <button className="btn-primary" onClick={() => navigate('/classes')}>
                Créer ma première classe
              </button>
            </div>
          )}

          <div className="classes-grid">
            {classesActives.map((classe) => (
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
                  <button
                    className="btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/classes/${classe.id}/appel`); }}
                  >
                    Faire l'appel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}