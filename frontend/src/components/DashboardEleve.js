function DashboardEleve() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '200px', backgroundColor: '#1a3a5c', color: 'white', padding: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '2rem' }}>Jean</p>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5rem' }}>
          <li>Mes Classes</li>
          <li>Mes Absences</li>
          <li style={{ color: '#ff4d4d', cursor: 'pointer', marginTop: '2rem' }}>Déconnexion</li>
        </ul>
      </div>

      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        <h2>Bonjour, Jean !</h2>
        <p style={{ marginTop: '1.5rem' }}>Mon taux de présence</p>
        <p style={{ fontSize: '3rem', color: '#1A6B3C', fontWeight: 'bold', margin: '0.5rem 0' }}>85%</p>
        <button style={{
          backgroundColor: '#1A6B3C',
          color: 'white',
          padding: '0.6rem 1.2rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}>
          Rejoindre une classe
        </button>
      </div>
    </div>
  );
}

export default DashboardEleve;
