import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navLinks = {
  enseignant: [
    { to: '/dashboard/enseignant', label: 'Tableau de bord' },
    { to: '/classes',              label: 'Mes classes' },
  ],
  eleve: [
    { to: '/dashboard/eleve', label: 'Tableau de bord' },
    { to: '/rejoindre',       label: 'Rejoindre une classe' },
    { to: '/mes-absences',    label: 'Mes absences' },
  ],
  admin: [
    { to: '/dashboard/admin', label: 'Tableau de bord' },
  ],
};

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = navLinks[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-text">Green UP Academy</span>
      </div>

      {/* Profil — nom complet uniquement, pas d'avatar/initiales */}
      {user && (
        <div className="sidebar__profile">
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user.prenom} {user.nom}</span>
            <span className="sidebar__user-role">
              {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <button className="sidebar__logout" onClick={handleLogout}>
        Déconnexion
      </button>
    </aside>
  );
}