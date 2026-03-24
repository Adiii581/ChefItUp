import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RecipeDetail from "./pages/RecipeDetail";
import "./App.css";

// Navbar Component extracted for cleanliness
const Navbar = () => (
  <nav className="navbar">
    <Link to="/">ChefItUp 👨‍🍳</Link>
    <div style={{ display: "flex", gap: "1rem" }}>
      <Link to="/profile">Profile</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  </nav>
);

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
