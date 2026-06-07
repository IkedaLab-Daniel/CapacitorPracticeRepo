"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/token/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.non_field_errors?.[0] ?? data?.detail ?? "Login failed.");
      } else {
        setSuccess(true);
        if (data?.auth_token) {
          localStorage.setItem("auth_token", data.auth_token);
        }
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500 transition-colors";

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
            Authentication
          </p>
          <h1 className="text-slate-100 text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
        </div>

        {/* Success */}
        {success ? (
          <div className="bg-green-950 border border-green-800 rounded-md px-4 py-3 text-green-400 text-sm text-center">
            ✓ Login successful
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                className={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950 border border-red-900 rounded-md px-3 py-2 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              className="mt-1 w-full py-2 rounded-md text-sm font-medium tracking-wide transition-colors
                bg-blue-700 text-blue-50 hover:bg-blue-600
                disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

          </div>
        )}
      </div>
    </main>
  );
}