"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { claimProject, fetchArchitectDashboard } from "@/lib/api";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { UpdateFeed } from "@/components/workspace/update-feed";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { ArchitectDashboardPayload, UserProfile } from "@/lib/platform-types";

function ArchitectDashboardContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [busyProjectId, setBusyProjectId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetchArchitectDashboard(token);
        if (!cancelled) {
          setPayload(response);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the architect workspace.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleClaim(projectId: string) {
    setBusyProjectId(projectId);

    try {
      await claimProject(token, projectId);
      const response = await fetchArchitectDashboard(token);
      setPayload(response);
      setError("");
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unable to claim this work item.");
    } finally {
      setBusyProjectId("");
    }
  }

  return (
    <WorkspaceShell
      user={user}
      title="Architect dashboard"
      description="Claim new work, monitor active commissions, prepare review-ready submissions, and keep collaboration visible across delivery milestones."
      navItems={[{ href: "/architect/dashboard", label: "Dashboard" }]}
      notifications={payload?.notifications || []}
      actions={
        <Link href="/projects" className="premium-button px-4 py-2 text-sm font-medium">
          Public portfolio
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
            <MetricCard label="Available works" value={payload.overview.availableCount} />
            <MetricCard label="Active projects" value={payload.overview.activeCount} />
            <MetricCard label="Ready for review" value={payload.overview.reviewCount} />
            <MetricCard label="Overdue" value={payload.overview.overdueCount} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="display-title text-3xl">Available works</h2>
                <span className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Claimable</span>
              </div>
              {payload.availableWorks.length ? (
                payload.availableWorks.map((project) => (
                  <ProjectListCard
                    key={project._id}
                    project={project}
                    href={`/projects/${project.slug}`}
                    action={
                      <button
                        type="button"
                        disabled={busyProjectId === project._id}
                        onClick={() => handleClaim(project._id)}
                        className="premium-button px-4 py-2 text-sm font-medium disabled:opacity-60"
                      >
                        {busyProjectId === project._id ? "Claiming..." : "Claim"}
                      </button>
                    }
                  />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                  No unclaimed projects are currently in the queue.
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Due soon</p>
                <div className="mt-5 grid gap-3">
                  {payload.dueSoon.length ? (
                    payload.dueSoon.map((project) => (
                      <div key={project._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                        <p className="font-medium text-[#111111]">{project.title}</p>
                        <p className="mt-2 text-sm text-[#5d5d5d]">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Deadline pending"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">Nothing due within the next week.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Upcoming meetings and visits</p>
                <div className="mt-5 grid gap-3">
                  {[...payload.meetings, ...payload.siteVisits].slice(0, 6).map((item) => (
                    <div key={item._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">
                        {"title" in item ? item.title : item.location}
                      </p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">
                        {"scheduledAt" in item
                          ? new Date(item.scheduledAt).toLocaleString()
                          : new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {!payload.meetings.length && !payload.siteVisits.length ? (
                    <p className="text-sm text-[#5d5d5d]">No meetings or visits are scheduled yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <h2 className="display-title text-3xl">My projects</h2>
              {payload.myProjects.length ? (
                payload.myProjects.map((project) => (
                  <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
                ))
              ) : (
                <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                  You have not claimed or been assigned any projects yet.
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <h2 className="display-title text-3xl">Latest updates</h2>
              </div>
              <UpdateFeed updates={payload.updates} emptyLabel="No architect updates are available yet." />
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ArchitectDashboard() {
  return (
    <ProtectedArea roles={["architect"]} staffOnly>
      {({ token, user }) => <ArchitectDashboardContent token={token} user={user} />}
    </ProtectedArea>
  );
}
