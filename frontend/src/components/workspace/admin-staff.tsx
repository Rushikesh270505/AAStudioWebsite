"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { PresenceIndicator } from "@/components/workspace/presence-indicator";
import { archiveArchitectAccount, createArchitectAccount, fetchUsers, terminateArchitectAccount } from "@/lib/api";
import type { UserProfile } from "@/lib/platform-types";

type ArchitectFormState = {
  username: string;
  email: string;
  password: string;
  phone: string;
  companyArchitectId: string;
  archivedSourceId?: string;
};

const emptyForm: ArchitectFormState = {
  username: "",
  email: "",
  password: "",
  phone: "",
  companyArchitectId: "",
  archivedSourceId: undefined,
};

function getUserKey(user: UserProfile) {
  return user._id || user.id;
}

function normalizeSearchValue(value: string | undefined) {
  return String(value || "").trim().toLowerCase();
}

function matchesArchitectSearch(user: UserProfile, query: string) {
  if (!query) {
    return true;
  }

  const search = normalizeSearchValue(query);
  const fields = [
    user.username,
    user.fullName,
    user.email,
    user.archivedEmail,
    user.phone,
    user.archivedPhone,
    user.companyArchitectId,
  ];

  return fields.some((field) => normalizeSearchValue(field).includes(search));
}

const sectionTabs = [
  { id: "summary", label: "Summary" },
  { id: "create", label: "Create" },
  { id: "active", label: "Active" },
  { id: "admins", label: "Admins" },
  { id: "archived", label: "Archived" },
] as const;

type StaffSection = (typeof sectionTabs)[number]["id"];

