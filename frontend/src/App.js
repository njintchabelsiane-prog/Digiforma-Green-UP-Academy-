import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MesAbsence from "./MesAbscence";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/MesAbscence" element={<MesAbsence/>} />
        <Route path="*" element={<Navigate to="/MesAbsence" replace />} />
      </Routes>
    </Router>
  );
}

export default App;