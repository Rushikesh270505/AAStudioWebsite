"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/workspace/admin-shell";
import { MetricCard } from "@/components/workspace/metric-card";
import { ProjectListCard } from "@/components/workspace/project-list-card";
import { createProject, fetchAdminDashboard } from "@/lib/api";
import type { AdminDashboardPayload } from "@/lib/platform-types";

const serviceTypes = [
  "Walkthrough",
  "3D Renders",
  "Interior Design",
  "Exterior Design",
  "Furniture Design",
  "Planning Commercial",
  "Planning Residential",
  "Elevation Design",
  "Walkthrough Editing",
  "Cost and Estimation",
];

const projectStatuses = ["PENDING", "IN_PROGRESS", "READY_FOR_REVIEW", "CHANGES_REQUESTED", "COMPLETED"];
const projectPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

type PublishFormState = {
  title: string;
  location: string;
  projectType: string;
  serviceType: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  year: string;
  area: string;
  duration: string;
  heroImage: string;
  modelUrl: string;
  walkthroughUrl: string;
};

const initialForm: PublishFormState = {
  title: "",
  location: "",
  projectType: "",
  serviceType: "Planning Residential",
  summary: "",
  description: "",
  status: "PENDING",
  priority: "MEDIUM",
  year: "",
  area: "",
  duration: "",
  heroImage: "",
  modelUrl: "",
  walkthroughUrl: "",
};

function PublishWorkContent({ token }: { token: string }) {
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);
  const [form, setForm] = useState<PublishFormState>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadDashboard() {
    try {
      const adminPayload = await fetchAdminDashboard(token);
      setPayload(adminPayload);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load project publishing data.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateDashboard() {
      try {
        const adminPayload = await fetchAdminDashboard(token);
        if (!cancelled) {
          setPayload(adminPayload);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load project publishing data.");
        }
      }
    }

    void hydrateDashboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await createProject(token, {
        title: form.title,
        location: form.location,
        projectType: form.projectType,
        serviceType: form.serviceType,
        category: form.serviceType,
        summary: form.summary,
        description: form.description || form.summary,
        status: form.status,
        priority: form.priority,
        year: form.year,
        area: form.area,
        duration: form.duration,
        heroImage: form.heroImage || undefined,
        modelUrl: form.modelUrl || undefined,
        walkthroughUrl: form.walkthroughUrl || undefined,
      });
      setMessage(`Published ${form.title} successfully.`);
      setForm(initialForm);
      await loadDashboard();
    } catch (publishError) {
      setMessage(publishError instanceof Error ? publishError.message : "Unable to publish the project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {error ? <div className="glass-panel rounded-[28px] p-6 text-sm text-[#8f6532]">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Published works" value={payload?.totals.totalProjects ?? 0} hint="Projects available in the platform." />
        <MetricCard label="In progress" value={payload?.totals.worksInProgress ?? 0} hint="Live projects currently active." />
        <MetricCard label="Review queue" value={payload?.totals.reviewQueue ?? 0} hint="Pending approval after delivery." />
        <MetricCard label="Completed" value={payload?.totals.completed ?? 0} hint="Finished portfolio-ready work." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
        <section className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Publish work</p>
          <h2 className="display-title mt-4 text-3xl">Create a new project record</h2>
          <form onSubmit={handlePublish} className="mt-6 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Project title"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <input
                required
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Location"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                value={form.projectType}
                onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}
                placeholder="Project type"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <select
                value={form.serviceType}
                onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              >
                {serviceTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              >
                {projectStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              >
                {projectPriorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              required
              rows={4}
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              placeholder="Short project summary"
              className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Long description"
              className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
            />

            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={form.year}
                onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                placeholder="Year"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <input
                value={form.area}
                onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
                placeholder="Area"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <input
                value={form.duration}
                onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                placeholder="Duration"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
            </div>

            <div className="grid gap-3">
              <input
                value={form.heroImage}
                onChange={(event) => setForm((current) => ({ ...current, heroImage: event.target.value }))}
                placeholder="Hero image URL"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={form.modelUrl}
                  onChange={(event) => setForm((current) => ({ ...current, modelUrl: event.target.value }))}
                  placeholder="3D model URL"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
                />
                <input
                  value={form.walkthroughUrl}
                  onChange={(event) => setForm((current) => ({ ...current, walkthroughUrl: event.target.value }))}
                  placeholder="Walkthrough URL"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="premium-button mt-2 px-4 py-3 text-sm font-medium disabled:opacity-60">
              {submitting ? "Publishing..." : "Publish work"}
            </button>
          </form>
          {message ? <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{message}</p> : null}
        </section>

        <section className="grid gap-4">
          <div className="glass-panel rounded-[30px] p-6">
            <p className="eyebrow">Latest works</p>
            <h2 className="display-title mt-4 text-3xl">Recently published</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
              Publish from here, then continue to assign architects, files, and clients as the project moves through delivery.
            </p>
          </div>

          {payload?.projects.length ? (
            payload.projects.slice(0, 5).map((project) => (
              <ProjectListCard key={project._id} project={project} href={`/projects/${project.slug}`} />
            ))
          ) : (
            <div className="glass-panel rounded-[30px] p-6 text-sm text-[#5d5d5d]">No projects have been published yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminPublishWork() {
  return (
    <AdminShell
      title="Publish work"
      description="Create new project records directly from the admin panel so the portfolio and the studio workflow stay in sync."
    >
      {({ token }) => <PublishWorkContent token={token} />}
    </AdminShell>
  );
}
