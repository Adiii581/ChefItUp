import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RecipeDetail from "./pages/RecipeDetail";
import "./App.css";

const Navbar = ({
  isLoggedIn,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogout: () => void;
}) => (
  <nav className="navbar">
    <Link to="/" className="navbar-brand">
      ChefItUp 👨‍🍳
    </Link>
    <div className="navbar-links">
      {isLoggedIn ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout} className="navbar-logout-btn">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  </nav>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token"),
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="app-container">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/register"
            element={<Register onAuthSuccess={handleAuthSuccess} />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
