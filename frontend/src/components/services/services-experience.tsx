"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { type MouseEvent, useEffect, useState } from "react";

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

const PHASE_COUNT = 5;
const PHASE_DURATION_MS = 3000;
const sceneFade = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function useServicePhase(total: number) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((current) => (current + 1) % total);
    }, PHASE_DURATION_MS);

    return () => window.clearInterval(id);
  }, [total]);

  return phase;
}

function renderAmbientLayer(kind: ServiceKind) {
  const accent = "#C7B8A3";
  const softStroke = "rgba(44,44,44,0.08)";

  return (
    <>
      <rect x="24" y="20" width="192" height="140" rx="28" stroke={softStroke} strokeWidth="1" />
      <path d="M36 140H204" stroke={softStroke} strokeWidth="1" />
      {kind === "planning" || kind === "modeling" ? (
        <>
          {[58, 86, 114, 142].map((y) => (
            <path key={`${kind}-ambient-row-${y}`} d={`M42 ${y}H198`} stroke={softStroke} strokeWidth="1" />
          ))}
          {[72, 104, 136, 168].map((x) => (
            <path key={`${kind}-ambient-col-${x}`} d={`M${x} 34V146`} stroke={softStroke} strokeWidth="1" />
          ))}
        </>
      ) : null}
      {kind === "walkthrough" || kind === "media" ? (
        <>
          <rect x="48" y="36" width="144" height="92" rx="18" stroke={softStroke} strokeWidth="1" />
          <path d="M72 56H168M72 108H168" stroke={softStroke} strokeWidth="1" />
        </>
      ) : null}
      <circle cx="192" cy="46" r="8" fill="rgba(199,184,163,0.12)" />
      <circle cx="54" cy="126" r="5" fill="rgba(199,184,163,0.1)" />
      <path d="M168 148H196" stroke={accent} strokeWidth="1.1" strokeDasharray="4 4" opacity="0.4" />
    </>
  );
}

function planningScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          {[48, 74, 100, 126].map((y) => (
            <motion.path
              key={`planning-grid-row-${y}`}
              d={`M42 ${y}H176`}
              stroke="rgba(44,44,44,0.18)"
              strokeWidth="1"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 1.8 }}
            />
          ))}
          {[58, 86, 114, 142, 170].map((x) => (
            <motion.path
              key={`planning-grid-col-${x}`}
              d={`M${x} 34V134`}
              stroke="rgba(44,44,44,0.12)"
              strokeWidth="1"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.9, pathLength: 1 }}
              transition={{ duration: 1.8 }}
            />
          ))}
          {[44, 174].flatMap((x) =>
            [36, 128].map((y) => (
              <motion.path
                key={`planning-corner-${x}-${y}`}
                d={`M${x} ${y}h10M${x} ${y}v10`}
                stroke="#C7B8A3"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 1.4 }}
              />
            )),
          )}
        </>
      );
    case 1:
      return (
        <>
          <motion.path
            d="M54 52H160M54 118H160M44 60V110M170 60V110"
            stroke="#2C2C2C"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 1.2 }}
          />
          {[
            { d: "M54 52L62 48M54 52L62 56", x: 92, y: 46, label: "1200" },
            { d: "M160 52L152 48M160 52L152 56", x: 116, y: 46, label: "1800" },
          ].map((item, index) => (
            <motion.g
              key={item.label}
              initial={{ opacity: 0, x: index === 0 ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.3, delay: index * 0.18 }}
            >
              <path d={item.d} stroke="#C7B8A3" strokeWidth="1.4" strokeLinecap="round" />
              <text x={item.x} y={item.y} fill="rgba(44,44,44,0.55)" fontSize="9" letterSpacing="0.16em">
                {item.label}
              </text>
            </motion.g>
          ))}
          {[70, 94, 118, 142].map((x, index) => (
            <motion.path
              key={`planning-tick-${x}`}
              d={`M${x} 54V62`}
              stroke="#C7B8A3"
              strokeWidth="1.4"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            />
          ))}
        </>
      );
    case 2:
      return (
        <>
          <motion.path
            d="M54 48H148V118H54Z"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8 }}
          />
          <motion.path
            d="M88 48V118M118 48V84M54 78H118"
            stroke="rgba(44,44,44,0.42)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.15 }}
          />
          <motion.path
            d="M118 84A14 14 0 0 1 132 98"
            stroke="#C7B8A3"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.45 }}
          />
        </>
      );
    case 3:
      return (
        <>
          <motion.path
            d="M120 56L108 100"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ rotate: -14, opacity: 0.4 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ originX: "120px", originY: "56px" }}
          />
          <motion.path
            d="M120 56L136 100"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ rotate: 12, opacity: 0.4 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ originX: "120px", originY: "56px" }}
          />
          <motion.circle
            cx="120"
            cy="56"
            r="5"
            fill="#C7B8A3"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.8 }}
          />
          <motion.circle
            cx="120"
            cy="100"
            r="26"
            stroke="#C7B8A3"
            strokeWidth="1.6"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 1.8, delay: 0.3 }}
          />
        </>
      );
    default:
      return (
        <>
          {[
            { x: 58, y: 56, w: 38, h: 24 },
            { x: 100, y: 56, w: 44, h: 32 },
            { x: 58, y: 86, w: 34, h: 26 },
            { x: 98, y: 94, w: 50, h: 20 },
          ].map((room, index) => (
            <motion.rect
              key={`planning-room-${index}`}
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              rx="4"
              fill="rgba(199,184,163,0.16)"
              stroke="#2C2C2C"
              strokeWidth="1.2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.16 }}
            />
          ))}
          <motion.path
            d="M50 122H156"
            stroke="#C7B8A3"
            strokeWidth="1.4"
            strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.5 }}
          />
        </>
      );
  }
}

function elevationScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          <motion.path
            d="M58 124V72L94 50L130 72V124M150 124V62L182 40V124"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8 }}
          />
        </>
      );
    case 1:
      return (
        <>
          {[68, 86, 104].map((x, index) => (
            <motion.rect
              key={`elevation-window-left-${x}`}
              x={x}
              y="78"
              width="10"
              height="16"
              rx="2"
              stroke="#C7B8A3"
              strokeWidth="1.4"
              initial={{ opacity: 0, y: 88 }}
              animate={{ opacity: 1, y: 78 }}
              transition={{ duration: 0.7, delay: index * 0.16 }}
            />
          ))}
          {[158, 172].map((x, index) => (
            <motion.rect
              key={`elevation-window-right-${x}`}
              x={x}
              y="66"
              width="12"
              height="18"
              rx="2"
              stroke="#C7B8A3"
              strokeWidth="1.4"
              initial={{ opacity: 0, y: 76 }}
              animate={{ opacity: 1, y: 66 }}
              transition={{ duration: 0.7, delay: 0.4 + index * 0.16 }}
            />
          ))}
        </>
      );
    case 2:
      return (
        <>
          {[62, 76, 90, 104, 118, 158, 170, 182].map((x, index) => (
            <motion.path
              key={`elevation-rhythm-${x}`}
              d={`M${x} 52V124`}
              stroke="rgba(44,44,44,0.34)"
              strokeWidth="1.4"
              strokeLinecap="round"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
            />
          ))}
        </>
      );
    case 3:
      return (
        <>
          <path d="M56 124H188" stroke="rgba(44,44,44,0.14)" strokeWidth="1.2" />
          <motion.rect
            x="34"
            y="42"
            width="48"
            height="96"
            fill="rgba(44,44,44,0.12)"
            initial={{ x: 34, opacity: 0 }}
            animate={{ x: 182, opacity: [0, 0.25, 0] }}
            transition={{ duration: 2.1 }}
          />
        </>
      );
    default:
      return (
        <>
          <motion.path
            d="M54 88L92 58L130 72L154 52L182 42"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8 }}
          />
          {[92, 154, 182].map((x, index) => (
            <motion.circle
              key={`elevation-node-${x}`}
              cx={x}
              cy={index === 0 ? 58 : index === 1 ? 52 : 42}
              r="3.5"
              fill="#C7B8A3"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.18 }}
            />
          ))}
        </>
      );
  }
}

function interiorScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          <motion.path
            d="M58 44H176V128H58"
            stroke="#2C2C2C"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6 }}
          />
          <motion.path
            d="M58 44L100 70M176 44L134 70"
            stroke="rgba(44,44,44,0.26)"
            strokeWidth="1.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </>
      );
    case 1:
      return (
        <>
          <motion.rect
            x="96"
            y="90"
            width="44"
            height="18"
            rx="7"
            stroke="#2C2C2C"
            strokeWidth="1.6"
            initial={{ opacity: 0, y: 104 }}
            animate={{ opacity: 1, y: 90 }}
            transition={{ duration: 0.8 }}
          />
          {[76, 150].map((x, index) => (
            <motion.path
              key={`interior-chair-${x}`}
              d={`M${x} 104L${x + 12} 104M${x + 2} 104V120M${x + 10} 104V120M${x + 2} 88H${x + 10}V104`}
              stroke="#C7B8A3"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ opacity: 0, x: index === 0 ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.18 }}
            />
          ))}
        </>
      );
    case 2:
      return (
        <>
          <motion.path
            d="M120 42V78"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d="M94 78C98 62 142 62 146 78"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            cx="120"
            cy="90"
            r="28"
            fill="rgba(199,184,163,0.2)"
            initial={{ opacity: 0.1, scale: 0.88 }}
            animate={{ opacity: [0.1, 0.35, 0.1], scale: [0.88, 1.05, 0.88] }}
            transition={{ duration: 2.2 }}
          />
        </>
      );
    case 3:
      return (
        <>
          <motion.path
            d="M76 72H164M76 72V118M164 72V118"
            stroke="#2C2C2C"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.8 }}
          />
          {[90, 108, 126, 144].map((x, index) => (
            <motion.rect
              key={`interior-book-${x}`}
              x={x}
              y="58"
              width="10"
              height="14"
              rx="1.5"
              fill={index % 2 === 0 ? "rgba(199,184,163,0.28)" : "rgba(44,44,44,0.12)"}
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 58 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            />
          ))}
        </>
      );
    default:
      return (
        <>
          {[70, 98, 126, 154].map((x, index) => (
            <motion.path
              key={`interior-perspective-${x}`}
              d={`M120 86L${x} 126`}
              stroke="rgba(44,44,44,0.16)"
              strokeWidth="1.2"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: index % 2 === 0 ? -2 : 2 }}
              transition={{ duration: 1.4, delay: index * 0.1 }}
            />
          ))}
          <motion.path
            d="M64 126H176"
            stroke="#C7B8A3"
            strokeWidth="1.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3 }}
          />
        </>
      );
  }
}

function landscapeScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          {[58, 74, 90, 106, 150, 166, 182].map((x, index) => (
            <motion.path
              key={`land-grass-${x}`}
              d={`M${x} 128C${x - 4} 116 ${x - 2} 104 ${x} 92C${x + 2} 104 ${x + 4} 116 ${x} 128`}
              stroke="#2C2C2C"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: index * 0.08 }}
            />
          ))}
        </>
      );
    case 1:
      return (
        <>
          <motion.path
            d="M44 126C70 102 100 100 128 108C150 114 170 104 196 74"
            stroke="#C7B8A3"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8 }}
          />
        </>
      );
    case 2:
      return (
        <>
          {[72, 120, 170].map((x, index) => (
            <motion.g
              key={`land-tree-${x}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.16 }}
            >
              <path d={`M${x} 108V126`} stroke="#2C2C2C" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx={x} cy="98" r="10" stroke="#2C2C2C" strokeWidth="1.4" fill="rgba(199,184,163,0.12)" />
            </motion.g>
          ))}
        </>
      );
    case 3:
      return (
        <>
          {[58, 76, 94, 146, 164, 182].map((x, index) => (
            <motion.path
              key={`land-sway-${x}`}
              d={`M${x} 128C${x - 4} 116 ${x - 2} 104 ${x} 92`}
              stroke="#2C2C2C"
              strokeWidth="1.6"
              strokeLinecap="round"
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 2, delay: index * 0.08, repeat: Number.POSITIVE_INFINITY }}
              style={{ transformOrigin: `${x}px 128px` }}
            />
          ))}
        </>
      );
    default:
      return (
        <>
          {[58, 76, 94, 112].map((y, index) => (
            <motion.path
              key={`land-contour-${y}`}
              d={`M42 ${y}C82 ${y - 14} 136 ${y - 8} 194 ${y - 18}`}
              stroke="rgba(44,44,44,0.26)"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: index * 0.12 }}
            />
          ))}
        </>
      );
  }
}

function decorativeScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <motion.path
          d="M58 114C78 74 112 66 122 92C132 118 162 122 186 82"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.9 }}
        />
      );
    case 1:
      return (
        <>
          {[76, 104, 132, 160].map((x, xi) =>
            [70, 98, 126].map((y, yi) => (
              <motion.rect
                key={`deco-grid-${x}-${y}`}
                x={x}
                y={y}
                width="14"
                height="14"
                rx="3"
                stroke={xi % 2 === yi % 2 ? "#2C2C2C" : "#C7B8A3"}
                strokeWidth="1.2"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: (xi + yi) * 0.08 }}
              />
            )),
          )}
        </>
      );
    case 2:
      return (
        <>
          {[
            "M78 118L98 106L118 118L98 130Z",
            "M118 118L138 106L158 118L138 130Z",
            "M98 94L118 82L138 94L118 106Z",
          ].map((d, index) => (
            <motion.path
              key={`deco-tile-${index}`}
              d={d}
              fill="rgba(199,184,163,0.16)"
              stroke="#2C2C2C"
              strokeWidth="1.2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.14 }}
            />
          ))}
        </>
      );
    case 3:
      return (
        <>
          {[18, 30, 42].map((r, index) => (
            <motion.circle
              key={`deco-ring-${r}`}
              cx="120"
              cy="94"
              r={r}
              stroke={index === 1 ? "#C7B8A3" : "rgba(44,44,44,0.35)"}
              strokeWidth="1.3"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: index * 0.15 }}
            />
          ))}
        </>
      );
    default:
      return (
        <>
          {[
            "M68 116C84 96 96 96 112 116",
            "M108 104C124 84 140 84 158 106",
            "M144 120C156 108 170 108 180 122",
          ].map((d, index) => (
            <motion.path
              key={`deco-stroke-${index}`}
              d={d}
              stroke={index === 1 ? "#2C2C2C" : "#C7B8A3"}
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: index * 0.2 }}
            />
          ))}
        </>
      );
  }
}

function modelingScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <motion.g
          initial={{ rotate: -10, opacity: 0.5 }}
          animate={{ rotate: 8, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          style={{ transformOrigin: "120px 90px" }}
        >
          <path d="M120 46L158 68V112L120 134L82 112V68L120 46Z" stroke="#2C2C2C" strokeWidth="1.8" />
          <path d="M120 46V90L158 112M120 90L82 112M120 90L158 68M120 90L82 68" stroke="#C7B8A3" strokeWidth="1.4" />
        </motion.g>
      );
    case 1:
      return (
        <>
          {[
            [90, 70],
            [120, 46],
            [150, 70],
            [90, 112],
            [120, 134],
            [150, 112],
          ].map(([cx, cy], index) => (
            <motion.circle
              key={`model-node-${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="4"
              fill="#C7B8A3"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          ))}
          {[
            "M90 70L120 46L150 70L150 112L120 134L90 112Z",
            "M90 70L90 112M120 46V134M150 70V112",
          ].map((d, index) => (
            <motion.path
              key={`model-link-${index}`}
              d={d}
              stroke="rgba(44,44,44,0.36)"
              strokeWidth="1.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, delay: 0.3 + index * 0.12 }}
            />
          ))}
        </>
      );
    case 2:
      return (
        <>
          {[
            "M120 46L150 70L120 90L90 70Z",
            "M90 70L120 90V134L90 112Z",
            "M120 90L150 70V112L120 134Z",
          ].map((d, index) => (
            <motion.path
              key={`model-face-${index}`}
              d={d}
              fill={index === 0 ? "rgba(199,184,163,0.18)" : "rgba(44,44,44,0.08)"}
              stroke="#2C2C2C"
              strokeWidth="1.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.18 }}
            />
          ))}
        </>
      );
    case 3:
      return (
        <motion.g
          initial={{ rotate: -4 }}
          animate={{ rotate: 4 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          style={{ transformOrigin: "120px 90px" }}
        >
          {[50, 72, 94, 116, 138].map((y) => (
            <path key={`model-grid-row-${y}`} d={`M54 ${y}H186`} stroke="rgba(44,44,44,0.16)" strokeWidth="1" />
          ))}
          {[70, 98, 126, 154, 182].map((x) => (
            <path key={`model-grid-col-${x}`} d={`M${x} 46V138`} stroke="rgba(44,44,44,0.1)" strokeWidth="1" />
          ))}
        </motion.g>
      );
    default:
      return (
        <>
          <motion.path
            d="M88 112L88 84L116 70L144 84V112L116 126Z"
            stroke="#2C2C2C"
            strokeWidth="1.6"
            fill="rgba(199,184,163,0.12)"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
          />
          <motion.path
            d="M88 84L88 58L116 44L144 58V84"
            stroke="#C7B8A3"
            strokeWidth="1.6"
            fill="none"
            initial={{ y: 26, opacity: 0.25 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.25 }}
          />
          <motion.path
            d="M116 44V70"
            stroke="#2C2C2C"
            strokeWidth="1.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          />
        </>
      );
  }
}

function walkthroughScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          <motion.path
            d="M74 56H96M74 56V78M166 56H144M166 56V78M74 124H96M74 124V102M166 124H144M166 124V102"
            stroke="#2C2C2C"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6 }}
          />
        </>
      );
    case 1:
      return (
        <>
          <motion.path
            d="M70 118C86 104 108 98 124 86C138 76 154 64 172 58"
            stroke="#C7B8A3"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8 }}
          />
          <motion.circle
            cx="172"
            cy="58"
            r="4"
            fill="#C7B8A3"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />
        </>
      );
    case 2:
      return (
        <>
          {[0, 1, 2].map((layer) => (
            <motion.rect
              key={`walk-layer-${layer}`}
              x={70 + layer * 12}
              y={62 + layer * 8}
              width={90 - layer * 8}
              height={52 - layer * 4}
              rx="10"
              stroke={layer === 1 ? "#C7B8A3" : "rgba(44,44,44,0.32)"}
              strokeWidth="1.3"
              initial={{ x: 64 + layer * 12, opacity: 0 }}
              animate={{ x: 70 + layer * 12, opacity: 1 }}
              transition={{ duration: 0.8, delay: layer * 0.18 }}
            />
          ))}
        </>
      );
    case 3:
      return (
        <>
          <motion.path
            d="M108 70L108 110L142 90Z"
            fill="rgba(199,184,163,0.22)"
            stroke="#2C2C2C"
            strokeWidth="1.4"
            initial={{ scale: 0.84, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
          />
          <motion.rect
            x="98"
            y="62"
            width="52"
            height="56"
            rx="8"
            stroke="#C7B8A3"
            strokeWidth="1.3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
          />
        </>
      );
    default:
      return (
        <>
          {[0, 1, 2].map((index) => (
            <motion.rect
              key={`walk-pan-${index}`}
              x={56 + index * 42}
              y="64"
              width="34"
              height="52"
              rx="8"
              fill={index === 1 ? "rgba(199,184,163,0.14)" : "rgba(44,44,44,0.06)"}
              stroke={index === 1 ? "#C7B8A3" : "rgba(44,44,44,0.18)"}
              strokeWidth="1.1"
              initial={{ x: 42 + index * 42, opacity: 0.3 }}
              animate={{ x: 56 + index * 42, opacity: 1 }}
              transition={{ duration: 1.6, delay: index * 0.12 }}
            />
          ))}
        </>
      );
  }
}

