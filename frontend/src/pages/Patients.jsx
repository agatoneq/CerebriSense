import React, { useState, useEffect } from "react";
import "../styles/Patients.css";

function PatientsPanel() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/patients");
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        } else {
          console.error("Błąd podczas pobierania listy pacjentów.");
        }
      } catch (error) {
        console.error("Problem z połączeniem:", error);
      }
    }

    fetchPatients();
  }, []);

  return (
    <div className="patients-panel-container">
      <h1>Lista Pacjentów</h1>
      {patients.length > 0 ? (
        <div className="patients-list">
          {patients.map((patient, index) => (
            <div key={index} className="patient-card">
              <p><strong>Imię i Nazwisko:</strong> {patient.name}</p>
              <p><strong>Płeć:</strong> {patient.gender === "F" ? "Kobieta" : "Mężczyzna"}</p>
              <p>
                <strong>Diagnoza:</strong>{" "}
                {patient.diagnosis === 0
                  ? "Zdrowy"
                  : patient.diagnosis === 1
                  ? "Chory (schizofrenia)"
                  : "Brak diagnozy"}
              </p>
              <p>
                <strong>Model:</strong>{" "}
                {patient.model_prediction === 0
                  ? "Model sklasyfikował pacjenta jako zdrowego."
                  : patient.model_prediction === 1
                  ? "Model sklasyfikował pacjenta jako chorego."
                  : "Nie przeprowadzano analizy danych."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak pacjentów w bazie danych.</p>
      )}
    </div>
  );
}

export default PatientsPanel;
