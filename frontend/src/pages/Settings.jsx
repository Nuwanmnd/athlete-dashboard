// frontend/src/pages/Settings.jsx
import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { api } from "@/utils/api";

export default function Settings() {
  const { user, logout } = useAuth();
  const [sent, setSent] = useState(false);
  const sendReset = async () => {
    await api.requestReset({ email: user.email });
    setSent(true);
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="font-medium">Account</div>
        <div className="text-sm text-gray-600">Signed in as {user?.email}</div>

        <div className="mt-4 flex gap-3">
          <button className="btn" onClick={sendReset}>
            Reset password via email
          </button>
          <button className="btn-outline" onClick={logout}>
            Sign out
          </button>
        </div>

        {sent && (
          <div className="text-green-600 text-sm mt-2">
            If your email exists, a reset link has been sent. (In dev, check
            backend console.)
          </div>
        )}
      </div>
    </div>
  );
}
