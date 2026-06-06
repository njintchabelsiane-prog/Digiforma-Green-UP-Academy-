import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageRejoind from "./PageRejoind";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rejoindre" element={<PageRejoind />} />
        <Route path="*" element={<Navigate to="/rejoindre" replace />} />
      </Routes>
    </Router>
  );
}

export default App;