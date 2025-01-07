import React, { useState } from "react";
import "../styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sprawdzanie, czy hasła się zgadzają
    if (formData.password !== formData.confirmPassword) {
      setMessage("Hasła muszą być takie same!");
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage("Wszystkie pola są wymagane!");
      return;
    }    

    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log(response)

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
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Zarejestruj się</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Imię i nazwisko"
            value={formData.name}
            onChange={handleChange}
            className="register-input"
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            value={formData.password}
            onChange={handleChange}
            className="register-input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Potwierdź hasło"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="register-input"
          />
          <button type="submit" className="register-button">
            Zarejestruj się
          </button>
        </form>
        {message && <p className="register-message">{message}</p>}
        <div className="register-footer">
          Masz już konto? <a href="/login" className="login-link">Zaloguj się</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
