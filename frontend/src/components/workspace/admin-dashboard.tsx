"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { fetchAdminDashboard } from "@/lib/api";
import type { AdminDashboardPayload } from "@/lib/platform-types";

function AdminDashboardContent({ token }: { token: string }) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const adminPayload = await fetchAdminDashboard(token);
        if (!cancelled) {
          setPayload(adminPayload);
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

  if (!payload) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel h-32 animate-pulse rounded-[28px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total projects" value={payload.totals.totalProjects} hint="All published and internal works." />
        <MetricCard label="Pending works" value={payload.totals.pendingWorks} hint="Projects waiting for assignment." />
        <MetricCard label="In progress" value={payload.totals.worksInProgress} hint="Active studio delivery load." />
        <MetricCard label="Review queue" value={payload.totals.reviewQueue} hint="Ready for admin review." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
        <section className="grid gap-4">
          <div className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">Review queue</p>
            <h2 className="display-title mt-4 text-3xl">Projects waiting for approval</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d5d5d]">
              Keep this board focused on approvals and escalations. Staff operations, workload, inquiries, and publishing now
              sit in their own dedicated sections.
            </p>
          </div>

          {payload.reviewQueue.length ? (
            payload.reviewQueue.map((project) => (
              <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
            ))
          ) : (
            <div className="glass-panel rounded-[30px] p-6 text-sm leading-7 text-[#5d5d5d]">
              No projects are waiting for review right now.
            </div>
          )}
        </section>

        <div className="grid gap-6">
          <section className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">Studio pulse</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Completed</p>
                <p className="display-title mt-2 text-3xl">{payload.totals.completed}</p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Architects</p>
                <p className="display-title mt-2 text-3xl">{payload.totals.architects}</p>
              </div>
              <div className="rounded-[24px] border border-black/8 bg-white/72 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Total users</p>
                <p className="display-title mt-2 text-3xl">{payload.totals.users}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">Recent activity</p>
            <div className="mt-5 grid gap-3">
              {payload.recentActivity.length ? (
                payload.recentActivity.slice(0, 6).map((entry) => (
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
  return (
    <AdminShell
      title="Admin control center"
      description="Keep the overview page tight: approvals, studio pulse, and the activity trail that needs your attention."
    >
      {({ token }) => <AdminDashboardContent token={token} />}
    </AdminShell>
  );
}
