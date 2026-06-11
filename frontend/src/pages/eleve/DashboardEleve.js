import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getMesAbsences } from '../../api/presencesService';
import './DashboardEleve.css';

export default function DashboardEleve() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [taux, setTaux]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMesAbsences()
      .then((res) => {
        const data = res.data;
        const total = data.length;
        const presents = data.filter((a) => a.statut === 'present').length;
        const t = total > 0 ? Math.round((presents / total) * 100) : 100;
        setTaux(t);
      })
      .catch(() => setTaux(null))
      .finally(() => setLoading(false));
  }, []);

  const tauxCls =
    taux === null ? '' :
    taux >= 80 ? 'taux-value--ok' :
    taux >= 70 ? 'taux-value--warning' : 'taux-value--danger';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dash-eleve">
          <h1>Bonjour, {user?.prenom} !</h1>

          <div className="taux-section">
            <h2>Mon taux de présence</h2>

            {loading ? (
              <div className="spinner-wrapper"><div className="spinner" /></div>
            ) : (
              <div className={`taux-value ${tauxCls}`}>
                {taux !== null ? `${taux}%` : '—'}
              </div>
            )}

            <button className="btn-rejoindre" onClick={() => navigate('/rejoindre')}>
              Rejoindre une classe
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}