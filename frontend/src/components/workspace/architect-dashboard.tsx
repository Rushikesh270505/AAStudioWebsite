"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchArchitectDashboard } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { ArchitectDashboardPayload, UserProfile } from "@/lib/platform-types";

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
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel h-28 animate-pulse rounded-[28px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="My projects"
              value={payload.overview.activeCount}
              hint="Open the projects you already own."
              onClick={() => router.push("/architect/my-projects")}
            />
            <MetricCard
              label="Available works"
              value={payload.availableWorks.length}
              hint="Browse work that can be claimed."
              onClick={() => router.push("/architect/available-works")}
            />
            <MetricCard
              label="Meetings"
              value={payload.meetings.length + payload.siteVisits.length}
              hint="Check the current schedule."
              onClick={() => router.push("/architect/meetings")}
            />
            <MetricCard
              label="Reports"
              value={payload.readyForReview.length}
              hint="Open reports and review-ready work."
              onClick={() => router.push("/architect/reports")}
            />
          </div>

          <div className="glass-panel rounded-[30px] p-6 md:p-8">
            <p className="eyebrow">Workspace focus</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-[0.48fr_0.52fr]">
              <div>
                <h2 className="display-title text-3xl">Keep this dashboard lean.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d5d5d]">
                  Use this page as a quick index. Open the exact section you need instead of working from one mixed board.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/architect/my-projects" className="glass-panel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[#c8a97e]/55">
                  <p className="eyebrow">My Projects</p>
                  <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                    View only the projects you have already claimed or been assigned.
                  </p>
                </Link>
                <Link href="/architect/available-works" className="glass-panel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[#c8a97e]/55">
                  <p className="eyebrow">Available Works</p>
                  <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                    Browse category-wise open work and claim only what fits your capacity.
                  </p>
                </Link>
                <Link href="/architect/meetings" className="glass-panel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[#c8a97e]/55">
                  <p className="eyebrow">Meetings</p>
                  <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                    Check meeting schedules, Google Meet links, and the current calendar.
                  </p>
                </Link>
                <Link href="/architect/reports" className="glass-panel rounded-[24px] p-5 transition hover:-translate-y-0.5 hover:border-[#c8a97e]/55">
                  <p className="eyebrow">Reports</p>
                  <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                    Submit your daily report with images so admin can review your progress.
                  </p>
                </Link>
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
