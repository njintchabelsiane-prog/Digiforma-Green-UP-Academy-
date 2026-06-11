import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ModalArchiver from "./ModalArchiver ";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rejoindre" element={<ModalArchiver />} />
        <Route path="*" element={<Navigate to="/rejoindre" replace />} />
      </Routes>
    </Router>
  );
}

export default App;