"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { fetchAdminDashboard } from "@/lib/api";
import type { AdminDashboardPayload } from "@/lib/platform-types";

type OverviewKey = "totalProjects" | "pendingWorks" | "worksInProgress" | "reviewQueue";

function StudioPulseSummary({ payload }: { payload: AdminDashboardPayload | null }) {
  return (
    <div className="glass-panel h-full rounded-[28px] p-4">
      <p className="eyebrow">Studio pulse</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Completed</p>
          <p className="display-title mt-2 text-3xl">{payload?.totals.completed ?? "—"}</p>
        </div>
        <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Architects</p>
          <p className="display-title mt-2 text-3xl">{payload?.totals.architects ?? "—"}</p>
        </div>
        <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Total users</p>
          <p className="display-title mt-2 text-3xl">{payload?.totals.users ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

function RecentActivityPanel({ entries }: { entries: AdminDashboardPayload["recentActivity"] }) {
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const visibleEntries = showAll ? entries : entries.slice(0, 3);

  const panel = (
    <section
      className={`glass-panel rounded-[30px] p-6 ${
        expanded ? "fixed inset-6 z-40 overflow-hidden shadow-[0_40px_80px_rgba(20,20,20,0.25)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Recent activity</p>
          <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">Latest actions across publishing, staff access, and approvals.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="premium-button-soft px-4 py-2 text-sm font-medium"
          >
            {showAll ? "Show latest 3" : "Show all"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="premium-button-soft px-4 py-2 text-sm font-medium"
          >
            {expanded ? "Minimize" : "Expand"}
          </button>
        </div>
      </div>
      <div className={`mt-5 grid gap-3 ${showAll || expanded ? "max-h-[56vh] overflow-y-auto pr-2" : ""}`}>
        {visibleEntries.length ? (
          visibleEntries.map((entry) => (
            <div key={entry._id} className="rounded-[22px] border border-black/8 bg-white/70 p-4">
              <p className="text-sm font-medium capitalize text-[#111111]">{entry.action.replace(/_/g, " ").toLowerCase()}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8f6532]">
                {(entry.actor?.username || entry.actor?.fullName || "System").toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-[#5d5d5d]">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#5d5d5d]">No audit activity is recorded yet.</p>
        )}
      </div>
    </section>
  );

  if (!expanded) {
    return panel;
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-[rgba(24,24,24,0.14)] backdrop-blur-[2px]" />
      {panel}
    </>
  );
}

function AdminDashboardContent({
  token,
  onPayload,
}: {
  token: string;
  onPayload: (payload: AdminDashboardPayload | null) => void;
}) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState<OverviewKey>("reviewQueue");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const adminPayload = await fetchAdminDashboard(token);
        if (!cancelled) {
          setPayload(adminPayload);
          onPayload(adminPayload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          onPayload(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load the admin workspace.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token, onPayload]);

  if (!payload) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel h-32 animate-pulse rounded-[28px]" />
        ))}
      </div>
    );
  }

  const overviewPanels: Record<
    OverviewKey,
    {
      label: string;
      value: number;
      hint: string;
      eyebrow: string;
      title: string;
      description: string;
      projects: AdminDashboardPayload["projects"];
      emptyState: string;
    }
  > = {
    totalProjects: {
      label: "Total projects",
      value: payload.totals.totalProjects,
      hint: "All published and internal works.",
      eyebrow: "Total projects",
      title: "Full studio project register",
      description: "Track every published, internal, and delivered project from a single operations view.",
      projects: payload.projects,
      emptyState: "No projects have been published or created yet.",
    },
    pendingWorks: {
      label: "Pending works",
      value: payload.totals.pendingWorks,
      hint: "Projects waiting for assignment.",
      eyebrow: "Pending works",
      title: "Projects waiting for assignment",
      description: "These briefs are ready to be allocated, scoped, or scheduled into the studio workflow.",
      projects: payload.pendingWorks,
      emptyState: "No pending works are waiting for assignment right now.",
    },
    worksInProgress: {
      label: "In progress",
      value: payload.totals.worksInProgress,
      hint: "Active studio delivery load.",
      eyebrow: "In progress",
      title: "Projects actively in delivery",
      description: "Monitor live execution, client-facing production work, and ongoing delivery pressure across the studio.",
      projects: payload.inProgress,
      emptyState: "No projects are currently in progress.",
    },
    reviewQueue: {
      label: "Review queue",
      value: payload.totals.reviewQueue,
      hint: "Ready for admin review.",
      eyebrow: "Review queue",
      title: "Projects waiting for approval",
      description: "Use this board to review final submissions, escalate changes, and clear approval bottlenecks.",
      projects: payload.reviewQueue,
      emptyState: "No projects are waiting for review right now.",
    },
  };

  const activeOverview = overviewPanels[activePanel];

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(overviewPanels).map(([key, card]) => (
          <MetricCard
            key={key}
            label={card.label}
            value={card.value}
            hint={card.hint}
            active={activePanel === key}
            onClick={() => setActivePanel(key as OverviewKey)}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.64fr)_minmax(360px,0.36fr)]">
        <section className="grid gap-4">
          <div className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">{activeOverview.eyebrow}</p>
            <h2 className="display-title mt-4 text-3xl">{activeOverview.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d5d5d]">
              {activeOverview.description}
            </p>
          </div>

          {activeOverview.projects.length ? (
            activeOverview.projects.map((project) => (
              <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
            ))
          ) : (
            <div className="glass-panel rounded-[30px] p-6 text-sm leading-7 text-[#5d5d5d]">
              {activeOverview.emptyState}
            </div>
          )}
        </section>

        <div className="grid gap-6">
          <RecentActivityPanel entries={payload.recentActivity} />

          <section className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">Service mix</p>
            <div className="mt-5 grid gap-3">
              {Object.entries(payload.categoryBreakdown).length ? (
                Object.entries(payload.categoryBreakdown)
                  .sort(([, left], [, right]) => Number(right) - Number(left))
                  .slice(0, 5)
                  .map(([category, total]) => (
                    <div key={category} className="rounded-[22px] border border-black/8 bg-white/70 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-[#111111]">{category}</p>
                        <p className="text-sm text-[#8f6532]">{total}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-[#5d5d5d]">No service data is available yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);

  return (
    <AdminShell
      title="Admin control center"
      description="Keep the overview page tight: approvals, studio pulse, and the activity trail that needs your attention."
      actions={<StudioPulseSummary payload={payload} />}
    >
      {({ token }) => <AdminDashboardContent token={token} onPayload={setPayload} />}
    </AdminShell>
  );
}
