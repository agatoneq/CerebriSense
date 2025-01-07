import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Patients.css";

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/patients/");
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients);
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
    <div className="patients-container">
      {patients.length > 0 ? (
        <div className="patients-menu">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-item">
              <p>
                <strong>Imię i nazwisko:</strong> {patient.first_name} {patient.last_name}
              </p>
              <p>
                <strong>Płeć:</strong> {patient.gender}
              </p>
              <p>
                <strong>Grupa:</strong> {patient.group}
              </p>
              <Link to={`/patient-details/${patient.id}`} className="patients-link">
                Zobacz szczegóły
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak pacjentów w bazie danych.</p>
      )}
    </div>
  );
}

export default Patients;
