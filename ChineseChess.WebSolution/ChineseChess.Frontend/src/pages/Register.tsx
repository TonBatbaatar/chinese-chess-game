import { useState } from "react";
import { useNavigate} from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);

    // empty submission validation
    if (!email || !password) { setErr("Email and password required."); return; }

    try {
      setBusy(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include" not needed for register (no cookie set)
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Register failed");
      }
      setMsg("Registered! You can login now.");

      navigate('/home');

    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow border space-y-3">
        <h1 className="text-xl font-bold">Create Account</h1>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.currentTarget.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        <input
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={e => setPassword(e.currentTarget.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-emerald-700">{msg}</div>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold disabled:opacity-60"
        >
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
