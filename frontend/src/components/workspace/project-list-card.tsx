import Link from "next/link";
import type { Project } from "@/lib/platform-types";
import { PriorityBadge } from "@/components/workspace/priority-badge";
import { StatusBadge } from "@/components/workspace/status-badge";

export function ProjectListCard({
  project,
  href,
  action,
}: {
  project: Project;
  href?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <h3 className="display-title mt-4 text-3xl">{project.title}</h3>
          <p className="mt-2 text-sm uppercase tracking-[0.24em] text-[#8f6532]">
            {project.projectCode} • {project.serviceType}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5d5d5d]">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#5d5d5d]">
            <span>{project.location}</span>
            {project.deadline ? <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span> : null}
            {project.client?.fullName ? <span>Client: {project.client.fullName}</span> : null}
            {project.mainArchitect?.fullName ? <span>Main architect: {project.mainArchitect.fullName}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {action}
          {href ? (
            <Link href={href} className="premium-button px-4 py-2 text-sm font-medium">
              Open
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
