import { useState } from "react";
import { requestPasswordReset } from "../api";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await requestPasswordReset(email);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Error");
    }
  };

  return (
    <div>
      <h2>Request Password Reset</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
