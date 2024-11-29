import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/">Home</Link>
        <Link to="/about-study">O Badaniu</Link>
        <Link to="/about-app">O Aplikacji</Link>
        <Link to="/login">Zaloguj się</Link>
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* Inne ścieżki */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
