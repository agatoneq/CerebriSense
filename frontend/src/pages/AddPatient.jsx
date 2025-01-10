import React, { useState } from "react";
import "../styles/AddPatient.css";

function AddPatient() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    group: "",
    gender: "",
    raw_eeg_file: null,
    file_name: "",
    doctor_id: "",
  });

  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "raw_eeg_file") {
      setFormData({ ...formData, raw_eeg_file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsProcessing(true);

    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("group", formData.group);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("raw_eeg_file", formData.raw_eeg_file);
    formDataToSend.append("file_name", formData.file_name);
    formDataToSend.append("doctor_id", parseInt(localStorage.getItem("id")));

    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/patients/add", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Dodano Pacjenta ${formData.first_name} ${formData.last_name}!`);
        setFormData({
          first_name: "",
          last_name: "",
          group: "",
          gender: "",
          raw_eeg_file: null,
          file_name: "",
          doctor_id: "",
        });
      } else {
        const error = await response.json();
        setMessage(error.error);
      }
    } catch (err) {
      setMessage("Wystąpił problem z połączeniem.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="add-patient-container">
      <h2 className="add-patient-title">Dodaj Pacjenta</h2>
      <form className="add-patient-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="Imię"
          className="add-patient-input"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Nazwisko"
          className="add-patient-input"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <select
          name="group"
          className="add-patient-select"
          value={formData.group}
          onChange={handleChange}
          required
        >
          <option value="">Określ swoją diagnozę dla pacjenta</option>
          <option value="2">Nieokreślony</option>
          <option value="0">Zdrowy</option>
          <option value="1">Chory</option>
        </select>
        <select
          name="gender"
          className="add-patient-select"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Wybierz płeć</option>
          <option value="M">Mężczyzna</option>
          <option value="F">Kobieta</option>
        </select>
        <input
          type="file"
          name="raw_eeg_file"
          accept=".csv"
          className="add-patient-input"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="file_name"
          placeholder="Krótka notatka do pliku (opcjonalnie)"
          className="add-patient-input"
          value={formData.file_name}
          onChange={handleChange}
        />
        <button
          type="submit"
          className={`add-patient-button ${isProcessing ? "processing" : ""}`}
          disabled={isProcessing}
        >
          {isProcessing ? "Przetwarzanie..." : "Zatwierdź nowego pacjenta"}
        </button>
      </form>
      {message && (
        <div className="add-patient-message-container">
          <button
            className="view-patients-button"
            onClick={() => window.location.href = "/patients"}
          >
            Przeglądaj listę Pacjentów
          </button>
          <p className="add-patient-message">{message}</p>
        </div>
      )}
    </div>
  );
}

export default AddPatient;
