import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/PatientProfile.css";

function PatientProfile() {
  const { id } = useParams(); // `id` to patient_id
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const doctorId = localStorage.getItem("id"); // Pobierz doctor_id z localStorage
      if (!doctorId) {
        console.error("Nie znaleziono ID lekarza w localStorage.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/patients/${doctorId}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPatient(data.patient);
        } else if (response.status === 403) {
          console.error("Brak dostępu do danych pacjenta.");
          setPatient(null);
        } else {
          console.error("Błąd podczas pobierania danych pacjenta.");
        }
      } catch (err) {
        console.error("Wystąpił problem z połączeniem:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="loading">Ładowanie danych pacjenta...</div>;
  }

  if (!patient) {
    return <div className="error">Nie znaleziono danych pacjenta lub brak dostępu.</div>;
  }

  return (
    <div className="patient-profile-container">
      <h2 className="patient-profile-title">Szczegóły Pacjenta</h2>
      <div className="patient-details">
        <p>
          <strong>Imię i Nazwisko:</strong>{" "}
          <span className="highlighted-name">
            {patient.first_name} {patient.last_name}
          </span>
        </p>
        <p>
          <strong>Płeć:</strong> {patient.gender === "M" ? "Mężczyzna" : "Kobieta"}
        </p>
        <p>
          <strong>Twoja Diagnoza:</strong>{" "}
          {patient.group === 2 ? "-" : patient.group === 0 ? "Zdrowy" : "Schizofrenia"}
        </p>
        <p>
          <strong>Notatki:</strong> {patient.notes.length > 0 ? patient.notes.join(", ") : "-"}
        </p>
        <p>
          <strong>Przypisano następującą liczbę plików EEG:</strong> {patient.processed_files.length}.
        </p>
        {patient.processed_files.length > 0 ? (
          <ul className="files-list">
            {patient.processed_files.map((file, index) => (
              <li key={index}>
                {index + 1}. {file.file_name || `Plik ${index + 1}`} | Dodano: {new Date(file.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak wgranych plików EEG.</p>
        )}
      </div>
      <button className="back-button" onClick={() => window.history.back()}>
        Powrót
      </button>
    </div>
  );
}

export default PatientProfile;
