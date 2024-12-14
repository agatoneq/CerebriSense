import '../styles/Login.css';

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Zaloguj się</h2>
        <form className="login-form">
          <input type="email" placeholder="E-mail" className="login-input" />
          <input type="password" placeholder="Hasło" className="login-input" />
          <div className="login-options">
            <label>
              <input type="checkbox" /> Zapamiętaj mnie
            </label>
            <a href="/register" className="register-link">
              Nie masz konta? Zarejestruj się
            </a>
          </div>
          <button type="submit" className="login-button">
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;