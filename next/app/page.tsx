"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogin = async () => {
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
        if (data?.auth_token) {
          localStorage.setItem("auth_token", data.auth_token);
        }
        setLoggedIn(true);
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("http://127.0.0.1:8000/auth/token/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      });
    } catch {
      // Logout best-effort
    } finally {
      localStorage.removeItem("auth_token");
      setLoggedIn(false);
      setUsername("");
      setPassword("");
      setLogoutLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500 transition-colors";

  // ── Logged-in view ────────────────────────────────────────────────────────
  if (loggedIn) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg p-8 flex flex-col items-center gap-6">

          {/* Avatar */}
          <div className="relative w-24 h-24 overflow-hidden ring-slate-600">
            <Image
              src={`https://media.tenor.com/jaX_i8ry6AQAAAAj/enterprise-confused.gif`}
              alt="User avatar"
              fill
              className="object-cover"
            />
          </div>

          {/* Welcome message */}
          <div className="text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
              Welcome back
            </p>
            <h1 className="text-slate-100 text-2xl font-semibold tracking-tight">
              {username}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              You are successfully authenticated.
            </p>
          </div>

          {/* Token preview */}
          <div className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2">
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Token</p>
            <p className="text-slate-400 text-xs font-mono truncate">
              {localStorage.getItem("auth_token") ?? "—"}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full py-2 rounded-md text-sm font-medium tracking-wide transition-colors
              bg-slate-700 text-slate-200 hover:bg-slate-600
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? "Signing out…" : "Sign out"}
          </button>

        </div>
      </main>
    );
  }

  // ── Login view ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg p-8">

        {/* Logo / illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-700 ring-2 ring-slate-600">
            <Image
              src="https://api.dicebear.com/9.x/shapes/svg?seed=login&backgroundColor=1e3a5f"
              alt="App logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
            Authentication
          </p>
          <h1 className="text-slate-100 text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
        </div>

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
              onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
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
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="mt-1 w-full py-2 rounded-md text-sm font-medium tracking-wide transition-colors
              bg-blue-700 text-blue-50 hover:bg-blue-600
              disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

        </div>
      </div>
    </main>
  );
}