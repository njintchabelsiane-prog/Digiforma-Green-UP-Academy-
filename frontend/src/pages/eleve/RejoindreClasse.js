import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import { rejoindreClasse } from '../../api/classesService';
import '../enseignant/DashboardEnseignant.css';

export default function RejoindreClasse() {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("Entrez un code d'invitation."); return; }

    setLoading(true);
    setError('');
    try {
      const res = await rejoindreClasse(code.trim().toUpperCase());
      setSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail;
      if (err.response?.status === 400) {
        setError(msg || 'Code invalide ou classe introuvable.');
      } else if (err.response?.status === 403) {
        setError('Seul un élève peut rejoindre une classe.');
      } else if (err.response?.status === 404) {
        setError('Code invalide ou classe introuvable.');
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Rejoindre une classe</h1>
            <p className="dashboard-subtitle">Entrez le code fourni par votre enseignant</p>
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          {!success ? (
            <div style={{
              background: '#fff', borderRadius: 12,
              padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
            }}>
              {error && <div className="alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <label style={{
                  display: 'block', marginBottom: '0.5rem',
                  fontWeight: 600, color: '#1a2e1a'
                }}>
                  Code d'invitation
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex : AB12CD"
                  maxLength={6}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    fontSize: '1.4rem', letterSpacing: '0.3rem',
                    textAlign: 'center', fontWeight: 700,
                    border: '2px solid #c8e6c9', borderRadius: 8,
                    marginBottom: '1rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={loading}
                >
                  {loading ? 'Vérification...' : 'Rejoindre la classe'}
                </button>
              </form>
            </div>
          ) : (
            <div className="empty-state" style={{ border: '2px solid #c8e6c9' }}>
              <h3 style={{ color: '#1a2e1a', marginBottom: '0.5rem' }}>
                Inscription réussie ✓
              </h3>
              <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                {/* Le backend renvoie { message, classe: { nom, ... } } */}
                Vous avez rejoint <strong>{success.classe?.nom}</strong>
              </p>
              <div style={{
                display: 'flex', gap: '0.75rem',
                justifyContent: 'center', flexWrap: 'wrap'
              }}>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/dashboard/eleve')}
                >
                  Mon tableau de bord
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setSuccess(null); setCode(''); }}
                >
                  Rejoindre une autre classe
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}