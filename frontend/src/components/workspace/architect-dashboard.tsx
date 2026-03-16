"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { UpdateFeed } from "@/components/workspace/update-feed";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { ArchitectDashboardPayload, Project, UserProfile } from "@/lib/platform-types";

function getWorkCategory(project: Project) {
  return project.serviceType || project.category || project.projectType || "General";
}

function ArchitectDashboardContent({ token, user }: { token: string; user: UserProfile }) {
  const router = useRouter();
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

  const availableCategories = useMemo(
    () => (payload ? Array.from(new Set(payload.availableWorks.map((project) => getWorkCategory(project)))).slice(0, 6) : []),
    [payload],
  );

  return (
    <WorkspaceShell
      user={user}
      title="Architect dashboard"
      description="Claim new work, monitor active commissions, prepare review-ready submissions, and keep delivery organized with a cleaner studio-facing board."
      navItems={[...architectNavItems]}
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
            <MetricCard
              label="Available works"
              value={payload.overview.availableCount}
              hint="Open the dedicated section to browse and claim."
              onClick={() => router.push("/architect/available-works")}
            />
            <MetricCard label="Active projects" value={payload.overview.activeCount} />
            <MetricCard label="Ready for review" value={payload.overview.reviewCount} />
            <MetricCard label="Overdue" value={payload.overview.overdueCount} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.56fr_0.44fr]">
            <div className="grid gap-4">
              <div className="glass-panel rounded-[30px] p-6">
                <p className="eyebrow">Available works</p>
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="display-title text-3xl">Browse by service category</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d5d5d]">
                      Claimable studio work now lives in a dedicated section so you can browse categories with more focus and take only the projects that fit your capacity.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/architect/available-works")}
                    className="premium-button px-5 py-3 text-sm font-medium"
                  >
                    Open available works
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {availableCategories.length ? (
                    availableCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => router.push(`/architect/available-works?category=${encodeURIComponent(category)}`)}
                        className="rounded-full border border-black/8 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6b6258] transition hover:border-[#c8a97e]/55 hover:text-[#2c2c2c]"
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">No unclaimed categories are open right now.</p>
                  )}
                </div>
                {payload.availableWorks.length ? (
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {payload.availableWorks.slice(0, 2).map((project) => (
                      <div key={project._id} className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                        <p className="font-medium text-[#111111]">{project.title}</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#8f6532]">
                          {getWorkCategory(project)}
                        </p>
                        <p className="mt-3 text-sm text-[#5d5d5d]">{project.location}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
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
