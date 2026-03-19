"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { claimProject, fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { createCategoryId, getServiceCategory, serviceCategories } from "@/lib/service-categories";
import { cn } from "@/lib/utils";
import type { ArchitectDashboardPayload, Project, UserProfile } from "@/lib/platform-types";

type WorkCategoryTab = {
  id: string;
  label: string;
  count: number;
};

function AvailableWorkCard({
  project,
  categoryLabel,
  busy,
  onClaim,
}: {
  project: Project;
  categoryLabel: string;
  busy: boolean;
  onClaim: () => void;
}) {
  return (
    <article className="glass-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{categoryLabel}</p>
          <h3 className="display-title mt-4 text-[2rem] leading-[1.02]">{project.title}</h3>
        </div>
        <span className="rounded-full border border-black/8 bg-white/72 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#8f6532]">
          {project.priority}
        </span>
      </div>

      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
        {project.projectCode} • {project.location}
      </p>
      <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{project.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[#6f4a2e]">
        <span className="rounded-full border border-black/8 bg-white/65 px-3 py-2">{project.status.replaceAll("_", " ")}</span>
        {project.deadline ? (
          <span className="rounded-full border border-black/8 bg-white/65 px-3 py-2">
            Due {new Date(project.deadline).toLocaleDateString()}
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onClaim}
          className="premium-button px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Claiming..." : "Take work"}
        </button>
        <Link href={`/projects/${project.slug}`} className="premium-button-soft px-4 py-2 text-sm">
          Open brief
        </Link>
      </div>
    </article>
  );
}

function ArchitectAvailableWorksContent({ token, user }: { token: string; user: UserProfile }) {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [busyProjectId, setBusyProjectId] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
    const groups = new Map<string, number>();

    payload?.availableWorks.forEach((project) => {
      const label = getServiceCategory(project);
      groups.set(label, (groups.get(label) || 0) + 1);
    });

    return [
      { id: "all", label: "All", count: payload?.availableWorks.length || 0 },
      ...serviceCategories.map((label) => ({
        id: createCategoryId(label),
        label,
        count: groups.get(label) || 0,
      })),
    ];
  }, [payload]);

  useEffect(() => {
    if (!selectedCategories.every((category) => categoryTabs.some((tab) => tab.id === category))) {
      setSelectedCategories([]);
    }
  }, [categoryTabs, selectedCategories]);

  useEffect(() => {
    const requestedCategory = searchParams.get("category");

    if (!requestedCategory) {
      return;
    }

    const nextCategory = categoryTabs.find((tab) => tab.label === requestedCategory);

    if (nextCategory && nextCategory.id !== "all") {
      setSelectedCategories([nextCategory.id]);
    }
  }, [categoryTabs, searchParams]);

  const filteredWorks = useMemo(() => {
    if (!payload) {
      return [];
    }

    if (!selectedCategories.length) {
      return payload.availableWorks;
    }

    return payload.availableWorks.filter((project) =>
      selectedCategories.includes(createCategoryId(getServiceCategory(project))),
    );
  }, [payload, selectedCategories]);

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

  function handleCategoryToggle(categoryId: string) {
    if (categoryId === "all") {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((current) =>
      current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId],
    );
  }

  return (
    <WorkspaceShell
      user={user}
      title="Available works"
      description="Use the service filters to browse open studio work and claim what fits your service."
      actions={
        payload ? (
          <div className="grid h-full gap-3 md:grid-cols-2">
            <div className="glass-panel rounded-[24px] px-4 py-4">
              <p className="eyebrow">Claimable works</p>
              <p className="display-title mt-3 text-3xl">{payload.availableWorks.length}</p>
              <p className="mt-2 text-sm text-[#5d5d5d]">Open works ready to claim.</p>
            </div>
            <div className="glass-panel rounded-[24px] px-4 py-4">
              <p className="eyebrow">Due this week</p>
              <p className="display-title mt-3 text-3xl">{dueSoonCount}</p>
              <p className="mt-2 text-sm text-[#5d5d5d]">{highPriorityCount} high-priority items.</p>
            </div>
          </div>
        ) : null
      }
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
          <div className="glass-panel rounded-[28px] p-4">
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryToggle(tab.id)}
                  className={cn(
                    "flex min-w-0 max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition",
                    (tab.id === "all" && !selectedCategories.length) || selectedCategories.includes(tab.id)
                      ? "border-[#c8a97e]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,232,214,0.9))] text-[#2C2C2C] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_20px_rgba(45,45,45,0.08)]"
                      : "border-[#2c2c2c]/12 bg-[#2f2a26] text-[#faf8f4] hover:border-[#c8a97e]/55 hover:bg-[#3a342f]",
                  )}
                >
                  <span className="max-w-full break-words text-left leading-4">{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[9px] tracking-[0.16em]",
                      (tab.id === "all" && !selectedCategories.length) || selectedCategories.includes(tab.id)
                        ? "border-black/8 bg-white/72 text-[#8f6532]"
                        : "border-white/18 bg-white/10 text-[#f2ddc0]",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end">
              <span className="rounded-full border border-black/8 bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#8f6532]">
                {filteredWorks.length} visible
              </span>
            </div>
          </div>

          {filteredWorks.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredWorks.map((project) => (
                <AvailableWorkCard
                  key={project._id}
                  project={project}
                  categoryLabel={getServiceCategory(project)}
                  busy={busyProjectId === project._id}
                  onClaim={() => handleClaim(project._id)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
              No claimable projects are currently available for the selected service categories.
            </div>
          )}
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
