import { useState } from "react";
import { api } from "@/utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.requestReset({ email });
    setDone(true);
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border rounded-2xl p-6 bg-white space-y-4"
      >
        <h1 className="text-xl font-semibold">Reset password</h1>
        {done ? (
          <div className="text-sm">
            If that email exists, we’ve sent a reset link.
          </div>
        ) : (
          <>
            <input
              className="field w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn w-full" type="submit">
              Send reset link
            </button>
          </>
        )}
      </form>
    </div>
  );
}
