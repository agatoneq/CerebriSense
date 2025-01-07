import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/PatientProfile.css";

function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPatient() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/patients/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
        } else {
          setError("Nie znaleziono pacjenta.");
        }
      } catch (error) {
        setError("Wystąpił problem z połączeniem.");
      }
    }

    fetchPatient();
  }, [id]);

  if (error) {
    return <div className="patient-profile-container">{error}</div>;
  }

  if (!patient) {
    return <div className="patient-profile-container">Ładowanie danych pacjenta...</div>;
  }

  return (
    <div className="patient-profile-container">
      <h1>Profil Pacjenta</h1>
      <div className="patient-details">
        <p><strong>Imię i nazwisko:</strong> {patient.name}</p>
        <p><strong>Wiek:</strong> {patient.age}</p>
        <p><strong>Płeć:</strong> {patient.gender}</p>
        <p><strong>Diagnoza:</strong> {patient.diagnosis || "Brak diagnozy"}</p>
      </div>
    </div>
  );
}

export default PatientProfile;
