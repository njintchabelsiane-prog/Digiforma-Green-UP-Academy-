import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageAppel from "./PageAppel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/PageAppel" element={<PageAppel/>} />
        <Route path="*" element={<Navigate to="/PageAppel" replace />} />
      </Routes>
    </Router>
  );
}

export default App;