function StaffManagementContent({ token }: { token: string }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [architectForm, setArchitectForm] = useState<ArchitectFormState>(emptyForm);
  const [activeSection, setActiveSection] = useState<StaffSection>("summary");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [archivingId, setArchivingId] = useState("");
  const [terminatingId, setTerminatingId] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");
  const createSectionRef = useRef<HTMLElement | null>(null);

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
      setMessage(response.message || `Architect account created for ${response.user.username || response.user.fullName}.`);
      setArchitectForm(emptyForm);
      await loadUsers();
    } catch (createError) {
      setMessage(createError instanceof Error ? createError.message : "Unable to create the architect account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveArchitect(architect: UserProfile) {
    setArchivingId(getUserKey(architect));
    setMessage("");

    try {
      const response = await archiveArchitectAccount(token, getUserKey(architect));
      setMessage(response.message);
      await loadUsers();
    } catch (archiveError) {
      setMessage(archiveError instanceof Error ? archiveError.message : "Unable to archive architect access.");
    } finally {
      setArchivingId("");
    }
  }

  async function handleTerminateArchitect(architect: UserProfile) {
    setTerminatingId(getUserKey(architect));
    setMessage("");

    try {
      const response = await terminateArchitectAccount(token, getUserKey(architect));
      setMessage(response.message);
      await loadUsers();
    } catch (terminateError) {
      setMessage(terminateError instanceof Error ? terminateError.message : "Unable to terminate architect.");
    } finally {
      setTerminatingId("");
    }
  }

  function handleActivateArchivedArchitect(architect: UserProfile) {
    setArchitectForm({
      username: architect.fullName || architect.username || "",
      email: architect.archivedEmail || architect.email || "",
      password: "",
      phone: architect.archivedPhone || architect.phone || "",
      companyArchitectId: "",
      archivedSourceId: getUserKey(architect),
    });
    setActiveSection("create");
    setError("");
    setMessage("Archived architect details loaded. Set a new password and complete any remaining fields to reactivate.");
    createSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activeArchitects = users.filter((user) => user.role === "architect" && user.isActive !== false);
  const protectedAdmins = users.filter((user) => user.role === "admin" && user.isActive !== false);
  const archivedArchitects = users.filter((user) => user.role === "architect" && user.isActive === false);
  const filteredActiveArchitects = activeArchitects.filter((user) => matchesArchitectSearch(user, activeSearch));
  const filteredArchivedArchitects = archivedArchitects.filter((user) => matchesArchitectSearch(user, archivedSearch));

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="glass-panel sticky top-4 z-20 rounded-[24px] p-3 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`glass-tab rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                activeSection === tab.id
                  ? "border-[#c8a97e]/70 bg-white/90 text-[#2C2C2C] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(45,45,45,0.08)]"
                  : "text-[#5d5d5d] hover:border-[#c8a97e]/60 hover:text-[#2C2C2C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message ? <div className="glass-panel rounded-[28px] p-5 text-sm leading-7 text-[#5d5d5d]">{message}</div> : null}

      {activeSection === "summary" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Active architects" value={activeArchitects.length} hint="Current staff with access." />
          <MetricCard label="Protected admins" value={protectedAdmins.length} hint="Reserved admin accounts." />
          <MetricCard label="Archived architects" value={archivedArchitects.length} hint="Removed from active access." />
        </div>
      ) : null}

      {activeSection === "create" ? (
        <section
          id="staff-create"
          ref={createSectionRef}
          className="glass-panel rounded-[30px] p-6"
        >
          <p className="eyebrow">Create staff account</p>
          <h2 className="display-title mt-4 text-3xl">
            {architectForm.archivedSourceId ? "Reactivate archived architect" : "Add a new architect"}
          </h2>
          {architectForm.archivedSourceId ? (
            <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
              This form is linked to an archived architect. Set a new password and complete the remaining fields to move them back into the active staff list.
            </p>
          ) : null}
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
            {architectForm.archivedSourceId ? (
              <button
                type="button"
                onClick={() => {
                  setArchitectForm(emptyForm);
                  setMessage("");
                }}
                className="premium-button-soft mt-1 px-4 py-3 text-sm font-medium"
              >
                Cancel reactivation
              </button>
            ) : null}
            <button type="submit" disabled={submitting} className="premium-button mt-2 px-4 py-3 text-sm font-medium disabled:opacity-60">
              {submitting ? (architectForm.archivedSourceId ? "Reactivating..." : "Creating...") : architectForm.archivedSourceId ? "Reactivate account" : "Create account"}
            </button>
          </form>
        </section>
      ) : null}

      {activeSection === "active" ? (
        <section id="staff-active" className="glass-panel rounded-[30px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Studio staff</p>
              <h2 className="display-title mt-4 text-3xl">Active architects</h2>
            </div>
            <div className="rounded-full border border-black/8 bg-white/75 px-4 py-2 text-sm text-[#5d5d5d]">
              {activeArchitects.length} staff
            </div>
          </div>
          <div className="mt-5">
            <input
              value={activeSearch}
              onChange={(event) => setActiveSearch(event.target.value)}
              placeholder="Search active staff by username, email, phone, or architect ID"
              className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#c8a97e]"
            />
          </div>
          <div className="mt-6 grid gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white/60" />)
            ) : filteredActiveArchitects.length ? (
              filteredActiveArchitects.map((staffMember) => (
                <div key={getUserKey(staffMember)} className="rounded-[24px] border border-black/8 bg-white/70 p-5">
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
                        onClick={() => void handleArchiveArchitect(staffMember)}
                        disabled={archivingId === getUserKey(staffMember) || terminatingId === getUserKey(staffMember)}
                        className="rounded-full border border-[#d5b48a]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,229,208,0.88))] px-4 py-2 text-sm font-medium text-[#7d5330] transition hover:shadow-[0_12px_24px_rgba(200,169,126,0.16)] disabled:opacity-60"
                      >
                        {archivingId === getUserKey(staffMember) ? "Archiving..." : "Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleTerminateArchitect(staffMember)}
                        disabled={archivingId === getUserKey(staffMember) || terminatingId === getUserKey(staffMember)}
                        className="rounded-full border border-[#d28d82]/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,222,216,0.88))] px-4 py-2 text-sm font-medium text-[#8f3f32] transition hover:shadow-[0_12px_24px_rgba(210,141,130,0.16)] disabled:opacity-60"
                      >
                        {terminatingId === getUserKey(staffMember) ? "Terminating..." : "Terminate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">
                {activeSearch ? "No active architects match this search." : "No architect accounts are active yet."}
              </p>
            )}
          </div>
        </section>
      ) : null}

      {activeSection === "admins" ? (
        <section id="staff-admins" className="glass-panel rounded-[30px] p-6">
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
      ) : null}

      {activeSection === "archived" ? (
        <section id="staff-archived" className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Archived architects</p>
          <div className="mt-5">
            <input
              value={archivedSearch}
              onChange={(event) => setArchivedSearch(event.target.value)}
              placeholder="Search archived staff by username, email, phone, or architect ID"
              className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#c8a97e]"
            />
          </div>
          <div className="mt-5 grid gap-3">
            {filteredArchivedArchitects.length ? (
              filteredArchivedArchitects.map((architect) => (
                <div key={getUserKey(architect)} className="rounded-[24px] border border-black/8 bg-white/70 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[#111111]">{architect.fullName || architect.username}</p>
                      <p className="mt-1 text-sm text-[#5d5d5d]">{architect.archivedEmail || architect.email}</p>
                      {architect.archivedPhone ? <p className="mt-1 text-sm text-[#5d5d5d]">{architect.archivedPhone}</p> : null}
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                        Archived {architect.archivedAt ? new Date(architect.archivedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleActivateArchivedArchitect(architect)}
                      className="rounded-full border border-[#c8a97e]/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,232,214,0.92))] px-5 py-2.5 text-sm font-medium text-[#7d5330] transition hover:shadow-[0_12px_24px_rgba(200,169,126,0.16)]"
                    >
                      Activate
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">
                {archivedSearch ? "No archived architects match this search." : "No architects have been removed yet."}
              </p>
            )}
          </div>
        </section>
      ) : null}
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
