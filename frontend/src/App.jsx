import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorPanel from "./pages/DoctorPanel";
import AddPatient from "./pages/AddPatient";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      <div className="navbar">
        <Link to="/">Home</Link>
        <Link to="/about-study">O Badaniu</Link>
        <Link to="/about-app">O Aplikacji</Link>
        {!isLoggedIn && <Link to="/login">Zaloguj się</Link>}
        {isLoggedIn && (
          <>
            <Link to="/doctor-panel">Panel Lekarza</Link>
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
            element={isLoggedIn ? <DoctorPanel /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-patient"
            element={isLoggedIn ? <AddPatient /> : <Navigate to="/login" />}
          />
          <Route
            path="/patients"
            element={isLoggedIn ? <Patients /> : <Navigate to="/login" />}
          />
          <Route
            path="/patient-details/:id"
            element={isLoggedIn ? <PatientProfile /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;