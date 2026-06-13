import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageRejoindreModifier from "./PageRejoindModifier";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/PageRejoindreModifier" element={<PageRejoindreModifier/>} />
        <Route path="*" element={<Navigate to="/PageRejoindreModifier" replace />} />
      </Routes>
    </Router>
  );
}

export default App;