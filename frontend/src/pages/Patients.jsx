import React, { useEffect, useState } from "react";
import "../styles/AddPatient.css";

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/api/v1/patients/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        console.error("Błąd pobierania pacjentów:", err);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div>
      <h2>Lista Pacjentów</h2>
      <table>
        <thead>
          <tr>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Grupa</th>
            <th>Płeć</th>
            <th>Plik EEG</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.first_name}</td>
              <td>{patient.last_name}</td>
              <td>
                {patient.group === 0
                  ? "Zdrowy"
                  : patient.group === 1
                  ? "Schizofrenia"
                  : "Nieznane"}
              </td>
              <td>{patient.gender === "M" ? "Mężczyzna" : "Kobieta"}</td>
              <td>{patient.raw_eeg_file}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Patients;