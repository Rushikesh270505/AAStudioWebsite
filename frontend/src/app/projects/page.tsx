import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { fetchProjects } from "@/lib/api";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Projects",
};

export const dynamic = "force-dynamic";

const columnSpanMap = {
  1: "lg:col-span-2",
  2: "lg:col-span-4",
  3: "lg:col-span-6",
} as const;

const rowSpanMap = {
  1: "lg:row-span-1",
  2: "lg:row-span-2",
  3: "lg:row-span-3",
} as const;

export default async function ProjectsPage() {
  const projects = await fetchProjects(undefined, { publicOnly: true }).catch(() => []);

  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Projects"
            title="Portfolio pages built for architecture, not generic case studies"
            description="Project pages combine narrative, drawings, renders, model viewers, and location context so each commission feels editorial and technically complete."
          />
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-shell">
          {projects.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:auto-rows-[minmax(180px,_auto)] lg:grid-cols-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  className={cn(
                    columnSpanMap[Math.min(3, Math.max(1, project.portfolio?.columns || 1)) as 1 | 2 | 3],
                    rowSpanMap[Math.min(3, Math.max(1, project.portfolio?.rows || 1)) as 1 | 2 | 3],
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[32px] p-8 text-sm leading-7 text-[#5d5d5d]">
              No live project records are available right now. Create or publish projects from the admin workspace and they will appear here automatically.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
