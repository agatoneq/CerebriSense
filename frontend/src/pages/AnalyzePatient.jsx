import React, { useState } from "react";

function AnalyzePatient() {
  const [patientId, setPatientId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setMessage("Podaj ID pacjenta, którego plik chcesz przeanalizować.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/v1/analyze/patient/${patientId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Wynik analizy dla pacjenta ${patientId}: ${data.result}`);
      } else {
        setMessage("Wystąpił błąd podczas analizy pliku pacjenta.");
      }
    } catch (err) {
      setMessage("Nie udało się nawiązać połączenia z serwerem.");
    }
  };

  return (
    <div>
      <h2>Analizuj plik EEG konkretnego pacjenta</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Podaj ID pacjenta"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button type="submit">Przeanalizuj</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AnalyzePatient;
