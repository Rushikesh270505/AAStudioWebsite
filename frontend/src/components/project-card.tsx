"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/platform-types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel overflow-hidden rounded-[32px]"
    >
      <div className="relative h-72 overflow-hidden">
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,126,0.4),transparent_52%),linear-gradient(180deg,#252525_0%,#111111_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-white/75">
              {project.projectType}
            </p>
            <h3 className="display-title text-3xl">{project.title}</h3>
            <p className="mt-2 text-sm text-white/75">{project.location}</p>
          </div>
          <span className="rounded-full border border-white/18 bg-white/14 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
            {project.status}
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-7 text-[#5d5d5d]">{project.summary}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">
            {project.area || "Scope in progress"} {project.year ? `• ${project.year}` : ""}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="premium-button px-4 py-2 text-sm font-medium"
          >
            Open project
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
