import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
// Pages publiques
import LoginPage from './pages/LoginPage';
// Pages Enseignant
import DashboardEnseignant from './pages/enseignant/DashboardEnseignant';
import ClassesList from './pages/enseignant/ClassesList';
import ClasseDetail from './pages/enseignant/ClasseDetail';
import AppelPage from './pages/enseignant/AppelPage';
import StatsDashboard from './pages/enseignant/StatsDashboard';
// Pages Élève
import DashboardEleve from './pages/eleve/DashboardEleve';
import RejoindreClasse from './pages/eleve/RejoindreClasse';
import MesAbsences from './pages/eleve/MesAbsences';
// Pages Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Enseignant ── */}
          <Route path="/dashboard/enseignant" element={
            <PrivateRoute roles={['enseignant']}>
              <DashboardEnseignant />
            </PrivateRoute>
          } />
          <Route path="/classes" element={
            <PrivateRoute roles={['enseignant']}>
              <ClassesList />
            </PrivateRoute>
          } />
          <Route path="/classes/:id" element={
            <PrivateRoute roles={['enseignant']}>
              <ClasseDetail />
            </PrivateRoute>
          } />
          <Route path="/classes/:id/appel" element={
            <PrivateRoute roles={['enseignant']}>
              <AppelPage />
            </PrivateRoute>
          } />
          <Route path="/classes/:id/stats" element={
            <PrivateRoute roles={['enseignant']}>
              <StatsDashboard />
            </PrivateRoute>
          } />

          {/* ── Élève ── */}
          <Route path="/dashboard/eleve" element={
            <PrivateRoute roles={['eleve']}>
              <DashboardEleve />
            </PrivateRoute>
          } />
          <Route path="/rejoindre" element={
            <PrivateRoute roles={['eleve']}>
              <RejoindreClasse />
            </PrivateRoute>
          } />
          <Route path="/mes-absences" element={
            <PrivateRoute roles={['eleve']}>
              <MesAbsences />
            </PrivateRoute>
          } />

          {/* ── Admin ── */}
          <Route path="/dashboard/admin" element={
            <PrivateRoute roles={['admin']}>
              <DashboardAdmin />
            </PrivateRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;