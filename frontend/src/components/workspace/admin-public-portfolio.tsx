"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { fetchAdminDashboard, updateProjectPortfolio } from "@/lib/api";
import type { AdminDashboardPayload, Project } from "@/lib/platform-types";
import { cn } from "@/lib/utils";

function matchesSearch(project: Project, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    project.title,
    project.projectCode,
    project.location,
    project.projectType,
    project.serviceType,
    project.summary,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function PortfolioButton({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "glass-tab rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition disabled:cursor-not-allowed disabled:opacity-55",
        active
          ? "border-[#c8a97e]/70 bg-white/92 text-[#2C2C2C] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_24px_rgba(45,45,45,0.08)]"
          : "text-[#6d665d] hover:border-[#c8a97e]/55 hover:text-[#2C2C2C]",
      )}
    >
      {children}
    </button>
  );
}

function PortfolioControls({
  project,
  busy,
  onToggleVisibility,
  onUpdateRows,
  onUpdateColumns,
}: {
  project: Project;
  busy: boolean;
  onToggleVisibility: () => void;
  onUpdateRows: (rows: number) => void;
  onUpdateColumns: (columns: number) => void;
}) {
  const rows = project.portfolio?.rows || 1;
  const columns = project.portfolio?.columns || 1;
  const isVisible = project.portfolio?.isVisible || false;

  return (
    <div className="flex flex-wrap items-start justify-end gap-3">
      <div className="flex flex-col gap-2 rounded-[22px] border border-black/8 bg-white/68 p-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6532]">Portfolio</p>
        <PortfolioButton disabled={busy} active={isVisible} onClick={onToggleVisibility}>
          {busy ? "Saving..." : isVisible ? "Visible" : "Hidden"}
        </PortfolioButton>
      </div>

      <div className="flex flex-col gap-2 rounded-[22px] border border-black/8 bg-white/68 p-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6532]">Rows</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((value) => (
            <PortfolioButton
              key={`row-${value}`}
              disabled={busy}
              active={rows === value}
              onClick={() => onUpdateRows(value)}
            >
              {value}
            </PortfolioButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[22px] border border-black/8 bg-white/68 p-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6532]">Columns</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((value) => (
            <PortfolioButton
              key={`column-${value}`}
              disabled={busy}
              active={columns === value}
              onClick={() => onUpdateColumns(value)}
            >
              {value}
            </PortfolioButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPublicPortfolioContent({ token }: { token: string }) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [search, setSearch] = useState("");
  const [busyProjectId, setBusyProjectId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const adminPayload = await fetchAdminDashboard(token);
      setPayload(adminPayload);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load public portfolio controls.");
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const projects = useMemo(() => payload?.projects || [], [payload]);
  const visibleCount = projects.filter((project) => project.portfolio?.isVisible).length;
  const hiddenCount = projects.length - visibleCount;
  const filteredProjects = useMemo(
    () => projects.filter((project) => matchesSearch(project, search)),
    [projects, search],
  );

  async function handlePortfolioUpdate(project: Project, patch: { isVisible?: boolean; rows?: number; columns?: number }) {
    setBusyProjectId(project._id);
    setMessage("");

    try {
      const response = await updateProjectPortfolio(token, project._id, patch);
      setPayload((current) => {
        if (!current) {
          return current;
        }

        const nextProject = response.project;

        return {
          ...current,
          projects: current.projects.map((item) => (item._id === nextProject._id ? nextProject : item)),
          pendingWorks: current.pendingWorks.map((item) => (item._id === nextProject._id ? nextProject : item)),
          reviewQueue: current.reviewQueue.map((item) => (item._id === nextProject._id ? nextProject : item)),
          inProgress: current.inProgress.map((item) => (item._id === nextProject._id ? nextProject : item)),
          completed: current.completed.map((item) => (item._id === nextProject._id ? nextProject : item)),
          availableWorks: current.availableWorks.map((item) => (item._id === nextProject._id ? nextProject : item)),
        };
      });
      setMessage(`${project.title} updated in the public portfolio.`);
      setError("");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update public portfolio settings.");
    } finally {
      setBusyProjectId("");
    }
  }

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}
      {message ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Portfolio projects" value={projects.length} hint="All project records available for curation." />
        <MetricCard label="Visible now" value={visibleCount} hint="Currently live on public pages." />
        <MetricCard label="Hidden" value={hiddenCount} hint="Saved internally but not shown publicly." />
        <MetricCard label="Filtered" value={filteredProjects.length} hint="Projects matching the current search." />
      </div>

      <section className="glass-panel rounded-[30px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Public portfolio</p>
            <h2 className="display-title mt-4 text-3xl">Control what appears on the public website</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5d5d]">
              Toggle public visibility per project and set the preferred row and column span for the public projects grid.
            </p>
          </div>
          <label className="flex w-full max-w-[360px] items-center rounded-full border border-black/8 bg-white/72 px-4 py-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, code, location, or service"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#8a847b]"
            />
          </label>
        </div>
      </section>

      <div className="grid gap-4">
        {filteredProjects.length ? (
          filteredProjects.map((project) => (
            <ProjectListCard
              key={project._id}
              project={project}
              href={project.portfolio?.isVisible ? `/projects/${project.slug}` : undefined}
              action={
                <PortfolioControls
                  project={project}
                  busy={busyProjectId === project._id}
                  onToggleVisibility={() =>
                    handlePortfolioUpdate(project, {
                      isVisible: !project.portfolio?.isVisible,
                    })
                  }
                  onUpdateRows={(rows) => handlePortfolioUpdate(project, { rows })}
                  onUpdateColumns={(columns) => handlePortfolioUpdate(project, { columns })}
                />
              }
            />
          ))
        ) : (
          <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
            No projects match the current portfolio search.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPublicPortfolio() {
  return (
    <AdminShell
      title="Public portfolio"
      description="Curate which projects appear on the public website and shape their grid layout from the admin workspace."
    >
      {({ token }) => <AdminPublicPortfolioContent token={token} />}
    </AdminShell>
  );
}
