import React, { useEffect, useState } from "react";
import "../styles/Patients.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/patients/");
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients);
        } else {
          console.error("Błąd podczas pobierania pacjentów.");
        }
      } catch (err) {
        console.error("Wystąpił problem z połączeniem:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return <div className="loading">Ładowanie danych pacjentów...</div>;
  }

  return (
    <div className="patients-container">
      <h2 className="patients-title">Twoi Pacjenci</h2>
      {patients.length === 0 ? (
        <p className="no-patients">Nie znaleziono pacjentów.</p>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <p>
                <strong>Imię i Nazwisko:</strong>{" "}
                <span className="highlighted-name">{patient.first_name} {patient.last_name}</span>
              </p>
              <p>
                <strong>Twoja diagnoza:</strong>{" "}
                {patient.group === 2 ? "-" : patient.group === 0 ? "Zdrowy" : "Schizofrenia"}
              </p>
              <p>
                <strong>Liczba wgranych plików EEG:</strong>{" "}
                {patient.processed_files.length}
              </p>
              <button
                className="details-button"
                onClick={() =>
                  (window.location.href = `/patient-details/${patient.id}`)
                }
              >
                Wyświetl Szczegóły
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Patients;
