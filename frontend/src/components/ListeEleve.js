function ListeEleve() {
  const eleves = [
    { nom: 'Dupont', prenom: 'Jean', date: '21/05/2026' },
    { nom: 'Mbella', prenom: 'Christelle', date: '20/05/2026' },
    { nom: 'Nguyen', prenom: 'Thomas', date: '19/05/2026' },
  ];

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

      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
        <h3 style={{ marginBottom: '1rem' }}>Liste des élèves</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#1A6B3C', color: 'white' }}>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Prénom</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Date inscription</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem' }}>{e.nom}</td>
                <td style={{ padding: '0.8rem' }}>{e.prenom}</td>
                <td style={{ padding: '0.8rem' }}>{e.date}</td>
                <td style={{ padding: '0.8rem' }}>
                  <button style={{ backgroundColor: '#e53935', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListeEleve;