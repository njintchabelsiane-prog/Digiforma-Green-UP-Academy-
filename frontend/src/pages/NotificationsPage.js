import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import { getNotifications, marquerNotificationLue } from '../api/presencesService';
import './enseignant/DashboardEnseignant.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => setError('Impossible de charger les notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleRead = async (id) => {
    await marquerNotificationLue(id);
    fetchNotifications();
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="dashboard-header">
          <div>
            <h1>Notifications</h1>
            <p className="dashboard-subtitle">Alertes d'absences répétées</p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <p>Aucune notification.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Alerte</th>
                <th>Classe</th>
                <th>Absences</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className={!notification.lue ? 'row--absent' : ''}>
                  <td>{notification.message}</td>
                  <td>{notification.classe_nom}</td>
                  <td>{notification.nb_absences}</td>
                  <td>{notification.lue ? 'Lue' : 'Non lue'}</td>
                  <td>
                    {!notification.lue && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleRead(notification.id)}
                      >
                        Marquer lue
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
