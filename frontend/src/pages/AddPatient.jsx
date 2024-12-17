import React, { useState } from "react";
import "../styles/AddPatient.css";

function AddPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    diagnosis: "",
    file: null,
  });

  const [message, setMessage] = useState(""); // Komunikaty o sukcesie lub błędzie

  // Obsługa zmiany w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Obsługa zmiany pliku
  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  // Wysłanie formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("age", formData.age);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("diagnosis", formData.diagnosis);
    formDataToSend.append("file", formData.file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/patients/add", {
        method: "POST",
        body: formDataToSend, // Przesyłamy dane jako FormData
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Pacjent został pomyślnie dodany!");
      } else {
        const error = await response.json();
        setMessage(`Błąd: ${error.error}`);
      }
    } catch (err) {
      setMessage("Wystąpił problem z połączeniem.");
    }
  };

  return (
    <div className="add-patient-container">
      <h2>Dodaj Pacjenta</h2>
      <form className="add-patient-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Imię i nazwisko"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Wiek"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Wybierz płeć</option>
          <option value="M">Mężczyzna</option>
          <option value="F">Kobieta</option>
        </select>
        <textarea
          name="diagnosis"
          placeholder="Diagnoza lekarza (opcjonalne)"
          value={formData.diagnosis}
          onChange={handleChange}
        ></textarea>
        <input type="file" accept=".csv, .edf" onChange={handleFileChange} required />
        <button type="submit">Dodaj Pacjenta</button>
      </form>
      {message && <p className="add-patient-message">{message}</p>}
    </div>
  );
}

export default AddPatient;
