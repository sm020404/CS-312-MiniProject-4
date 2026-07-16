import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/api.js";

// onSignedIn is a callback so App.jsx can update its "who is logged in" state
function Signin({ onSignedIn }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.signin(userId, password);
      onSignedIn(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2 className="auth-title">
          Welcome <em>back</em>
        </h2>
        <p className="auth-sub">Sign in to continue</p>
        {error && <p className="error">{error}</p>}

        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign In</button>
        <p className="auth-link">
          Need an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Signin;
