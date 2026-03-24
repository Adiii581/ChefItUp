import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../service/api";

export default function Register({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.register(username, email, password);
      if (data.token) {
        localStorage.setItem("token", data.token);
        onAuthSuccess?.();
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create an account</h2>
        <p>Join ChefItUp and start saving your favourite dorm recipes.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Student Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-msg">{error}</p>}
          <button className="primary-btn" type="submit">Register</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
