import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (e) {
      setErr("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border rounded-2xl p-6 bg-white space-y-4"
      >
        <h1 className="text-xl font-semibold">Sign In</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input
          className="field w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="field w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn w-full" type="submit">
          Sign in
        </button>
        <a href="/forgot-password" className="text-sm text-blue-600">
          Forgot password?
        </a>
      </form>
    </div>
  );
}
