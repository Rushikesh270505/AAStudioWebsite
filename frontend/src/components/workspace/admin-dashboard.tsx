"use client";

import { FormEvent, useEffect, useState } from "react";
import { createArchitectAccount, fetchAdminDashboard, fetchContactLeads } from "@/lib/api";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { AdminDashboardPayload, ContactLead, UserProfile } from "@/lib/platform-types";

function AdminDashboardContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Admin controls are connected to live dashboard analytics and inquiry capture.");
  const [architectForm, setArchitectForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyArchitectId: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [adminPayload, contactLeads] = await Promise.all([fetchAdminDashboard(token), fetchContactLeads(token)]);
        if (!cancelled) {
          setPayload(adminPayload);
          setLeads(contactLeads);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the admin workspace.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleCreateArchitect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await createArchitectAccount(token, architectForm);
      setMessage(`Architect account created for ${response.user.fullName}. Temporary password: ${response.temporaryPassword}`);
      setArchitectForm({
        fullName: "",
        email: "",
        phone: "",
        companyArchitectId: "",
      });

      const adminPayload = await fetchAdminDashboard(token);
      setPayload(adminPayload);
    } catch (createError) {
      setMessage(createError instanceof Error ? createError.message : "Unable to create the architect account.");
    }
  }

  return (
    <WorkspaceShell
      user={user}
      title="Admin control center"
      description="Monitor the full pipeline, manage architect staffing, review work queues, and capture new website inquiries directly from the live platform."
      navItems={[{ href: "/admin/dashboard", label: "Dashboard" }]}
      notifications={payload?.notifications || []}
    >
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      {!payload ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="glass-panel h-32 animate-pulse rounded-[28px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total projects" value={payload.totals.totalProjects} />
            <MetricCard label="Pending works" value={payload.totals.pendingWorks} />
            <MetricCard label="In progress" value={payload.totals.worksInProgress} />
            <MetricCard label="Review queue" value={payload.totals.reviewQueue} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <h2 className="display-title text-3xl">Review queue</h2>
              {payload.reviewQueue.length ? (
                payload.reviewQueue.map((project) => (
                  <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                  No projects are waiting for review right now.
                </div>
              )}
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Create architect account</p>
              <form onSubmit={handleCreateArchitect} className="mt-5 grid gap-3">
                <input
                  required
                  value={architectForm.fullName}
                  onChange={(event) => setArchitectForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Full name"
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
                <button type="submit" className="premium-button px-4 py-3 text-sm font-medium">
                  Create account
                </button>
              </form>
              <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{message}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.5fr_0.5fr]">
            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Website inquiries</p>
              <div className="mt-5 grid gap-3">
                {leads.length ? (
                  leads.map((lead) => (
                    <div key={lead._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">{lead.fullName}</p>
                      <p className="mt-1 text-sm text-[#5d5d5d]">{lead.email}</p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">{lead.projectType || "Project type pending"} • {lead.budget || "Budget pending"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#5d5d5d]">No contact leads have been captured yet.</p>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Architect workload</p>
              <div className="mt-5 grid gap-3">
                {payload.architectWorkload.length ? (
                  payload.architectWorkload.map((item) => (
                    <div key={item.architect.id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">{item.architect.fullName}</p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">
                        Total {item.total} • Active {item.active} • Review {item.review} • Completed {item.completed}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#5d5d5d]">No architect workload data is available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.5fr_0.5fr]">
            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Category breakdown</p>
              <div className="mt-5 grid gap-3">
                {Object.entries(payload.categoryBreakdown).map(([category, total]) => (
                  <div key={category} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                    <p className="font-medium text-[#111111]">{category}</p>
                    <p className="mt-2 text-sm text-[#5d5d5d]">{total} projects</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Recent activity</p>
              <div className="mt-5 grid gap-3">
                {payload.recentActivity.length ? (
                  payload.recentActivity.map((entry) => (
                    <div key={entry._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">{entry.action.replace(/_/g, " ")}</p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">
                        {entry.actor?.fullName || "System"} • {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#5d5d5d]">No audit activity is recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function AdminDashboard() {
  return (
    <ProtectedArea roles={["admin"]} staffOnly>
      {({ token, user }) => <AdminDashboardContent token={token} user={user} />}
    </ProtectedArea>
  );
}
