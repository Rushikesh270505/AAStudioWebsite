"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { PresenceIndicator } from "@/components/workspace/presence-indicator";
import { fetchArchitectDirectory, fetchArchitectReportBundles } from "@/lib/api";
import type { ArchitectReportBundle, UserProfile } from "@/lib/platform-types";

type ArchitectDirectoryEntry = UserProfile & {
  workload: {
    total: number;
    active: number;
    review: number;
  };
};

function WorkloadContent({ token }: { token: string }) {
  const [architects, setArchitects] = useState<ArchitectDirectoryEntry[]>([]);
  const [reportBundles, setReportBundles] = useState<ArchitectReportBundle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorkload() {
      try {
        const [payload, reportPayload] = await Promise.all([fetchArchitectDirectory(token), fetchArchitectReportBundles(token)]);
        if (!cancelled) {
          setArchitects(payload);
          setReportBundles(reportPayload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load architect workload.");
        }
      }
    }

    void loadWorkload();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const totals = architects.reduce(
    (accumulator, architect) => {
      accumulator.total += architect.workload.total;
      accumulator.active += architect.workload.active;
      accumulator.review += architect.workload.review;
      return accumulator;
    },
    { total: 0, active: 0, review: 0 },
  );

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Architects tracked" value={architects.length} hint="Active architect accounts." />
        <MetricCard label="Total assigned" value={totals.total} hint="All projects on architect boards." />
        <MetricCard label="Active load" value={totals.active} hint="Currently being executed." />
        <MetricCard label="Ready for review" value={totals.review} hint="Awaiting admin action." />
      </div>

      <section className="glass-panel rounded-[30px] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Architect workload</p>
            <h2 className="display-title mt-4 text-3xl">Balanced delivery view</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#5d5d5d]">
            Track how projects are distributed before you assign new work or escalate review approvals.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {architects.length ? (
            architects.map((architect) => {
              const total = Math.max(architect.workload.total, 1);
              const activeRatio = Math.round((architect.workload.active / total) * 100);
              const reviewRatio = Math.round((architect.workload.review / total) * 100);

              return (
                <div key={architect.id} className="rounded-[26px] border border-black/8 bg-white/72 p-5 shadow-[0_14px_30px_rgba(17,17,17,0.04)]">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-[#111111]">{architect.username || architect.fullName}</p>
                        <PresenceIndicator online={architect.isOnline} />
                      </div>
                      <p className="mt-1 text-sm text-[#5d5d5d]">{architect.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">
                        {architect.companyArchitectId || "Architect ID pending"}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-[20px] border border-black/8 bg-white/85 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8f6532]">Total</p>
                        <p className="mt-2 text-2xl font-semibold text-[#111111]">{architect.workload.total}</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-white/85 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8f6532]">Active</p>
                        <p className="mt-2 text-2xl font-semibold text-[#111111]">{architect.workload.active}</p>
                      </div>
                      <div className="rounded-[20px] border border-black/8 bg-white/85 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8f6532]">Review</p>
                        <p className="mt-2 text-2xl font-semibold text-[#111111]">{architect.workload.review}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between gap-4 text-sm text-[#5d5d5d]">
                        <span>Active share</span>
                        <span>{activeRatio}%</span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-[#efe6da]">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#c8a97e,#e7d2b2)]"
                          style={{ width: `${activeRatio}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-4 text-sm text-[#5d5d5d]">
                        <span>Review share</span>
                        <span>{reviewRatio}%</span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-[#efe6da]">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#8f6532,#c8a97e)]"
                          style={{ width: `${reviewRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-black/8 bg-white/78 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8f6532]">Latest reports</p>
                      <p className="text-sm text-[#5d5d5d]">
                        Last report{" "}
                        {architect.lastReportAt ? new Date(architect.lastReportAt).toLocaleDateString() : "pending"}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {(reportBundles.find((item) => item.architect.id === architect.id)?.reports || []).slice(0, 3).map((report) => (
                        <div key={report._id} className="rounded-[18px] border border-black/8 bg-white/85 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#8f6532]">{report.reportDateKey}</p>
                            <p className="text-sm text-[#5d5d5d]">{new Date(report.createdAt).toLocaleTimeString()}</p>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-[#4f4f4f]">{report.summary}</p>
                          {report.images.length ? (
                            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                              {report.images.map((image) => (
                                <Image
                                  key={`${report._id}-${image.name}`}
                                  src={image.dataUrl}
                                  alt={image.name}
                                  width={160}
                                  height={80}
                                  unoptimized
                                  className="h-20 w-full rounded-[14px] object-cover"
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {!reportBundles.find((item) => item.architect.id === architect.id)?.reports?.length ? (
                        <p className="text-sm text-[#5d5d5d]">No reports submitted yet.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[#5d5d5d]">No architect workload data is available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function AdminWorkload() {
  return (
    <AdminShell
      title="Architect workload"
      description="See who is carrying active delivery, who is building up review volume, and where new work should be assigned next."
    >
      {({ token }) => <WorkloadContent token={token} />}
    </AdminShell>
  );
}
