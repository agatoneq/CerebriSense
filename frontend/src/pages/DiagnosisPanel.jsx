import React, { useState } from "react";
import "../styles/DiagnosisPanel.css";
import ShapChart from "../components/ShapChart";

function DiagnosisPanel() {
  const [eegFile, setEegFile] = useState(null);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    setEegFile(e.target.files[0]);
    setAnalysisMessage("");
  };

  const handleFileAnalysis = async () => {
    if (!eegFile) {
      alert("Wybierz plik EEG przed analizą!");
      return;
    }

    const formData = new FormData();
    formData.append("raw_eeg_file", eegFile);

    try {
      setIsAnalyzing(true);
      const response = await fetch("http://127.0.0.1:5000/api/v1/analyze/temporary", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisMessage(`${data.classification}\n\n${data.report}`);
      } else {
        alert("Wystąpił błąd podczas analizy pliku.");
      }
    } catch (err) {
      console.error("Błąd połączenia:", err);
      alert("Nie udało się nawiązać połączenia z serwerem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="eeg-analysis-container">
      <h2 className="eeg-analysis-title">Analiza Pliku EEG</h2>
      <p>
        Tutaj możesz przeanalizować plik EEG, który nie został przypisany do żadnego pacjenta. Jeśli
        chcesz zarządzać plikami pacjenta, przejdź do{" "}
        <a href="/patients" className="patients-link">
          listy pacjentów
        </a>
        .
      </p>
  
      <div className="file-upload-section">
        <h3 className="upload-section-title">Wgraj plik EEG</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
        <button
          className={`analyze-button ${isAnalyzing ? "disabled" : ""}`}
          onClick={handleFileAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analizowanie..." : "Analizuj"}
        </button>
      </div>
  
      {analysisMessage && (
        <div className="analysis-result-section">
          <h3 className="analysis-title">Wynik Analizy</h3>
          <p className="classification-highlight">
            {analysisMessage.split("\n")[0]}
          </p>
          <ul className="analysis-list">
            {analysisMessage
              .split("\n")
              .slice(1)
              .map((line, index) => (
                <li key={index}>{line.trim()}</li>
              ))}
          </ul>
          <ShapChart shapReport={analysisMessage} />
        </div>
      )}
    </div>
  );  
}

export default DiagnosisPanel;
