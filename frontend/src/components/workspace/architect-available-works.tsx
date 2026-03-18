"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { claimProject, fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { cn } from "@/lib/utils";
import type { ArchitectDashboardPayload, Project, UserProfile } from "@/lib/platform-types";

type WorkCategoryTab = {
  id: string;
  label: string;
  count: number;
};

function getWorkCategory(project: Project) {
  return project.serviceType || project.category || project.projectType || "General";
}

function createCategoryId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ArchitectAvailableWorksContent({ token, user }: { token: string; user: UserProfile }) {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [busyProjectId, setBusyProjectId] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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
          setError(loadError instanceof Error ? loadError.message : "Unable to load available work.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const categoryTabs = useMemo<WorkCategoryTab[]>(() => {
    if (!payload?.availableWorks.length) {
      return [{ id: "all", label: "All works", count: 0 }];
    }

    const groups = new Map<string, number>();

    payload.availableWorks.forEach((project) => {
      const label = getWorkCategory(project);
      groups.set(label, (groups.get(label) || 0) + 1);
    });

    return [
      { id: "all", label: "All works", count: payload.availableWorks.length },
      ...Array.from(groups.entries())
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([label, count]) => ({
          id: createCategoryId(label),
          label,
          count,
        })),
    ];
  }, [payload]);

  useEffect(() => {
    if (!categoryTabs.some((tab) => tab.id === activeCategory)) {
      setActiveCategory("all");
    }
  }, [activeCategory, categoryTabs]);

  useEffect(() => {
    const requestedCategory = searchParams.get("category");

    if (!requestedCategory) {
      return;
    }

    const nextCategory = categoryTabs.find((tab) => tab.label === requestedCategory);

    if (nextCategory && nextCategory.id !== activeCategory) {
      setActiveCategory(nextCategory.id);
    }
  }, [activeCategory, categoryTabs, searchParams]);

  const filteredWorks = useMemo(() => {
    if (!payload) {
      return [];
    }

    if (activeCategory === "all") {
      return payload.availableWorks;
    }

    return payload.availableWorks.filter((project) => createCategoryId(getWorkCategory(project)) === activeCategory);
  }, [activeCategory, payload]);

  const selectedCategoryLabel =
    categoryTabs.find((tab) => tab.id === activeCategory)?.label || "All works";
  const highPriorityCount =
    payload?.availableWorks.filter((project) => ["HIGH", "CRITICAL"].includes(project.priority)).length || 0;
  const dueSoonCount =
    payload?.availableWorks.filter((project) => {
      if (!project.deadline) {
        return false;
      }

      const deadline = new Date(project.deadline).getTime();
      const now = Date.now();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      return deadline >= now && deadline - now <= weekInMs;
    }).length || 0;

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
      title="Available works"
      description="Browse open studio commissions by service category, review each brief, and claim the works that align with your expertise."
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
            <MetricCard label="Claimable works" value={payload.availableWorks.length} hint="Open projects waiting for an architect." />
            <MetricCard label="Service categories" value={Math.max(categoryTabs.length - 1, 0)} hint="Organized categories to browse through." />
            <MetricCard label="Selected category" value={filteredWorks.length} hint={selectedCategoryLabel} />
            <MetricCard label="Due this week" value={dueSoonCount} hint={`${highPriorityCount} high-priority opportunities`} />
          </div>

          <div className="glass-panel sticky top-4 z-20 rounded-[24px] p-3 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    "glass-tab inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition",
                    activeCategory === tab.id
                      ? "border-[#c8a97e]/70 bg-white/90 text-[#2C2C2C] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(45,45,45,0.08)]"
                      : "text-[#5d5d5d] hover:border-[#c8a97e]/60 hover:text-[#2C2C2C]",
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full border border-black/8 bg-white/70 px-2 py-1 text-[10px] tracking-[0.18em] text-[#8f6532]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.64fr_0.36fr]">
            <div className="grid gap-4">
              <div className="glass-panel rounded-[30px] p-6">
                <p className="eyebrow">Category overview</p>
                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="display-title text-3xl">{selectedCategoryLabel}</h2>
                    <p className="mt-2 text-sm leading-7 text-[#5d5d5d]">
                      Use the category bar above to move across different types of available work and claim only the commissions that suit your current bandwidth.
                    </p>
                  </div>
                  <span className="rounded-full border border-black/8 bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                    {filteredWorks.length} open
                  </span>
                </div>
              </div>

              {filteredWorks.length ? (
                filteredWorks.map((project) => (
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
                  No claimable projects are currently available in this category.
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Category list</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {categoryTabs.slice(1).length ? (
                    categoryTabs.slice(1).map((tab) => (
                      <button
                        key={`chip-${tab.id}`}
                        type="button"
                        onClick={() => setActiveCategory(tab.id)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition",
                          activeCategory === tab.id
                            ? "border-[#c8a97e]/70 bg-[#f7ecdc] text-[#6f4a2e]"
                            : "border-black/8 bg-white/70 text-[#6b6258] hover:border-[#c8a97e]/55 hover:text-[#2c2c2c]",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-[#5d5d5d]">Categories will appear here once new unclaimed work is published.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="eyebrow">Queue health</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8f6532]">High priority</p>
                    <p className="mt-3 text-lg font-semibold text-[#111111]">{highPriorityCount}</p>
                  </div>
                  <div className="rounded-[22px] border border-black/8 bg-white/65 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8f6532]">Due this week</p>
                    <p className="mt-3 text-lg font-semibold text-[#111111]">{dueSoonCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ArchitectAvailableWorks() {
  return (
    <ProtectedArea roles={["architect"]}>
      {({ token, user }) => <ArchitectAvailableWorksContent token={token} user={user} />}
    </ProtectedArea>
  );
}
