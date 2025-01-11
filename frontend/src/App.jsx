import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorPanel from "./pages/DoctorPanel";
import AddPatient from "./pages/AddPatient";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import DiagnosisPanel from "./pages/DiagnosisPanel";
import AnalyzeUnassigned from "./pages/AnalyzeUnassigned";
import AnalyzePatient from "./pages/AnalyzePatient";
import Results from "./pages/Results";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleLogout = (event) => {
    const confirmLogout = window.confirm("Czy na pewno chcesz się wylogować?");
    if (!confirmLogout) {
      event.preventDefault();
      return;
    }
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };
  

  return (
    <Router>
      <div className="main-container">
      <div className="navbar">
        <Link to="/">Strona Główna</Link>
        {!isLoggedIn && (
          <>
            <Link to="/login">Zaloguj się</Link>
            <Link to="/register">Zarejestruj się</Link>
          </>
        )}
        {isLoggedIn && (
          <>
            <Link to="/doctor-panel">Zarządzaj Pacjentami</Link>
            <Link to="/diagnosis-panel">Analizuj Plik EEG</Link>
            <Link to="/" onClick={handleLogout}>
              Wyloguj się
            </Link>
          </>
        )}
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/doctor-panel"
            element={isLoggedIn ? <DoctorPanel /> : <Navigate to="/login" />} />
          <Route
            path="/add-patient"
            element={isLoggedIn ? <AddPatient /> : <Navigate to="/login" />} />
          <Route
            path="/patients"
            element={isLoggedIn ? <Patients /> : <Navigate to="/login" />} />
          <Route
            path="/patient-details/:id"
            element={isLoggedIn ? <PatientProfile /> : <Navigate to="/login" />} />
          <Route
            path="/diagnosis-panel"
            element={isLoggedIn ? <DiagnosisPanel /> : <Navigate to="/login" />} />
          <Route path="/analyze-unassigned" element={<AnalyzeUnassigned />} />
          <Route path="/analyze-patient" element={<AnalyzePatient />} />
          <Route path="/patient/:id" element={<PatientProfile />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
      </div>
    </Router>
  );
}

export default App;