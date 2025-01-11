import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/PatientProfile.css";
import ShapChart from "../components/ShapChart";

function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      const doctorId = localStorage.getItem("id");
      if (!doctorId) {
        console.error("Nie znaleziono ID lekarza w localStorage.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/v1/patients/${doctorId}/${id}`
        );
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

  const analyzeFile = async (fileId) => {
    console.log("Analyzing file with ID:", fileId);
    setAnalysisMessage("Analizowanie...");
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/analyze/file/${fileId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Analysis response:", data);
        setAnalysisMessage(`${data.classification}\n\n${data.report}`);
      } else {
        console.error("Błąd serwera:", data.error || "Nieznany błąd");
        setAnalysisMessage(
          `Wystąpił błąd podczas analizy pliku: ${
            data.error || "Nieznany błąd"
          }`
        );
      }
    } catch (err) {
      console.error("Błąd połączenia:", err);
      setAnalysisMessage("Nie udało się nawiązać połączenia z serwerem.");
    }
  };

  const handleNoteSave = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/patients/${id}/add_note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: newNote }),
        }
      );

      if (response.ok) {
        setPatient((prev) => ({
          ...prev,
          notes: [...prev.notes, newNote],
        }));
        setNewNote("");
        setIsNoteModalOpen(false);
      } else {
        console.error("Błąd podczas zapisywania notatki.");
      }
    } catch (err) {
      console.error("Błąd połączenia:", err);
    }
  };

  const [newFile, setNewFile] = useState(null);
  const [fileNote, setFileNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!newFile) {
      alert("Wybierz plik EEG przed wysłaniem!");
      return;
    }

    const formData = new FormData();
    formData.append("raw_eeg_file", newFile);
    formData.append("file_name", fileNote);

    try {
      setIsUploading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/patients/${id}/upload_file`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatient((prev) => ({
          ...prev,
          processed_files: [...prev.processed_files, data.file],
        }));
        setNewFile(null);
        setFileNote("");
        alert("Plik EEG został pomyślnie wgrany.");
      } else {
        alert("Wystąpił błąd podczas wgrywania pliku.");
      }
    } catch (err) {
      console.error("Błąd połączenia:", err);
      alert("Nie udało się nawiązać połączenia z serwerem.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie danych pacjenta...</div>;
  }

  if (!patient) {
    return (
      <div className="error">
        Nie znaleziono danych pacjenta lub brak dostępu.
      </div>
    );
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
          <strong>Płeć:</strong>{" "}
          {patient.gender === "M" ? "Mężczyzna" : "Kobieta"}
        </p>
        <p>
          <strong>Twoja Diagnoza:</strong>{" "}
          {patient.group === 2
            ? "-"
            : patient.group === 0
            ? "Zdrowy"
            : "Schizofrenia"}
        </p>
        <p>
          <strong>Notatki:</strong>{" "}
          {patient.notes.length > 0 ? patient.notes.join(", ") : "-"}
        </p>
        <p>
          <strong>Przypisano następującą liczbę plików EEG:</strong>{" "}
          {patient.processed_files.length}.
        </p>
        {patient.processed_files.length > 0 ? (
          <ul className="files-list">
            {patient.processed_files.map((file, index) => (
              <li key={index}>
                {index + 1}. {file.file_name || `Plik ${index + 1}`} | Dodano:{" "}
                {new Date(file.created_at).toLocaleString()}
                <button
                  className="analyze-file-button"
                  onClick={() => analyzeFile(file.id || file.file_id)}
                >
                  {file.analyzed ? "Wyniki" : "Analizuj"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak wgranych plików EEG.</p>
        )}
      </div>

      {analysisMessage && (
        <div className="shap-report-container">
          <h3 className="shap-report-title">Raport Predykcji</h3>
          <div className="analysis-message">
            <p className="classification-highlight">
              {analysisMessage.split("\n")[0]}
            </p>
            <ul className="shap-report-list">
              {analysisMessage
                .split("\n")
                .slice(1)
                .map((line, index) => (
                  <li key={index}>{line.trim()}</li>
                ))}
            </ul>
          </div>
          <ShapChart shapReport={analysisMessage} />
        </div>
      )}
      <div className="button-container">
        <button className="back-button" onClick={() => window.history.back()}>
          Wróć do Listy Pacjentów
        </button>
        <button
          className="add-note-button"
          onClick={() => setIsNoteModalOpen(true)}
        >
          Dodaj Notatkę
        </button>
      </div>

      <div className="file-upload-section">
        <h3>Wgraj nowy plik EEG</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setNewFile(e.target.files[0])}
          className="file-input"
        />
        <input
          type="text"
          placeholder="Krótka notatka do pliku (opcjonalnie)"
          value={fileNote}
          onChange={(e) => setFileNote(e.target.value)}
          className="file-note-input"
        />
        <button
          className={`upload-file-button ${isUploading ? "disabled" : ""}`}
          onClick={handleFileUpload}
          disabled={isUploading}
        >
          {isUploading ? "Wgrywanie..." : "Wgraj Plik"}
        </button>
      </div>

      {isNoteModalOpen && (
        <div className="note-modal">
          <div className="note-modal-content">
            <textarea
              placeholder="Wpisz notatkę..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button
              className="cancel-note-button"
              onClick={() => setIsNoteModalOpen(false)}
            >
              Anuluj
            </button>
            <button className="save-note-button" onClick={handleNoteSave}>
              Zapisz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfile;
