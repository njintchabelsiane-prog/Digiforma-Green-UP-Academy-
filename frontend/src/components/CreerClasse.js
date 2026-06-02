function CreerClasse() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '200px', backgroundColor: '#1a3a5c', color: 'white', padding: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '2rem' }}>Mme Marie</p>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5rem' }}>
          <li>Mes Classes</li>
          <li>Présences</li>
          <li style={{ color: '#ff4d4d', cursor: 'pointer', marginTop: '2rem' }}>Déconnexion</li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: '3rem', backgroundColor: '#f5f5f5' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Créer une classe</h2>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nom de la classe</label>
          <input placeholder="Mathématiques" style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Matière</label>
          <input placeholder="Français" style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Niveau</label>
          <input placeholder="Licence 1" style={{ width: '100%', padding: '0.7rem', marginBottom: '2rem', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          <button style={{ width: '100%', backgroundColor: '#1A6B3C', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}>
            Créer la classe
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreerClasse;