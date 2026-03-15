"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { PresenceIndicator } from "@/components/workspace/presence-indicator";
import { createArchitectAccount, fetchUsers, removeArchitectAccount } from "@/lib/api";
import type { UserProfile } from "@/lib/platform-types";

type ArchitectFormState = {
  username: string;
  email: string;
  password: string;
  phone: string;
  companyArchitectId: string;
};

const emptyForm: ArchitectFormState = {
  username: "",
  email: "",
  password: "",
  phone: "",
  companyArchitectId: "",
};

function StaffManagementContent({ token }: { token: string }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [architectForm, setArchitectForm] = useState<ArchitectFormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState("");

  async function loadUsers() {
    try {
      const nextUsers = await fetchUsers(token);
      setUsers(nextUsers);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load staff accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateUsers() {
      try {
        const nextUsers = await fetchUsers(token);
        if (!cancelled) {
          setUsers(nextUsers);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load staff accounts.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void hydrateUsers();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleCreateArchitect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await createArchitectAccount(token, architectForm);
      setMessage(`Architect account created for ${response.user.username || response.user.fullName}.`);
      setArchitectForm(emptyForm);
      await loadUsers();
    } catch (createError) {
      setMessage(createError instanceof Error ? createError.message : "Unable to create the architect account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveArchitect(architect: UserProfile) {
    const label = architect.username || architect.fullName || architect.email;
    const confirmed = window.confirm(`Remove architect access for ${label}? Existing project history will stay intact.`);

    if (!confirmed) {
      return;
    }

    setRemovingId(architect.id);
    setMessage("");

    try {
      const response = await removeArchitectAccount(token, architect.id);
      setMessage(response.message);
      await loadUsers();
    } catch (removeError) {
      setMessage(removeError instanceof Error ? removeError.message : "Unable to remove architect access.");
    } finally {
      setRemovingId("");
    }
  }

  const activeArchitects = users.filter((user) => user.role === "architect" && user.isActive !== false);
  const protectedAdmins = users.filter((user) => user.role === "admin" && user.isActive !== false);
  const archivedArchitects = users.filter((user) => user.role === "architect" && user.isActive === false);

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active architects" value={activeArchitects.length} hint="Current staff with access." />
        <MetricCard label="Protected admins" value={protectedAdmins.length} hint="Reserved admin accounts." />
        <MetricCard label="Archived architects" value={archivedArchitects.length} hint="Removed from active access." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Create staff account</p>
          <h2 className="display-title mt-4 text-3xl">Add a new architect</h2>
          <form onSubmit={handleCreateArchitect} className="mt-6 grid gap-3">
            <input
              required
              value={architectForm.username}
              onChange={(event) => setArchitectForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Username"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />
            <input
              required
              type="email"
              value={architectForm.email}
              onChange={(event) => setArchitectForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />
            <input
              required
              type="password"
              minLength={8}
              value={architectForm.password}
              onChange={(event) => setArchitectForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={architectForm.phone}
                onChange={(event) => setArchitectForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <input
                value={architectForm.companyArchitectId}
                onChange={(event) => setArchitectForm((current) => ({ ...current, companyArchitectId: event.target.value }))}
                placeholder="Architect ID"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
            </div>
            <button type="submit" disabled={submitting} className="premium-button mt-2 px-4 py-3 text-sm font-medium disabled:opacity-60">
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>
          {message ? <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{message}</p> : null}
        </section>

        <section className="glass-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Studio staff</p>
              <h2 className="display-title mt-4 text-3xl">Active architects</h2>
            </div>
            <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 text-sm text-[#5d5d5d]">
              {activeArchitects.length} staff
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white/60" />)
            ) : activeArchitects.length ? (
              activeArchitects.map((staffMember) => (
                <div key={staffMember.id} className="rounded-[24px] border border-black/8 bg-white/70 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-[#111111]">{staffMember.username || staffMember.fullName}</p>
                        <PresenceIndicator online={staffMember.isOnline} />
                      </div>
                      <p className="mt-1 text-sm text-[#5d5d5d]">{staffMember.email}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                        {staffMember.companyArchitectId || "Architect ID pending"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-black/8 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                        Architect
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArchitect(staffMember)}
                        disabled={removingId === staffMember.id}
                        className="rounded-full border border-[#d5b48a]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,229,208,0.88))] px-4 py-2 text-sm font-medium text-[#7d5330] transition hover:shadow-[0_12px_24px_rgba(200,169,126,0.16)] disabled:opacity-60"
                      >
                        {removingId === staffMember.id ? "Removing..." : "Remove architect"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">No architect accounts are active yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Protected admins</p>
          <div className="mt-5 grid gap-3">
            {protectedAdmins.map((admin) => (
              <div key={admin.id} className="rounded-[24px] border border-black/8 bg-white/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[#111111]">{admin.username || admin.fullName}</p>
                    <p className="mt-1 text-sm text-[#5d5d5d]">{admin.email}</p>
                  </div>
                  <span className="rounded-full border border-black/8 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                    Admin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Archived architects</p>
          <div className="mt-5 grid gap-3">
            {archivedArchitects.length ? (
              archivedArchitects.map((architect) => (
                <div key={architect.id} className="rounded-[24px] border border-black/8 bg-white/70 p-5">
                  <p className="text-lg font-semibold text-[#111111]">{architect.username || architect.fullName}</p>
                  <p className="mt-1 text-sm text-[#5d5d5d]">{architect.email}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">No architects have been removed yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminStaff() {
  return (
    <AdminShell
      title="Staff management"
      description="Create architect accounts with assigned passwords, keep the active staff roster clean, and remove architect access when needed."
    >
      {({ token }) => <StaffManagementContent token={token} />}
    </AdminShell>
  );
}
