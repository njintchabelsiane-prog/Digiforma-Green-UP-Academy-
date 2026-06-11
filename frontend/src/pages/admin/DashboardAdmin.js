import React from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import '../enseignant/DashboardEnseignant.css';
export default function DashboardAdmin() {
  return <div className="page-layout"><Sidebar /><main className="page-content"><h1>Dashboard Admin</h1></main></div>;
}