function mediaScene(phase: number) {
  switch (phase) {
    case 0:
      return (
        <>
          <motion.rect
            x="68"
            y="54"
            width="88"
            height="60"
            rx="14"
            stroke="#2C2C2C"
            strokeWidth="1.6"
            fill="rgba(199,184,163,0.08)"
            initial={{ x: 52, opacity: 0 }}
            animate={{ x: 68, opacity: 1 }}
            transition={{ duration: 1.1 }}
          />
        </>
      );
    case 1:
      return (
        <>
          {[
            "M80 66H96M80 66V82",
            "M144 66H128M144 66V82",
            "M80 102H96M80 102V86",
            "M144 102H128M144 102V86",
          ].map((d, index) => (
            <motion.path
              key={`media-crop-${index}`}
              d={d}
              stroke="#C7B8A3"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: index * 0.12 }}
            />
          ))}
        </>
      );
    case 2:
      return (
        <>
          <motion.path
            d="M66 126H176"
            stroke="rgba(44,44,44,0.18)"
            strokeWidth="1.2"
          />
          {[80, 108, 136].map((x, index) => (
            <motion.rect
              key={`media-track-${x}`}
              x={x}
              y="118"
              width="18"
              height="16"
              rx="4"
              fill={index === 1 ? "rgba(199,184,163,0.34)" : "rgba(44,44,44,0.12)"}
              initial={{ opacity: 0, y: 124 }}
              animate={{ opacity: 1, y: 118 }}
              transition={{ duration: 0.6, delay: index * 0.16 }}
            />
          ))}
          <motion.circle
            cx="104"
            cy="126"
            r="5"
            fill="#2C2C2C"
            initial={{ x: -18 }}
            animate={{ x: 42 }}
            transition={{ duration: 1.8 }}
          />
        </>
      );
    case 3:
      return (
        <>
          <rect x="76" y="56" width="76" height="52" rx="12" fill="rgba(44,44,44,0.08)" />
          <rect x="114" y="56" width="38" height="52" rx="12" fill="rgba(199,184,163,0.16)" />
          <motion.path
            d="M114 52V112"
            stroke="#2C2C2C"
            strokeWidth="1.4"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2 }}
          />
        </>
      );
    default:
      return (
        <>
          <rect x="74" y="56" width="86" height="54" rx="12" fill="rgba(44,44,44,0.06)" />
          <motion.rect
            x="62"
            y="56"
            width="24"
            height="54"
            fill="rgba(255,255,255,0.38)"
            initial={{ x: 62, opacity: 0 }}
            animate={{ x: 164, opacity: [0, 0.42, 0] }}
            transition={{ duration: 1.8 }}
          />
          <motion.path
            d="M74 84H160"
            stroke="#C7B8A3"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3 }}
          />
        </>
      );
  }
}

