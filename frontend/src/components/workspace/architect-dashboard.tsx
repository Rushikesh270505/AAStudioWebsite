"use client";

import { useEffect, useState } from "react";
import { fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { UpdateFeed } from "@/components/workspace/update-feed";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { ArchitectDashboardPayload, UserProfile } from "@/lib/platform-types";

function ArchitectDashboardContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");

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

  return (
    <WorkspaceShell
      user={user}
      title="Architect dashboard"
      description="Track the projects you have already claimed or been assigned, prepare review-ready submissions, and keep your delivery board organized."
      navItems={[...architectNavItems]}
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
            <MetricCard label="My projects" value={payload.overview.activeCount} />
            <MetricCard label="Ready for review" value={payload.overview.reviewCount} />
            <MetricCard label="Overdue" value={payload.overview.overdueCount} />
            <MetricCard label="Completed work" value={payload.completed.length} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <div>
                <h2 className="display-title text-3xl">My projects</h2>
              </div>
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
              <div>
                <h2 className="display-title text-3xl">Latest updates</h2>
              </div>
              <UpdateFeed updates={payload.updates} emptyLabel="No architect updates are available yet." />
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <p className="eyebrow">Current workload</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8f6532]">Claimed projects</p>
                  <p className="mt-3 text-3xl font-semibold text-[#111111]">{payload.myProjects.length}</p>
                </div>
                <div className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8f6532]">Review-ready submissions</p>
                  <p className="mt-3 text-3xl font-semibold text-[#111111]">{payload.readyForReview.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.5fr_0.5fr]">
            <div className="glass-panel rounded-[28px] border border-white/50 p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
              <p className="eyebrow">Ready for review</p>
              <div className="mt-5 grid gap-3">
                {payload.readyForReview.length ? (
                  payload.readyForReview.map((project) => (
                    <div key={project._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">{project.title}</p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">{project.location}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#5d5d5d]">Nothing is waiting for review approval right now.</p>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[28px] border border-white/50 p-6 shadow-[0_20px_50px_rgba(17,17,17,0.05)]">
              <p className="eyebrow">Completed work</p>
              <div className="mt-5 grid gap-3">
                {payload.completed.length ? (
                  payload.completed.slice(0, 5).map((project) => (
                    <div key={project._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                      <p className="font-medium text-[#111111]">{project.title}</p>
                      <p className="mt-2 text-sm text-[#5d5d5d]">{project.location}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#5d5d5d]">Completed projects will appear here once they close out.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ArchitectDashboard() {
  return (
    <ProtectedArea roles={["architect"]}>
      {({ token, user }) => <ArchitectDashboardContent token={token} user={user} />}
    </ProtectedArea>
  );
}
