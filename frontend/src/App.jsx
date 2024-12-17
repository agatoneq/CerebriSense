import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorPanel from "./pages/DoctorPanel";
import AddPatient from "./pages/AddPatient";
import Patients from "./pages/Patients";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="navbar">
        <Link to="/">Home</Link>
        <Link to="/about-study">O Badaniu</Link>
        <Link to="/about-app">O Aplikacji</Link>
        {!isLoggedIn && <Link to="/login">Zaloguj się</Link>}
        {isLoggedIn && <Link to="/doctor-panel">DoctorPanel</Link>}
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
