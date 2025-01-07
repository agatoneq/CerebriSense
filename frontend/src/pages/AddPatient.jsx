import React, { useState } from "react";
import "../styles/AddPatient.css";

function AddPatient() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    group: "2",
    gender: "",
    raw_eeg_file: null,
  });

  const [message, setMessage] = useState("");

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
  
    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("group", formData.group);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("raw_eeg_file", formData.raw_eeg_file);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/patients/add", {
        method: "POST",
        body: formDataToSend,
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        const error = await response.json();
        setMessage(error.error);
      }
    } catch (err) {
      setMessage("Wystąpił problem z połączeniem.");
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
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Nazwisko"
          className="add-patient-input"
          onChange={handleChange}
          required
        />
        <select name="group" className="add-patient-select" onChange={handleChange}>
          <option value="2">Nieznane</option>
          <option value="0">Zdrowy</option>
          <option value="1">Schizofrenia</option>
        </select>
        <select name="gender" className="add-patient-select" onChange={handleChange} required>
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
        <button type="submit" className="add-patient-button">
          Dodaj Pacjenta
        </button>
      </form>
      {message && <p className="add-patient-message">{message}</p>}
    </div>
  );
}

export default AddPatient;