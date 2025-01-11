import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Results.css";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileId, classification, report } = location.state || {};

  if (!fileId || !classification || !report) {
    return (
      <div className="results-container">
        <h2>Błąd</h2>
        <p>Brak wyników do wyświetlenia.</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Powrót
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>Wyniki Analizy Pliku EEG</h2>
      <p>
        <strong>ID Pliku:</strong> {fileId}
      </p>
      <p>
        <strong>Klasyfikacja:</strong> {classification}
      </p>
      <div className="shap-report-container">
    <h3>Raport Wyjaśnienia Predykcji</h3>
    <ul className="shap-report">
      {shapReport.split("\n").map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  </div>
      <button onClick={() => navigate(-1)} className="back-button">
        Powrót
      </button>
    </div>
  );
}

export default Results;
