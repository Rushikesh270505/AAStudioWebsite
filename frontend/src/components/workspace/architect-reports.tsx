"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createWorkReport, fetchArchitectReportStatus, fetchMyWorkReports } from "@/lib/api";
import { architectNavItems } from "@/components/workspace/architect-nav";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProtectedArea } from "@/components/workspace/protected-area";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type { UserProfile, WorkReport } from "@/lib/platform-types";

async function filesToDataUrls(files: FileList | null) {
  if (!files?.length) {
    return [];
  }

  const selectedFiles = Array.from(files).slice(0, 6);
  return Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result || "") });
          reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function ArchitectReportsContent({ token, user }: { token: string; user: UserProfile }) {
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [hasReportedForSession, setHasReportedForSession] = useState(false);
  const [lastReportAt, setLastReportAt] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        const [reportPayload, statusPayload] = await Promise.all([
          fetchMyWorkReports(token),
          fetchArchitectReportStatus(token),
        ]);
        if (!cancelled) {
          setReports(reportPayload);
          setHasReportedForSession(statusPayload.hasReportedForSession);
          setLastReportAt(statusPayload.lastReportAt);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load report data.");
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    try {
      const nextImages = await filesToDataUrls(event.target.files);
      setImages(nextImages);
    } catch (fileError) {
      setMessage(fileError instanceof Error ? fileError.message : "Unable to read the selected files.");
    }
  }

  async function handleSubmitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await createWorkReport(token, { summary, images });
      setSummary("");
      setImages([]);
      setMessage("Today\u2019s report has been submitted. You can sign out now.");
      const [reportPayload, statusPayload] = await Promise.all([
        fetchMyWorkReports(token),
        fetchArchitectReportStatus(token),
      ]);
      setReports(reportPayload);
      setHasReportedForSession(statusPayload.hasReportedForSession);
      setLastReportAt(statusPayload.lastReportAt);
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Unable to submit the report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceShell
      user={user}
      title="Architect reports"
      description="Submit what you completed today with image evidence. Admin sees these reports directly inside the workload section, and logout stays locked until a report is sent."
      navItems={[...architectNavItems]}
    >
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Reports submitted" value={reports.length} hint="All archived daily reports." />
        <MetricCard
          label="Session status"
          value={hasReportedForSession ? "Reported" : "Pending"}
          hint={hasReportedForSession ? "Logout is unlocked for this session." : "Submit a report before logout."}
        />
        <MetricCard
          label="Last report"
          value={lastReportAt ? new Date(lastReportAt).toLocaleDateString() : "Not yet"}
          hint="Most recent submission timestamp."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Daily report</p>
          <h2 className="display-title mt-4 text-3xl">Send today\u2019s work summary</h2>
          <form onSubmit={handleSubmitReport} className="mt-6 grid gap-3">
            <textarea
              required
              rows={8}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Describe what you completed today."
              className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />
            <label className="rounded-[24px] border border-dashed border-black/14 bg-white/70 px-4 py-4 text-sm text-[#5d5d5d]">
              Attach images only
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="mt-3 block w-full text-sm" />
            </label>

            {images.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((image) => (
                  <div key={image.name} className="overflow-hidden rounded-[20px] border border-black/8 bg-white/80">
                    <Image src={image.dataUrl} alt={image.name} width={240} height={112} unoptimized className="h-28 w-full object-cover" />
                    <p className="truncate px-3 py-2 text-xs text-[#5d5d5d]">{image.name}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="premium-button mt-2 px-4 py-3 text-sm font-medium disabled:opacity-60">
              {submitting ? "Reporting..." : "Report work"}
            </button>
          </form>
          {message ? <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{message}</p> : null}
        </section>

        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Report history</p>
          <div className="mt-6 grid gap-4">
            {reports.length ? (
              reports.map((report) => (
                <article key={report._id} className="rounded-[24px] border border-black/8 bg-white/72 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-[#8f6532]">{report.reportDateKey}</p>
                    <p className="text-sm text-[#5d5d5d]">{new Date(report.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#4f4f4f]">{report.summary}</p>
                  {report.images.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {report.images.map((image) => (
                        <Image
                          key={`${report._id}-${image.name}`}
                          src={image.dataUrl}
                          alt={image.name}
                          width={160}
                          height={96}
                          unoptimized
                          className="h-24 w-full rounded-[18px] object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-[#5d5d5d]">No reports have been submitted yet.</p>
            )}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}

export function ArchitectReports() {
  return (
    <ProtectedArea roles={["architect"]}>
      {({ token, user }) => <ArchitectReportsContent token={token} user={user} />}
    </ProtectedArea>
  );
}
