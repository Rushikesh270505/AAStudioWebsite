"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type ServiceKind =
  | "planning"
  | "elevation"
  | "interior"
  | "landscape"
  | "decorative"
  | "modeling"
  | "walkthrough"
  | "media";

type ServiceItem = {
  kind: ServiceKind;
  index: string;
  title: string;
  description: string;
  note: string;
};

const services: ServiceItem[] = [
  {
    kind: "planning",
    index: "01",
    title: "Architectural Planning",
    description:
      "Development of architectural planning layouts including conceptual design, spatial organization, and functional planning for buildings.",
    note: "Blueprint-led concept organization",
  },
  {
    kind: "elevation",
    index: "02",
    title: "Exterior Elevation Design",
    description:
      "Design of building facades and exterior elevations defining architectural identity and visual character.",
    note: "Facade identity and proportion control",
  },
  {
    kind: "interior",
    index: "03",
    title: "Interior Design",
    description:
      "Design of interior environments including furniture layout, materials, lighting, and aesthetics.",
    note: "Material, furniture, and light harmony",
  },
  {
    kind: "landscape",
    index: "04",
    title: "Landscape Design",
    description:
      "Design of outdoor environments such as gardens, pathways, and site greenery.",
    note: "Quiet exterior spatial atmosphere",
  },
  {
    kind: "decorative",
    index: "05",
    title: "Architectural Art & Decorative Design",
    description:
      "Custom sculptural elements, wall art, floor patterns, and ceiling design features.",
    note: "Signature crafted details",
  },
  {
    kind: "modeling",
    index: "06",
    title: "3D Architectural Modeling",
    description:
      "Creation of detailed 3D models for architectural visualization and presentations.",
    note: "Precise digital form building",
  },
  {
    kind: "walkthrough",
    index: "07",
    title: "Walkthrough & Architectural Visualization",
    description:
      "Cinematic architectural walkthrough videos and immersive visual experiences.",
    note: "Client-ready immersive review",
  },
  {
    kind: "media",
    index: "08",
    title: "Architectural Media Editing",
    description:
      "Professional editing and enhancement of architectural renders, images, and walkthrough videos.",
    note: "Presentation polish and narrative finishing",
  },
];

const fadeTransition = {
  duration: 3.2,
  ease: "easeInOut" as const,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror" as const,
};

