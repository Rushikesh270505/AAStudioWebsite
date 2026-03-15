"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchClientDashboard } from "@/lib/api";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { UpdateFeed } from "@/components/workspace/update-feed";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { ClientDashboardPayload, UserProfile } from "@/lib/platform-types";

function ClientDashboardContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<ClientDashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetchClientDashboard(token);
        if (!cancelled) {
          setPayload(response);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the client workspace.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <WorkspaceShell
      user={user}
      title="Client dashboard"
      description="Track assigned projects, review files, inspect progress updates, and stay aligned on meetings, invoices, and delivery checkpoints."
      navItems={[
        { href: "/client/dashboard", label: "Overview" },
        { href: "/client/meetings", label: "Meetings" },
      ]}
      notifications={payload?.notifications || []}
      actions={
        <Link href="/contact" className="premium-button px-4 py-2 text-sm font-medium">
          New inquiry
        </Link>
      }
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
            <MetricCard label="Assigned projects" value={payload.overview.assignedProjects} />
            <MetricCard label="Active projects" value={payload.overview.activeProjects} />
            <MetricCard label="Pending invoices" value={payload.overview.pendingInvoices} />
            <MetricCard label="Unread notifications" value={payload.overview.unreadNotifications} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="display-title text-3xl">Assigned projects</h2>
                <span className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{payload.projects.length} total</span>
              </div>
              {payload.projects.length ? (
                payload.projects.map((project) => (
                  <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                  No projects are assigned to this client account yet.
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Upcoming meetings</p>
                <div className="mt-5 grid gap-3">
                  {payload.meetings.length ? (
                    payload.meetings.map((meeting) => (
                      <div key={meeting._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                        <p className="font-medium text-[#111111]">{meeting.title}</p>
                        <p className="mt-2 text-sm text-[#5d5d5d]">
                          {new Date(meeting.scheduledAt).toLocaleString()}
                          {meeting.location ? ` • ${meeting.location}` : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">No meetings scheduled yet.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Upcoming site visits</p>
                <div className="mt-5 grid gap-3">
                  {payload.siteVisits.length ? (
                    payload.siteVisits.map((visit) => (
                      <div key={visit._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                        <p className="font-medium text-[#111111]">{visit.location}</p>
                        <p className="mt-2 text-sm text-[#5d5d5d]">{new Date(visit.date).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">No site visits scheduled yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <h2 className="display-title text-3xl">Recent updates</h2>
              <UpdateFeed updates={payload.updates} emptyLabel="No project updates are available yet." />
            </div>

            <div className="grid gap-4">
              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Invoices</p>
                <div className="mt-5 grid gap-3">
                  {payload.invoices.length ? (
                    payload.invoices.map((invoice) => (
                      <div key={invoice._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                        <p className="font-medium text-[#111111]">{invoice.invoiceNumber}</p>
                        <p className="mt-2 text-sm text-[#5d5d5d]">
                          {invoice.amount.toLocaleString()} • {invoice.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">No invoices are attached yet.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Recent files</p>
                <div className="mt-5 grid gap-3">
                  {payload.files.length ? (
                    payload.files.map((file) => (
                      <a
                        key={file._id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[22px] border border-black/8 bg-white/65 p-4 transition-colors hover:border-[#c8a97e]/38"
                      >
                        <p className="font-medium text-[#111111]">{file.name}</p>
                        <p className="mt-2 text-sm text-[#5d5d5d]">{file.kind}</p>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">No files are published for this account yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ClientDashboard() {
  return (
    <ProtectedArea roles={["client", "public_user"]}>
      {({ token, user }) => <ClientDashboardContent token={token} user={user} />}
    </ProtectedArea>
  );
}
