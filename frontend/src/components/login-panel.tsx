"use client";

import { FormEvent, useState } from "react";
import { loginDemoProfiles } from "@/lib/site-data";
import { loginUser } from "@/lib/api";

export function LoginPanel() {
  const [email, setEmail] = useState(loginDemoProfiles[1].email);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    "Seeded demo users are listed below. Passwords are generated at seed time or provided through backend env vars, not stored in the repo.",
  );
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("Signing in...");

    try {
      const response = await loginUser(email, password);
      localStorage.setItem("aa_token", response.token);
      localStorage.setItem("aa_role", response.user.role);
      setMessage(`Authenticated as ${response.user.role}. Token saved in localStorage for dashboard and admin API calls.`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unable to sign in.";
      setMessage(reason);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Secure access</p>
        <h1 className="display-title mt-4 text-4xl md:text-5xl">Client and studio authentication</h1>
        <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
          JWT-based login powers the dashboard, architect workspace, and admin controls. Demo users are seeded in the backend, but demo passwords are no longer committed to source control.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#5d5d5d]">{message}</p>
          <button
            type="submit"
            disabled={isPending}
            className="premium-button px-6 py-3 text-sm font-medium disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {loginDemoProfiles.map((credential) => (
          <button
            key={credential.role}
            type="button"
            onClick={() => {
              setEmail(credential.email);
              setPassword("");
            }}
            className="glass-panel rounded-[28px] p-5 text-left"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{credential.role}</p>
            <p className="mt-2 text-sm text-[#212121]">{credential.email}</p>
            <p className="mt-1 text-sm text-[#5d5d5d]">Password is set when you run the backend seed.</p>
          </button>
        ))}
      </div>
    </div>
  );
}
