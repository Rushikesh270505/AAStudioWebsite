import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { studioProjects } from "@/lib/site-data";

export const metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
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
        <div className="container-shell grid gap-6 lg:grid-cols-3">
          {studioProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </>
  );
}
