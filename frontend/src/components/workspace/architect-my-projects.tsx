"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { cn } from "@/lib/utils";
import type { ArchitectDashboardPayload, Project, UserProfile } from "@/lib/platform-types";

type ProjectTab = "all" | "active" | "review" | "completed" | "overdue";

function ArchitectMyProjectsContent({ token, user }: { token: string; user: UserProfile }) {
  const [payload, setPayload] = useState<ArchitectDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");

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

    const allProjects = payload.myProjects;

    switch (activeTab) {
      case "active":
        return allProjects.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status));
      case "review":
        return allProjects.filter((project) => project.status === "READY_FOR_REVIEW");
      case "completed":
        return allProjects.filter((project) => project.status === "COMPLETED");
      case "overdue":
        return allProjects.filter(
          (project) => project.deadline && new Date(project.deadline) < new Date() && project.status !== "COMPLETED",
        );
      default:
        return allProjects;
    }
  }, [activeTab, payload]);

  const tabs: Array<{ id: ProjectTab; label: string; count: number }> = [
    { id: "all", label: "All", count: payload?.myProjects.length || 0 },
    {
      id: "active",
      label: "Active",
      count: payload?.myProjects.filter((project) => ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(project.status)).length || 0,
    },
    { id: "review", label: "Review", count: payload?.readyForReview.length || 0 },
    { id: "completed", label: "Completed", count: payload?.completed.length || 0 },
    { id: "overdue", label: "Overdue", count: payload?.overdue.length || 0 },
  ];

  return (
    <WorkspaceShell
      user={user}
      title="My projects"
      description="Everything you have already claimed or been assigned sits here, organized by current delivery stage."
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
            <MetricCard label="My projects" value={payload.myProjects.length} />
            <MetricCard label="Ready for review" value={payload.readyForReview.length} />
            <MetricCard label="Completed work" value={payload.completed.length} />
            <MetricCard label="Overdue" value={payload.overdue.length} />
          </div>

          <div className="glass-panel rounded-[24px] p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "glass-tab inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition",
                    activeTab === tab.id
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
