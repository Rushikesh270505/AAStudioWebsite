"use client";

import Link from "next/link";
import { studioProjects } from "@/lib/site-data";

const demoProjects = studioProjects.slice(0, 3);

const demoMetrics = [
  { label: "Projects", value: "03", note: "active showcase" },
  { label: "Files", value: "24", note: "organized assets" },
  { label: "Invoices", value: "02", note: "tracked stages" },
  { label: "Meetings", value: "06", note: "scheduled touchpoints" },
];

const demoUpdates = [
  {
    title: "Facade material board uploaded",
    meta: "Today • 4:30 PM",
  },
  {
    title: "Client review scheduled for Saturday",
    meta: "Tomorrow • 11:00 AM",
  },
  {
    title: "Walkthrough render queued for export",
    meta: "In progress",
  },
];

export function DashboardShowcase() {
  const heroProject = demoProjects[0];

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
          <div
            className="glass-panel relative overflow-hidden rounded-[40px] border border-white/55 p-6 shadow-[0_30px_90px_rgba(17,17,17,0.08)] md:p-8"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(17,17,17,0.12), rgba(17,17,17,0.72)), url(${heroProject.heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,126,0.26),transparent_58%)]" />
            <div className="relative flex min-h-[420px] flex-col justify-between text-white">
              <div className="grid gap-4">
                <div className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] backdrop-blur-md">
                  Dashboard
                </div>
                <h1 className="display-title max-w-xl text-5xl leading-[0.92] md:text-6xl">
                  A premium client portal before login, live data after login.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-white/82">
                  This preview shows the structure clients will step into. Once they sign in, these sections switch to
                  their real projects, files, invoices, and meetings.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {demoMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[24px] border border-white/18 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.14),rgba(17,17,17,0.16))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_26px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-white/70">{metric.label}</p>
                    <p className="mt-3 text-3xl font-medium">{metric.value}</p>
                    <p className="mt-2 text-xs text-white/68">{metric.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[34px] border border-white/50 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.06)]">
              <p className="eyebrow">Active snapshot</p>
              <div className="mt-5 grid gap-3">
                {demoUpdates.map((item) => (
                  <div
                    key={item.title}
                    className="glass-panel rounded-[24px] p-4"
                  >
                    <p className="font-medium text-[#111111]">{item.title}</p>
                    <p className="mt-2 text-sm text-[#6b6b6b]">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[34px] border border-white/50 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Portal access</p>
                  <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                    Sign in to open the real workspace, or create a client account in a few steps.
                  </p>
                </div>
                <Link href="/auth" className="premium-button px-5 py-3 text-sm font-medium">
                  Login / Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.52fr_0.48fr]">
          <div className="glass-panel rounded-[34px] border border-white/50 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Project list</p>
                <h2 className="display-title mt-4 text-4xl">Organized project cards</h2>
              </div>
              <Link href="/projects" className="premium-button-soft px-4 py-2 text-sm">
                View portfolio
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {demoProjects.map((project, index) => (
                <div
                  key={project.slug}
                  className="glass-panel grid gap-4 rounded-[28px] p-4 md:grid-cols-[120px_1fr_auto]"
                >
                  <div
                    className="h-24 rounded-[22px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.heroImage})` }}
                  />
                  <div>
                    <p className="font-medium text-[#111111]">{project.title}</p>
                    <p className="mt-1 text-sm text-[#6b6b6b]">{project.location}</p>
                    <p className="mt-3 text-sm leading-6 text-[#4c4c4c]">{project.summary}</p>
                  </div>
                  <div className="glass-panel min-w-[110px] rounded-[22px] px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#8f6532]">Stage</p>
                    <p className="mt-3 text-sm font-medium text-[#111111]">
                      {index === 0 ? "Completed" : index === 1 ? "Review" : "Concept"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[34px] border border-white/50 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.06)]">
              <p className="eyebrow">Invoices</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  { label: "Advance", amount: "$4,500", status: "Paid" },
                  { label: "Final review", amount: "$8,750", status: "Pending" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="glass-panel rounded-[24px] p-4"
                  >
                    <p className="font-medium text-[#111111]">{item.label}</p>
                    <p className="mt-3 text-2xl font-medium text-[#111111]">{item.amount}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#8f6532]">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[34px] border border-white/50 p-6 shadow-[0_28px_70px_rgba(17,17,17,0.06)]">
              <p className="eyebrow">Files and meetings</p>
              <div className="mt-5 grid gap-3">
                {[
                  "Plans, elevations, renders, and walkthroughs grouped by project",
                  "Meeting schedule and site visit timeline in one place",
                  "Empty states stay clean when a client has no active work yet",
                ].map((item) => (
                  <div key={item} className="glass-panel rounded-[24px] px-4 py-4 text-sm text-[#333333]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
