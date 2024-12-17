import React, { useState, useEffect } from "react";
import "../styles/Patients.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/patients");
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        } else {
          setError("Nie udało się pobrać listy pacjentów.");
        }
      } catch (err) {
        setError("Wystąpił problem z połączeniem.");
      }
    };

    fetchPatients();
  }, []);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="patients-container">
      <h2>Lista Pacjentów</h2>

      {error && <p className="error">{error}</p>}

      <div className="patients-list">
        {patients.map((patient) => (
          <div key={patient.id} className="patient-card">
            <p>
              <strong>{patient.name}</strong>
            </p>
            <p>Wiek: {patient.age}</p>
            <p>Płeć: {patient.gender}</p>
            <button onClick={() => handleViewDetails(patient)}>
              Szczegóły
            </button>
          </div>
        ))}
      </div>

      {selectedPatient && (
        <div className="patient-details">
          <h3>Szczegóły pacjenta</h3>
          <p>
            <strong>Imię i nazwisko:</strong> {selectedPatient.name}
          </p>
          <p>
            <strong>Wiek:</strong> {selectedPatient.age}
          </p>
          <p>
            <strong>Płeć:</strong> {selectedPatient.gender}
          </p>
          <p>
            <strong>Diagnoza:</strong>{" "}
            {selectedPatient.diagnosis || "Brak diagnozy"}
          </p>
          <p>
            <strong>Plik EEG:</strong> {selectedPatient.eeg_file}
          </p>
        </div>
      )}
    </div>
  );
}

export default Patients;