function renderScene(kind: ServiceKind, phase: number) {
  switch (kind) {
    case "planning":
      return planningScene(phase);
    case "elevation":
      return elevationScene(phase);
    case "interior":
      return interiorScene(phase);
    case "landscape":
      return landscapeScene(phase);
    case "decorative":
      return decorativeScene(phase);
    case "modeling":
      return modelingScene(phase);
    case "walkthrough":
      return walkthroughScene(phase);
    case "media":
      return mediaScene(phase);
  }
}

function ServiceVisual({ kind }: { kind: ServiceKind }) {
  const phase = useServicePhase(PHASE_COUNT);

  return (
    <svg viewBox="0 0 240 180" className="h-full w-full" fill="none">
      {renderAmbientLayer(kind)}
      <AnimatePresence mode="wait">
        <motion.g
          key={`${kind}-${phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={sceneFade}
        >
          {renderScene(kind, phase)}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 170, damping: 16, mass: 0.45 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 170, damping: 16, mass: 0.45 });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(offsetX * 8);
    rotateX.set(offsetY * -8);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-[28px] border p-4 md:p-5"
      style={{
        background: "#F8F5F1",
        borderColor: "#E6E1DA",
        boxShadow: "0 16px 42px rgba(44,44,44,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="rounded-[24px] border p-3"
        style={{
          background: "linear-gradient(135deg, #FAF8F4 0%, #F3EFEA 60%, #EEE8E1 100%)",
          borderColor: "#E6E1DA",
          transform: "translateZ(24px)",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.26em] text-[#C7B8A3]">{service.index}</span>
          <span className="rounded-full border border-[#E6E1DA] bg-white/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#5C5C5C]">
            {service.note}
          </span>
        </div>
        <div className="h-28 overflow-hidden rounded-[20px] border border-[rgba(44,44,44,0.08)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.86),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.56),rgba(44,44,44,0.05))] p-2.5 md:h-32">
          <ServiceVisual kind={service.kind} />
        </div>
      </div>

      <div className="mt-4">
        <div style={{ transform: "translateZ(34px)" }}>
        <h3 className="display-title text-[1.55rem] leading-[1.04] text-[#2C2C2C] md:text-[1.8rem]">
          {service.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#5C5C5C]">{service.description}</p>
        </div>
      </div>
    </motion.article>
  );
}

export function ServicesExperience() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <div className="max-w-4xl">
            <span className="eyebrow">Service catalogue</span>
            <h2 className="display-title mt-5 text-4xl leading-tight text-[#2C2C2C] md:text-6xl">
              Premium design services for architecture, interiors, landscapes, and visual delivery.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.kind} service={service} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
