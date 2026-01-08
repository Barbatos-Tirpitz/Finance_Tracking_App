import { useState } from "react";
import { login, register } from "../api";
import "../styles/LandingPage.css";

export default function LandingPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    const res = isLogin
      ? await login({ email: form.email, password: form.password })
      : await register(form);

    onAuth(res.data.user);
  };

  return (
    <div className="landing-container">
      <form className="auth-card" onSubmit={submit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <input
            placeholder="Username"
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        )}

        <input
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        <button>{isLogin ? "Login" : "Register"}</button>

        <p onClick={() => setIsLogin(!isLogin)} className="switch-link">
          {isLogin
            ? "No account? Register here"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}
