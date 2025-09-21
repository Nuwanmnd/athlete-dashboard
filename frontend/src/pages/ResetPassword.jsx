import { useState, useMemo } from "react";
import { api } from "@/utils/api";

export default function ResetPassword() {
  const token = useMemo(
    () => new URLSearchParams(location.search).get("token") || "",
    []
  );
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.reset({ token, new_password: pw });
      setOk(true);
    } catch {
      setErr("Invalid or expired reset link.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border rounded-2xl p-6 bg-white space-y-4"
      >
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        {ok ? (
          <>
            <div className="text-sm">
              Password updated. You can now{" "}
              <a className="text-blue-600" href="/login">
                sign in
              </a>
              .
            </div>
          </>
        ) : (
          <>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <input
              className="field w-full"
              type="password"
              placeholder="New password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button className="btn w-full" type="submit">
              Update password
            </button>
          </>
        )}
      </form>
    </div>
  );
}
