function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', backgroundColor: '#1a3a5c', color: 'white', padding: '1rem' }}>
        <p style={{ fontWeight: 'bold' }}>Mme Marie</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>Mes classes</li>
          <li style={{ marginBottom: '1rem' }}>Présences</li>
          <li style={{ marginBottom: '1rem' }}>Statistiques</li>
          <li style={{ color: 'red', cursor: 'pointer' }}>Déconnexion</li>
        </ul>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Bonjour, Marie !</h2>
          <button style={{ backgroundColor: '#1A6B3C', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            + Créer une classe
          </button>
        </div>

        {/* Cartes classes */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', width: '180px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Mathématiques</h3>
            <p>Licence 1</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', width: '180px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Français</h3>
            <p>Licence 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;