function ServiceVisual({ kind }: { kind: ServiceKind }) {
  const stroke = "#2C2C2C";
  const accent = "#C7B8A3";
  const softStroke = "rgba(44,44,44,0.38)";
  const overlay = "rgba(44,44,44,0.1)";

  switch (kind) {
    case "planning":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.path
            d="M38 40H136V114H38Z"
            stroke={stroke}
            strokeWidth="2"
            strokeDasharray="1 0"
            initial={{ pathLength: 0.2, opacity: 0.35 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
          />
          <motion.path
            d="M58 58H116M58 76H98M116 58V96M78 58V114"
            stroke={softStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0.75 }}
            transition={fadeTransition}
          />
          <motion.path
            d="M38 128H154M154 128L144 122M154 128L144 134"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.path
            d="M26 40V126M26 40L32 50M26 40L20 50"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, delay: 0.25, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.g
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          >
            <circle cx="164" cy="58" r="20" stroke={overlay} />
            <path d="M164 42V74M148 58H180" stroke={overlay} strokeWidth="1.2" />
          </motion.g>
        </svg>
      );
    case "elevation":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.path
            d="M48 124V64L86 44L122 64V124M152 124V52L188 32L188 124"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0.1, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
          />
          {[64, 82, 100].map((x, index) => (
            <motion.rect
              key={x}
              x={x}
              y="76"
              width="12"
              height="18"
              rx="2"
              stroke={accent}
              strokeWidth="1.4"
              initial={{ opacity: 0.15, y: 84 }}
              animate={{ opacity: 0.85, y: 76 }}
              transition={{ duration: 1.4, delay: index * 0.18, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
            />
          ))}
          <motion.path
            d="M48 124H198"
            stroke={softStroke}
            strokeWidth="1.4"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={fadeTransition}
          />
        </svg>
      );
    case "interior":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.path
            d="M120 44V86"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d="M92 88C98 70 142 70 148 88"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            cx="120"
            cy="98"
            r="34"
            fill={accent}
            initial={{ opacity: 0.12, scale: 0.92 }}
            animate={{ opacity: [0.12, 0.3, 0.12], scale: [0.92, 1.03, 0.92] }}
            transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.path
            d="M56 118H92C98 118 102 122 104 128L108 142M132 142L136 128C138 122 142 118 148 118H184"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d="M86 118V142M154 118V142"
            stroke={softStroke}
            strokeWidth="1.5"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={fadeTransition}
          />
        </svg>
      );
    case "landscape":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.path
            d="M40 126C66 108 82 104 112 108C136 112 156 102 198 70"
            stroke={accent}
            strokeWidth="2.3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
          />
          {[58, 76, 98, 144, 168, 188].map((x, index) => (
            <motion.path
              key={x}
              d={`M${x} 132C${x - 6} 118 ${x - 2} 110 ${x} 98C${x + 2} 110 ${x + 6} 118 ${x} 132`}
              stroke={stroke}
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2.4, delay: index * 0.12, repeat: Number.POSITIVE_INFINITY }}
              style={{ transformOrigin: `${x}px 132px` }}
            />
          ))}
          <motion.path
            d="M32 138H208"
            stroke={softStroke}
            strokeWidth="1.4"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={fadeTransition}
          />
        </svg>
      );
    case "decorative":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.path
            d="M56 118C74 74 114 62 120 98C126 134 166 126 184 78"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
          />
          <motion.path
            d="M72 132C94 108 120 112 134 132C146 148 170 148 188 126"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.8, delay: 0.35, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
          />
          <motion.circle
            cx="120"
            cy="98"
            r="8"
            fill="rgba(199,184,163,0.22)"
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.3, 0.75, 0.3] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
          />
        </svg>
      );
    case "modeling":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.g
            animate={{ rotate: [0, 12, 0, -12, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            style={{ transformOrigin: "120px 90px" }}
          >
            <path d="M120 44L162 66V112L120 136L78 112V66L120 44Z" stroke={stroke} strokeWidth="2" />
            <path d="M120 44V90L162 112M120 90L78 112M120 90L162 66M120 90L78 66" stroke={accent} strokeWidth="1.6" />
          </motion.g>
        </svg>
      );
    case "walkthrough":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.rect
            x="54"
            y="44"
            width="132"
            height="92"
            rx="16"
            stroke={stroke}
            strokeWidth="2"
          />
          <motion.path
            d="M84 60H156M84 120H156M70 74V106M170 74V106"
            stroke={softStroke}
            strokeWidth="1.4"
            animate={{ opacity: [0.25, 0.72, 0.25] }}
            transition={fadeTransition}
          />
          <motion.path
            d="M74 56L96 56M74 56L74 76M166 56L144 56M166 56L166 76M74 124L96 124M74 124L74 104M166 124L144 124M166 124L166 104"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </svg>
      );
    case "media":
      return (
        <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
          <motion.rect
            x="62"
            y="44"
            width="84"
            height="64"
            rx="14"
            stroke={stroke}
            strokeWidth="2"
            animate={{ x: [62, 58, 62] }}
            transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.rect
            x="102"
            y="72"
            width="74"
            height="56"
            rx="12"
            stroke={accent}
            strokeWidth="1.8"
            animate={{ x: [102, 106, 102], y: [72, 68, 72] }}
            transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.path
            d="M74 56H92M74 56V74M164 84H146M164 84V102M114 126H132M114 126V108"
            stroke={softStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ opacity: [0.28, 0.76, 0.28] }}
            transition={fadeTransition}
          />
        </svg>
      );
  }
}

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-[32px] border p-6 md:p-7"
      style={{
        background: "#F8F5F1",
        borderColor: "#E6E1DA",
        boxShadow: "0 16px 42px rgba(44,44,44,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div
        className="rounded-[28px] border p-4"
        style={{
          background: "linear-gradient(135deg, #FAF8F4 0%, #F3EFEA 60%, #EEE8E1 100%)",
          borderColor: "#E6E1DA",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.26em] text-[#C7B8A3]">{service.index}</span>
          <span className="rounded-full border border-[#E6E1DA] bg-white/50 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#5C5C5C]">
            {service.note}
          </span>
        </div>
        <div className="h-40 overflow-hidden rounded-[22px] border border-[rgba(44,44,44,0.08)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.86),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.56),rgba(44,44,44,0.05))] p-3">
          <ServiceVisual kind={service.kind} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="display-title text-[2rem] leading-[1.02] text-[#2C2C2C] md:text-[2.35rem]">
          {service.title}
        </h3>
        <p className="mt-4 text-sm leading-8 text-[#5C5C5C] md:text-[15px]">{service.description}</p>
      </div>
    </motion.article>
  );
}

export function ServicesExperience() {
  return (
    <>
      <section className="section-pad pt-8">
        <div className="container-shell">
          <div
            className="grid gap-6 rounded-[42px] border p-6 md:p-8 xl:grid-cols-[0.58fr_0.42fr]"
            style={{
              background: "linear-gradient(135deg, #FAF8F4 0%, #F3EFEA 60%, #EEE8E1 100%)",
              borderColor: "#E6E1DA",
              boxShadow: "0 28px 80px rgba(44,44,44,0.08)",
            }}
          >
            <div className="rounded-[34px] border border-[rgba(44,44,44,0.08)] bg-[linear-gradient(180deg,rgba(248,245,241,0.92),rgba(248,245,241,0.78))] p-7 md:p-9">
              <span className="eyebrow">Studio services</span>
              <h1 className="display-title mt-6 max-w-4xl text-5xl leading-[0.94] text-[#2C2C2C] md:text-7xl">
                Premium design services shaped with calm, architectural precision.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5C5C5C] md:text-lg">
                Every service is framed with the same luxury visual language as the studio itself: quiet material tones,
                precise graphics, and a presentation system built for high-end architectural practice.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2C2C2C] bg-[#2C2C2C] px-6 py-3 text-sm font-medium text-white shadow-[0_16px_34px_rgba(44,44,44,0.16)] transition-all hover:-translate-y-0.5 hover:border-[#3A3A3A] hover:bg-[#3A3A3A] hover:shadow-[0_20px_38px_rgba(44,44,44,0.22)] active:translate-y-[1px]"
                >
                  Request consultation
                  <ArrowRight size={16} />
                </Link>
                <div className="rounded-full border border-[#E6E1DA] bg-[rgba(248,245,241,0.76)] px-5 py-3 text-sm text-[#5C5C5C]">
                  70% neutral light tones, 20% charcoal text, 10% warm accent balance
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                "Soft beige and ivory layering to echo presentation paper and material boards.",
                "Warm white surfaces with light stone borders to keep cards minimal and polished.",
                "Calm SVG architectural motion using subtle charcoal overlays rather than bright visual noise.",
              ].map((point) => (
                <div
                  key={point}
                  className="rounded-[28px] border p-5"
                  style={{
                    background: "#F8F5F1",
                    borderColor: "#E6E1DA",
                    boxShadow: "0 14px 36px rgba(44,44,44,0.05)",
                  }}
                >
                  <p className="text-sm leading-8 text-[#5C5C5C]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell">
          <div className="max-w-3xl">
            <span className="eyebrow">Service catalogue</span>
            <h2 className="display-title mt-5 text-4xl leading-tight text-[#2C2C2C] md:text-6xl">
              A refined service matrix for architecture, interiors, landscapes, and visual delivery.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#5C5C5C] md:text-lg">
              Each card includes a subtle animated architectural graphic, soft elevation on hover, and the same restrained material tone used throughout the studio platform.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.kind} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container-shell">
          <div
            className="rounded-[38px] border p-7 md:p-9"
            style={{
              background: "linear-gradient(180deg, rgba(248,245,241,0.96), rgba(243,239,234,0.88))",
              borderColor: "#E6E1DA",
              boxShadow: "0 24px 56px rgba(44,44,44,0.06)",
            }}
          >
            <div className="grid gap-6 md:grid-cols-[0.62fr_0.38fr] md:items-end">
              <div>
                <span className="eyebrow">Delivery vision</span>
                <h2 className="display-title mt-5 text-4xl leading-[0.98] text-[#2C2C2C] md:text-5xl">
                  The services page should feel like a premium architecture studio, not a generic portfolio grid.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#5C5C5C]">
                  Spacious layouts, elegant typography, calm motion, and layered neutral surfaces create the luxury architectural mood while still keeping the page technically fast and responsive.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Soft beige paper feel",
                  "Warm white card surfaces",
                  "Charcoal-led typography",
                  "Measured, quiet animation",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border px-4 py-3 text-sm text-[#2C2C2C]"
                    style={{ background: "#F8F5F1", borderColor: "#E6E1DA" }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
