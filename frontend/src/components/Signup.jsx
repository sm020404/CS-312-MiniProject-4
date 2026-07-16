import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/api.js";

function Signup() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // lets us redirect programmatically, like res.redirect did

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.signup(userId, password, name);
      navigate("/signin"); // matches your old res.redirect("/signin")
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2 className="auth-title">
          Join <em>the Journal</em>
        </h2>
        <p className="auth-sub">Create your account</p>
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

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit">Create Account</button>
        <p className="auth-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
