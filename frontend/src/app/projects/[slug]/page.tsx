import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMapFrame } from "@/components/project-map-frame";
import { SectionHeading } from "@/components/section-heading";
import { ProjectViewer } from "@/components/viewer/project-viewer";
import { UpdateFeed } from "@/components/workspace/update-feed";
import { fetchProjectBySlug } from "@/lib/api";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

async function loadProject(slug: string) {
  return fetchProjectBySlug(slug).catch(() => null);
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await loadProject(slug);

  if (!payload) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: payload.project.title,
    description: payload.project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const payload = await loadProject(slug);

  if (!payload) {
    notFound();
  }

  const { project, collaborators, updates } = payload;
  const gallery = Array.from(
    new Set([project.heroImage, ...(project.gallery || [])].filter((item): item is string => Boolean(item))),
  );
  const projectFiles = project.files || [];
  const imageFiles = projectFiles.filter((file) => file.kind === "image");
  const documentFiles = projectFiles.filter((file) => file.kind !== "image");
  const showcaseImages = imageFiles.length
    ? imageFiles.map((file) => file.url).filter((item): item is string => Boolean(item))
    : gallery;
  const mapCenter = project.coordinates
    ? ([project.coordinates.lat, project.coordinates.lng] as [number, number])
    : null;

  return (
    <>
      <section className="section-pad pt-8">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[40px] bg-[#111111]">
            {project.heroImage ? (
              <Image
                src={project.heroImage}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
              <p className="eyebrow text-[#e6d6b9] before:bg-[#c8a97e]">{project.projectType}</p>
              <h1 className="display-title mt-5 text-5xl md:text-7xl">{project.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 md:text-base">{project.summary}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { label: "Location", value: project.location },
              { label: "Service", value: project.serviceType },
              { label: "Status", value: project.status.replace(/_/g, " ") },
              { label: "Progress", value: `${project.progress || 0}%` },
              { label: "Area", value: project.area },
              { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString() : undefined },
            ]
              .filter((item) => item.value)
              .map((item) => (
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
        <div className="container-shell grid gap-8 lg:grid-cols-[0.58fr_0.42fr]">
          <div>
            <SectionHeading
              eyebrow="Project narrative"
              title="Scope, delivery model, and technical context"
              description="Public project pages now load from the live backend so published commissions can surface directly from the admin workflow."
            />
            <div className="glass-panel mt-8 rounded-[32px] p-6 text-sm leading-8 text-[#4d4d4d]">
              <p>{project.description || project.summary}</p>
              {project.quotation?.summary ? <p className="mt-4">Quotation summary: {project.quotation.summary}</p> : null}
              {project.tags?.length ? <p className="mt-4">Tags: {project.tags.join(" • ")}</p> : null}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Stakeholders</p>
              <div className="mt-5 grid gap-4 text-sm text-[#4d4d4d]">
                {project.client?.fullName ? <p>Client: {project.client.fullName}</p> : null}
                {project.mainArchitect?.fullName ? <p>Main architect: {project.mainArchitect.fullName}</p> : null}
                {project.createdByAdmin?.fullName ? <p>Project owner: {project.createdByAdmin.fullName}</p> : null}
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Collaborating architects</p>
              <div className="mt-5 grid gap-3">
                {collaborators.length ? (
                  collaborators.map((collaborator) => (
                    <div key={collaborator._id} className="rounded-[24px] border border-black/8 bg-white/60 p-4">
                      <p className="font-medium text-[#111111]">{collaborator.architect.fullName}</p>
                      <p className="mt-1 text-sm text-[#5d5d5d]">
                        Added by {collaborator.addedBy.fullName} on {new Date(collaborator.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-black/8 bg-white/60 p-4 text-sm text-[#5d5d5d]">
                    No collaborating architects are publicly listed yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Gallery"
            title="Renders, references, and file-backed imagery"
            description="Render galleries are composed from published image files and hero assets connected to the live project record."
          />
          <div className="mt-10">
            {showcaseImages.length ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {showcaseImages.map((image) => (
                  <div key={image} className="relative h-80 overflow-hidden rounded-[32px]">
                    <Image src={image} alt={project.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-[32px] p-8 text-sm text-[#5d5d5d]">
                This project does not have published gallery imagery yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.52fr_0.48fr]">
          <div>
            <SectionHeading
              eyebrow="Asset library"
              title="Plans, PDFs, models, and delivery files"
              description="Published files attached in the admin workspace flow through here automatically, with live links back to storage."
            />
            <div className="mt-8 grid gap-4">
              {documentFiles.length ? (
                documentFiles.map((file) => (
                  <a
                    key={file._id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-panel rounded-[30px] p-6 transition-transform hover:-translate-y-1"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{file.kind}</p>
                    <h3 className="display-title mt-3 text-3xl">{file.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">{file.description || "Open the published asset in a new tab."}</p>
                  </a>
                ))
              ) : (
                <div className="glass-panel rounded-[30px] p-6 text-sm text-[#5d5d5d]">
                  No published plans or document files are attached yet.
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Recent updates"
              title="Client-facing progress notes"
              description="The public narrative can carry recent published updates without exposing the private workspace."
            />
            <div className="mt-8">
              <UpdateFeed updates={updates} emptyLabel="No public-facing updates have been published yet." />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell">
          <SectionHeading
            eyebrow="3D model"
            title="Interactive building inspection"
            description="Each published project can expose an interactive model viewer sourced from the project record."
          />
          <div className="mt-10">
            <ProjectViewer projects={[project]} />
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.52fr_0.48fr]">
          <div className="overflow-hidden rounded-[36px] bg-[#111111]">
            {project.walkthroughUrl ? (
              <video controls className="h-full min-h-[420px] w-full object-cover" poster={gallery[0]}>
                <source src={project.walkthroughUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center p-8 text-center text-sm text-white/72">
                Walkthrough media has not been published for this project yet.
              </div>
            )}
          </div>

          <div className="glass-panel rounded-[36px] p-8">
            <p className="eyebrow">Payment milestones</p>
            <div className="mt-6 grid gap-4">
              {project.paymentMilestones?.length ? (
                project.paymentMilestones.map((item) => (
                  <div key={`${item.label}-${item.amount}`} className="rounded-[24px] border border-black/8 bg-white/60 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="display-title text-2xl">{item.label}</h3>
                      <span className="premium-badge px-3 py-1 text-xs uppercase tracking-[0.24em]">{item.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-[#5d5d5d]">
                      {item.amount.toLocaleString()} {project.quotation?.currency || "INR"}
                      {item.dueDate ? ` • Due ${new Date(item.dueDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-black/8 bg-white/60 p-5 text-sm text-[#5d5d5d]">
                  Payment milestones will appear here once they are published from the admin workspace.
                </div>
              )}
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
            {mapCenter ? (
              <ProjectMapFrame center={mapCenter} title={project.title} location={project.location} />
            ) : (
              <div className="glass-panel rounded-[32px] p-8 text-sm text-[#5d5d5d]">
                A public map location has not been published for this project yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
