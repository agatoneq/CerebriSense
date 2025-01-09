import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        localStorage.setItem("id", data.id);

        console.log(data)

        setMessage("Logowanie zakończone sukcesem!");
        navigate("/doctor-panel");
      } else {
        const error = await response.json();
        setMessage(error.error);
      }
    } catch (err) {
      setMessage("Wystąpił problem z połączeniem.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Zaloguj się</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            value={formData.password}
            onChange={handleChange}
            className="login-input"
          />
          <button type="submit" className="login-button">
            Zaloguj się
          </button>
        </form>
        {message && <p className="login-message">{message}</p>}
        <div className="login-footer">
          Nie masz konta? <a href="/register" className="register-link">Zarejestruj się</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
