import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AnalyzeUnassigned.css";

function AnalyzeUnassigned() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Wybierz plik EEG, który chcesz przeanalizować.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/analyze/unassigned", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        navigate("/results", { state: { result: data.result, shap: data.shap } });
      } else {
        setMessage("Wystąpił błąd podczas analizy pliku.");
      }
    } catch (err) {
      setMessage("Nie udało się nawiązać połączenia z serwerem.");
    }
  };

  return (
    <div className="analyze-unassigned-container">
      <h2 className="analyze-unassigned-title">Analizuj plik EEG nieprzypisany do żadnego użytkownika</h2>
      <form className="analyze-unassigned-form" onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          className="analyze-unassigned-input"
          onChange={handleFileChange}
        />
        <button type="submit" className="analyze-unassigned-button">
          Prześlij i Analizuj
        </button>
      </form>
      {message && <p className="analyze-unassigned-message">{message}</p>}
    </div>
  );
}

export default AnalyzeUnassigned;
