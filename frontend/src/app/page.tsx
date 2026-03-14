import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Layers3, Move3D, Play } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { principles, services, studioProjects, studioStats } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <section className="section-pad pt-8">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="relative overflow-hidden rounded-[40px] bg-[#111111] px-7 py-10 text-white md:px-10 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,169,126,0.22),transparent_40%),linear-gradient(180deg,rgba(17,17,17,0.45),rgba(17,17,17,0.9))]" />
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              autoPlay
              muted
              loop
              playsInline
              poster={studioProjects[0].heroImage}
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-modern-house-11119-large.mp4" type="video/mp4" />
            </video>

            <div className="relative z-10">
              <span className="eyebrow text-[#e6d6b9] before:bg-[#c8a97e]">Architecture platform</span>
              <h1 className="display-title mt-6 max-w-4xl text-5xl leading-[0.95] text-balance md:text-7xl">
                Premium architecture storytelling with a SaaS operating layer.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
                Showcase portfolio work, host interactive 3D models, let clients walk through spaces, and manage files, timelines, invoices, and communication from one platform.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/projects" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8a97e] px-6 py-3 text-sm font-medium text-[#111111]">
                  Explore projects
                  <ArrowRight size={16} />
                </Link>
                <Link href="/walkthrough" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white">
                  Open walkthrough
                  <Play size={16} />
                </Link>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  { icon: Move3D, title: "3D Viewer", text: "WebGL model inspection with orbit, zoom, HDRI, and shadow control." },
                  { icon: Layers3, title: "Client Dashboard", text: "Files, milestones, invoices, and architect communication in one interface." },
                  { icon: Building2, title: "Admin Console", text: "Upload projects, assign clients, and manage cloud-hosted design assets." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                    <item.icon className="text-[#c8a97e]" />
                    <h2 className="display-title mt-4 text-2xl">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/72">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[36px] p-6 md:p-8">
              <p className="eyebrow">Studio philosophy</p>
              <div className="mt-5 grid gap-4">
                {principles.map((item) => (
                  <div key={item} className="rounded-[26px] border border-black/8 bg-white/60 p-4 text-sm leading-7 text-[#444444]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[36px] p-6 md:p-8">
              <p className="eyebrow">Operational metrics</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {studioStats.map((stat) => (
                  <div key={stat.label} className="rounded-[26px] border border-black/8 bg-white/70 p-4">
                    <p className="display-title text-3xl">{stat.value}</p>
                    <p className="mt-2 text-sm text-[#5d5d5d]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured projects"
            title="A portfolio system designed for image-led architectural narratives"
            description="Each project page combines plans, elevations, render galleries, walkthrough media, and interactive 3D experiences."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {studioProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.46fr_0.54fr]">
          <div>
            <SectionHeading
              eyebrow="Services"
              title="Architecture, interiors, visualization, and project delivery"
              description="The platform is built around the way premium studios actually work, from initial concept through coordination and client handover."
            />
          </div>
          <div className="grid gap-4">
            {services.map((service, index) => (
              <div key={service.title} className="glass-panel rounded-[32px] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">
                      0{index + 1}
                    </p>
                    <h3 className="display-title mt-3 text-3xl">{service.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
          <div className="glass-panel overflow-hidden rounded-[36px]">
            <div className="relative h-[420px]">
              <Image
                src={studioProjects[1].heroImage}
                alt="Walkthrough preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="eyebrow text-[#e6d6b9] before:bg-[#c8a97e]">Walkthrough preview</p>
                <h3 className="display-title mt-4 text-4xl">First-person spatial reviews in the browser</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/75">
                  Let clients explore circulation, scale, and ambiance with keyboard and mouse controls before construction begins.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel rounded-[32px] p-6">
              <p className="eyebrow">Experience stack</p>
              <ul className="mt-5 grid gap-4 text-sm leading-7 text-[#4d4d4d]">
                <li>Real-time 3D viewer with lazy-loaded models and realistic shadows.</li>
                <li>Walkthrough engine with first-person movement, collision logic, and warm cinematic lighting.</li>
                <li>Private client workspace with timelines, file libraries, invoice visibility, and message threads.</li>
              </ul>
            </div>
            <Link href="/viewer" className="glass-panel rounded-[32px] p-6 transition-transform hover:-translate-y-1">
              <p className="eyebrow">3D viewer</p>
              <h3 className="display-title mt-4 text-3xl">Inspect models and facade detail online</h3>
              <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                Orbit, zoom, and evaluate elevation depth using a mobile-friendly WebGL scene.
              </p>
            </Link>
            <Link href="/dashboard" className="glass-panel rounded-[32px] p-6 transition-transform hover:-translate-y-1">
              <p className="eyebrow">Client dashboard</p>
              <h3 className="display-title mt-4 text-3xl">Track progress and delivery without email clutter</h3>
              <p className="mt-3 text-sm leading-7 text-[#5d5d5d]">
                Centralize project files, review milestones, invoices, and architect communication.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.42fr_0.58fr]">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Start the next residential or hospitality commission"
              description="Use the inquiry form to open a new conversation, or route directly to WhatsApp for quick coordination."
            />
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
