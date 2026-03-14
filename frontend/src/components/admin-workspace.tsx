"use client";

import { FormEvent, useState } from "react";
import { createProject } from "@/lib/api";
import { studioProjects } from "@/lib/site-data";

export function AdminWorkspace() {
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("Skyline Atelier");
  const [location, setLocation] = useState("Mumbai, India");
  const [projectType, setProjectType] = useState("Mixed-use residence");
  const [status, setStatus] = useState("Concept");
  const [summary, setSummary] = useState("A layered urban residence with gallery decks, terraces, and a private wellness floor.");
  const [message, setMessage] = useState(
    "Paste an architect or admin JWT to create a live project record in MongoDB.",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setMessage("No JWT provided. This UI is ready, but live creation requires a backend token.");
      return;
    }

    try {
      await createProject(token, {
        title,
        location,
        projectType,
        status,
        summary,
        year: "2026",
        area: "9,800 sq ft",
        duration: "14 months",
      });
      setMessage("Project created successfully in the backend.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create project.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
      <form onSubmit={handleSubmit} className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Architect admin</p>
        <h1 className="display-title mt-4 text-4xl md:text-5xl">Upload projects and manage delivery</h1>
        <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
          This panel is structured for project creation, file upload routing, status updates, and client assignment. Connect the file inputs to the upload endpoint for production storage.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Project title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]" />
          </label>
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Location
            <input value={location} onChange={(event) => setLocation(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]" />
          </label>
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Project type
            <input value={projectType} onChange={(event) => setProjectType(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]" />
          </label>
          <label className="grid gap-2 text-sm text-[#3c3c3c]">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]">
              <option>Concept</option>
              <option>In Construction</option>
              <option>Completed</option>
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm text-[#3c3c3c]">
          Summary
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]" />
        </label>

        <label className="mt-4 grid gap-2 text-sm text-[#3c3c3c]">
          Architect/Admin JWT
          <input value={token} onChange={(event) => setToken(event.target.value)} className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c8a97e]" placeholder="Paste Bearer token value" />
        </label>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Images", "Videos", "PDF plans", "GLB models"].map((item) => (
            <div key={item} className="rounded-[24px] border border-dashed border-black/15 bg-white/55 p-4 text-sm text-[#4d4d4d]">
              {item} upload slot
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[#5d5d5d]">{message}</p>
          <button type="submit" className="premium-button px-6 py-3 text-sm font-medium">
            Create project
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Assignment board</p>
          <div className="mt-4 grid gap-3">
            {studioProjects.map((project) => (
              <div key={project.slug} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="display-title text-2xl">{project.title}</p>
                    <p className="mt-1 text-sm text-[#5d5d5d]">{project.location}</p>
                  </div>
                  <span className="premium-badge px-3 py-1 text-xs uppercase tracking-[0.24em]">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Storage pipeline</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#4b4b4b]">
            <li>Images, videos, PDFs, and GLB files route through the upload API.</li>
            <li>Provider switch supports local dev, AWS S3, or Cloudinary.</li>
            <li>Returned CDN URLs are attached to project file records in MongoDB.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
