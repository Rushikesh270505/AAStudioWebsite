import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMapFrame } from "@/components/project-map-frame";
import { ProjectViewer } from "@/components/viewer/project-viewer";
import { SectionHeading } from "@/components/section-heading";
import { studioProjects } from "@/lib/site-data";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return studioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = studioProjects.find((item) => item.slug === slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = studioProjects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <section className="section-pad pt-8">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[40px]">
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="eyebrow text-[#e6d6b9] before:bg-[#c8a97e]">{project.projectType}</p>
              <h1 className="display-title mt-5 text-5xl md:text-7xl">{project.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 md:text-base">
                {project.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { label: "Location", value: project.location },
              { label: "Status", value: project.status },
              { label: "Area", value: project.area },
              { label: "Duration", value: project.duration },
            ].map((item) => (
              <div key={item.label} className="glass-panel rounded-[32px] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{item.label}</p>
                <p className="display-title mt-3 text-3xl">{item.value}</p>
              </div>
            ))}
            <Link href="/contact" className="glass-panel rounded-[32px] p-6 transition-transform hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Start a similar project</p>
              <p className="display-title mt-3 text-3xl">Book a consultation</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Render gallery"
            title="Visuals, mood, and material expression"
            description="Each project page carries a gallery of renders and reference imagery to support client narrative and design intent."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {project.renderImages.map((image) => (
              <div key={image} className="relative h-80 overflow-hidden rounded-[32px]">
                <Image src={image} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Plans"
              title="Plans and organization"
              description="Upload plan sheets, zoning diagrams, and annotated room strategies to make technical review accessible to clients."
            />
            <div className="mt-8 grid gap-4">
              {project.plans.map((asset) => (
                <div key={asset.title} className="glass-panel overflow-hidden rounded-[32px]">
                  <div className="relative h-64">
                    <Image src={asset.image} alt={asset.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="p-6">
                    <h3 className="display-title text-3xl">{asset.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">{asset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Elevations"
              title="Facade logic and environmental response"
              description="Elevations can host facade studies, section perspectives, and material articulation previews."
            />
            <div className="mt-8 grid gap-4">
              {project.elevations.map((asset) => (
                <div key={asset.title} className="glass-panel overflow-hidden rounded-[32px]">
                  <div className="relative h-64">
                    <Image src={asset.image} alt={asset.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="p-6">
                    <h3 className="display-title text-3xl">{asset.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">{asset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell">
          <SectionHeading
            eyebrow="3D model"
            title="Interactive building inspection"
            description="Model viewing is embedded inside each project page so clients can inspect geometry, shadow depth, and proportions without leaving the portfolio."
          />
          <div className="mt-10">
            <ProjectViewer />
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.52fr_0.48fr]">
          <div className="overflow-hidden rounded-[36px] bg-[#111111]">
            <video controls className="h-full min-h-[420px] w-full object-cover" poster={project.gallery[0]}>
              <source src={project.walkthroughVideo} type="video/mp4" />
            </video>
          </div>
          <div className="glass-panel rounded-[36px] p-8">
            <p className="eyebrow">Project timeline</p>
            <div className="mt-6 grid gap-4">
              {project.timeline.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-black/8 bg-white/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="display-title text-2xl">{item.title}</h3>
                    <span className="premium-badge px-3 py-1 text-xs uppercase tracking-[0.24em]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#8f6532]">{item.date}</p>
                  <p className="mt-2 text-sm leading-7 text-[#565656]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Location"
            title="Interactive project map"
            description="Project locations can be surfaced on a map for geographic storytelling and regional context."
          />
          <div className="mt-10">
            <ProjectMapFrame center={project.coordinates} title={project.title} location={project.location} />
          </div>
        </div>
      </section>
    </>
  );
}
