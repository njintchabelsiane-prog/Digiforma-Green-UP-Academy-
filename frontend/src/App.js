import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/loginPage';
import Dashboard from './components/Dashboard';
import DashboardEleve from './components/DashboardEleve';
import CreerClasse from './components/CreerClasse';
import ListeEleve from './components/ListeEleve';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-eleve" element={<DashboardEleve />} />
        <Route path="/creer-classe" element={<CreerClasse />} />
        <Route path="/liste-eleve" element={<ListeEleve />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;