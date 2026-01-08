import { useState } from "react";
import { resetPassword } from "../api";
import { validatePassword } from "../utils/passwordValidation";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async e => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setMsg("Password must be 8+ chars, include uppercase, lowercase, and number.");
      return;
    }
    try {
      const res = await resetPassword(token, password);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Reset Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
