import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import { getStatsGlobales } from '../../api/presencesService';
import { createUser, getUsers, updateUser } from '../../api/usersService';
import '../enseignant/DashboardEnseignant.css';

export default function DashboardAdmin() {
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', role: 'eleve' });

  useEffect(() => {
    getStatsGlobales()
      .then((res) => setStats(res.data))
      .catch(() => setError('Impossible de charger les statistiques globales.'))
      .finally(() => setLoading(false));
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setUsersLoading(true);
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setUserMessage('Impossible de charger les utilisateurs.'))
      .finally(() => setUsersLoading(false));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setUserMessage('');
    try {
      const res = await createUser(form);
      setForm({ prenom: '', nom: '', email: '', role: 'eleve' });
      setUserMessage(`Compte créé. Mot de passe temporaire : ${res.data.mot_de_passe_temporaire}`);
      fetchUsers();
    } catch (err) {
      setUserMessage(err.response?.data?.detail || 'Création impossible.');
    }
  };

  const toggleActive = async (user) => {
    await updateUser(user.id, { is_active: !user.is_active });
    fetchUsers();
  };

  const moyenne = stats.length
    ? Math.round(stats.reduce((acc, row) => acc + row.taux_presence, 0) / stats.length)
    : 100;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Admin</h1>
            <p className="dashboard-subtitle">Vue globale des présences</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.length}</div>
            <div className="stat-label">Classes suivies</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{moyenne}%</div>
            <div className="stat-label">Taux moyen</div>
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : stats.length === 0 ? (
          <div className="empty-state">
            <p>Aucune donnée de présence pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Matière</th>
                <th>Appels</th>
                <th>Taux</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.classe_id} className={row.taux_presence < 70 ? 'row--absent' : ''}>
                  <td>{row.classe_nom}</td>
                  <td>{row.matiere}</td>
                  <td>{row.total}</td>
                  <td><strong>{row.taux_presence}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <section className="section" style={{ marginTop: '2rem' }}>
          <h2>Comptes utilisateurs</h2>
          {userMessage && <div className="alert-success">{userMessage}</div>}

          <form className="inline-form" onSubmit={handleCreateUser}>
            <div className="form-grid">
              <input
                className="form-input"
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <select
                className="form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="eleve">Élève</option>
                <option value="enseignant">Enseignant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn-primary" type="submit">Créer le compte</button>
          </form>

          {usersLoading ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.prenom} {user.nom}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.is_active ? 'Actif' : 'Désactivé'}</td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={() => toggleActive(user)}>
                        {user.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
