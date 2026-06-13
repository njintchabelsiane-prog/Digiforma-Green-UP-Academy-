import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MesClasses from "./MesClasses";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/MesClasses" element={<MesClasses/>} />
        <Route path="*" element={<Navigate to="/MesClasses" replace />} />
      </Routes>
    </Router>
  );
}

export default App;