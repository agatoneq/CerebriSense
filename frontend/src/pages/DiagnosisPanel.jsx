import React from "react";
import { Link } from "react-router-dom";
import "../styles/DiagnosisPanel.css";

function DiagnosisPanel() {
  return (
    <div className="doctor-panel-container">
      <div className="doctor-panel-menu">
        <Link to="/add-patient" className="doctor-panel-link">
          Dodaj Pacjenta
        </Link>
        <Link to="/patients" className="doctor-panel-link">
          Przeglądaj listę Pacjentów
        </Link>
      </div>
    </div>
  );
}

export default DiagnosisPanel;
