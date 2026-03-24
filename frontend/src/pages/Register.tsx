import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../service/api";

export default function Register() {
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
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div>
      <h2>Welcome to ChefItUp</h2>
      <p>Log in to access your saved recipes.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Student Email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button className="primary-btn" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
