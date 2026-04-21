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
  <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
  <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    
    {/* Brand */}
    <Link
      to="/"
      className="flex items-center gap-3 group active:scale-95 transition"
    >
      <span className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-rose-500 transition-colors">
        ChefItUp
      </span>
    </Link>

    {/* Links */}
    <div className="flex items-center gap-6">
      {isLoggedIn ? (
        <>
          <Link
            to="/profile"
            className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
          >
            Profile
          </Link>

          <button
            onClick={onLogout}
            className="text-[11px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 px-4 py-2 hover:border-rose-500 hover:text-rose-500 transition-all"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </div>
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
