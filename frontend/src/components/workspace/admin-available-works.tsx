"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { fetchAdminDashboard } from "@/lib/api";
import { createCategoryId, getServiceCategory, serviceCategories } from "@/lib/service-categories";
import { cn } from "@/lib/utils";
import type { AdminDashboardPayload } from "@/lib/platform-types";

type CategoryTab = {
  id: string;
  label: string;
  count: number;
};

export function AdminAvailableWorks() {
  return (
    <AdminShell
      title="Available works"
      description="Verify what is currently pushed into the architect claim queue, inspect service coverage, and confirm that unassigned work is live."
    >
      {({ token }) => <AdminAvailableWorksContent token={token} />}
    </AdminShell>
  );
}

function AdminAvailableWorksContent({ token }: { token: string }) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTime] = useState(() => Date.now());

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
          setError(loadError instanceof Error ? loadError.message : "Unable to load available works.");
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const categoryTabs = useMemo<CategoryTab[]>(() => {
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

  const selectedCategoryLabels = categoryTabs
    .filter((tab) => selectedCategories.includes(tab.id))
    .map((tab) => tab.label);
  const selectedCategorySummary = selectedCategoryLabels.length ? selectedCategoryLabels.join(", ") : "All";
  const dueSoonCount = useMemo(() => {
    if (!payload) {
      return 0;
    }

    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    return payload.availableWorks.filter((project) => {
      if (!project.deadline) {
        return false;
      }

      const deadline = new Date(project.deadline).getTime();
      return deadline >= currentTime && deadline - currentTime <= weekInMs;
    }).length;
  }, [currentTime, payload]);

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
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      {!payload ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="glass-panel h-32 animate-pulse rounded-[28px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Available works" value={payload.availableWorks.length} hint="Currently visible to architects for claiming." />
            <MetricCard label="Service categories" value={serviceCategories.length} hint="All service queues monitored here." />
            <MetricCard label="Selected categories" value={selectedCategories.length || "All"} hint={`${filteredWorks.length} visible works`} />
            <MetricCard label="Due this week" value={dueSoonCount} hint="Priority items nearing delivery dates." />
          </div>

          <div className="glass-panel rounded-[24px] p-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryToggle(tab.id)}
                  className={cn(
                    "glass-tab flex min-w-0 w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-xs uppercase tracking-[0.2em] transition",
                    (tab.id === "all" && !selectedCategories.length) || selectedCategories.includes(tab.id)
                      ? "border-[#c8a97e]/70 bg-white/90 text-[#2C2C2C] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(45,45,45,0.08)]"
                      : "text-[#5d5d5d] hover:border-[#c8a97e]/60 hover:text-[#2C2C2C]",
                  )}
                >
                  <span className="min-w-0 break-words pr-2 text-left leading-5">{tab.label}</span>
                  <span className="rounded-full border border-black/8 bg-white/70 px-2 py-1 text-[10px] tracking-[0.18em] text-[#8f6532]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Selected services</p>
                <h2 className="display-title mt-4 text-3xl">{selectedCategorySummary}</h2>
                <p className="mt-2 text-sm leading-7 text-[#5d5d5d]">
                  These are the unassigned projects that are already pushed into the live architect queue for the selected categories.
                </p>
              </div>
              <span className="rounded-full border border-black/8 bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                {filteredWorks.length} pushed live
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredWorks.length ? (
              filteredWorks.map((project) => (
                <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
              ))
            ) : (
              <div className="glass-panel rounded-[28px] p-6 text-sm text-[#5d5d5d]">
                No available works are currently pushed for the selected service categories.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
