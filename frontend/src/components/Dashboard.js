import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupère le rôle depuis le token stocké
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'enseignant';
  const prenom = user.prenom || 'Marie';

  useEffect(() => {
    axiosInstance.get('/api/classes/')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de contacter le serveur. Veuillez réessayer.');
        setLoading(false);
      });
  }, []);

  const menuEnseignant = ['Mes classes', 'Présences', 'Statistiques'];
  const menuEleve = ['Mon planning', 'Mes notes', 'Mes absences'];
  const menu = role === 'eleve' ? menuEleve : menuEnseignant;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: '#1a3a5c', color: 'white', padding: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{prenom}</p>
        <p style={{ fontSize: '0.75rem', color: '#a0b4c8', marginBottom: '2rem', textTransform: 'capitalize' }}>{role}</p>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5rem' }}>
          {menu.map((item, i) => (
            <li key={i} style={{ cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '4px' }}
              onMouseEnter={e => e.target.style.backgroundColor = '#2a4a6c'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
            >{item}</li>
          ))}
          <li style={{ color: '#ff4d4d', cursor: 'pointer', marginTop: '2rem' }}>Déconnexion</li>
        </ul>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Bonjour, {prenom} !</h2>
          {role === 'enseignant' && (
            <button style={{ backgroundColor: '#1A6B3C', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              + Créer une classe
            </button>
          )}
        </div>

        {/* Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #ccc', borderTop: '4px solid #1A6B3C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#666' }}>Chargement...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ backgroundColor: '#fdecea', border: '1px solid #f44336', padding: '1rem', borderRadius: '5px', color: '#c62828' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Cartes classes */}
        {!loading && !error && (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {classes.length === 0 ? (
              <p>Aucune classe trouvée.</p>
            ) : (
              classes.map((c, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', width: '200px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a3a5c' }}>{c.nom}</h3>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#666', fontSize: '0.85rem' }}>{c.niveau || c.matiere}</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#1A6B3C' }}>
                    👥 {c.nb_eleves ?? c.eleves?.length ?? 0} élève{(c.nb_eleves ?? c.eleves?.length ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;