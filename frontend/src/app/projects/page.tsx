import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { fetchProjects } from "@/lib/api";

export const metadata = {
  title: "Projects",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await fetchProjects().catch(() => []);

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
            <div className="grid gap-6 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
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
