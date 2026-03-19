"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { createCategoryId, getServiceCategory } from "@/lib/service-categories";
import { cn } from "@/lib/utils";
import type { ArchitectDashboardPayload, Project, UserProfile } from "@/lib/platform-types";

type ProjectCategoryTab = {
  id: string;
  label: string;
  count: number;
};

function ArchitectMyProjectsContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");
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
          setError(loadError instanceof Error ? loadError.message : "Unable to load your projects.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredProjects = useMemo(() => {
    if (!payload) {
      return [];
    }

    if (!selectedCategories.length) {
      return payload.myProjects;
    }

    return payload.myProjects.filter((project) =>
      selectedCategories.includes(createCategoryId(getServiceCategory(project))),
    );
  }, [payload, selectedCategories]);

  const categoryTabs = useMemo<ProjectCategoryTab[]>(() => {
    const groups = new Map<string, number>();

    payload?.myProjects.forEach((project) => {
      const label = getServiceCategory(project);
      groups.set(label, (groups.get(label) || 0) + 1);
    });

    const presentCategories = Array.from(groups.keys());

    return [
      { id: "all", label: "All", count: payload?.myProjects.length || 0 },
      ...presentCategories.map((label) => ({
        id: createCategoryId(label),
        label,
        count: groups.get(label) || 0,
      })),
    ];
  }, [payload]);

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
      title="My projects"
      description="Use this board to open only the work you already own."
      actions={
        payload ? (
          <div className="grid h-full gap-3 sm:grid-cols-2">
            <div className="glass-panel rounded-[22px] px-4 py-4">
              <p className="eyebrow">My projects</p>
              <p className="display-title mt-3 text-3xl">{payload.myProjects.length}</p>
            </div>
            <div className="glass-panel rounded-[22px] px-4 py-4">
              <p className="eyebrow">Ready for review</p>
              <p className="display-title mt-3 text-3xl">{payload.readyForReview.length}</p>
            </div>
            <div className="glass-panel rounded-[22px] px-4 py-4">
              <p className="eyebrow">Completed work</p>
              <p className="display-title mt-3 text-3xl">{payload.completed.length}</p>
            </div>
            <div className="glass-panel rounded-[22px] px-4 py-4">
              <p className="eyebrow">Overdue</p>
              <p className="display-title mt-3 text-3xl">{payload.overdue.length}</p>
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
          <div className="glass-panel rounded-[24px] p-3">
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
                {filteredProjects.length} visible
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProjects.length ? (
              filteredProjects.map((project: Project) => (
                <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
              ))
            ) : (
              <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                No projects are available in this section yet.
              </div>
            )}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ArchitectMyProjects() {
  return (
    <ProtectedArea roles={["architect"]}>
      {({ token, user }) => <ArchitectMyProjectsContent token={token} user={user} />}
    </ProtectedArea>
  );
}
