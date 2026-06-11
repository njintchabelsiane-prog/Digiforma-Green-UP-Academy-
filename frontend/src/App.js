import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageClasse from "./PageClasse";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rejoindre" element={<PageClasse />} />
        <Route path="*" element={<Navigate to="/rejoindre" replace />} />
      </Routes>
    </Router>
  );
}

export default App;