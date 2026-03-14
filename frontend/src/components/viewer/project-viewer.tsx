"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls } from "@react-three/drei";
import { studioProjects } from "@/lib/site-data";
import { ArchitectureModel } from "@/3dviewer/architecture-model";
import { GLTFAsset } from "@/3dviewer/model-stage";

function ViewerScene({ modelUrl }: { modelUrl?: string }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 9, 6]} intensity={2.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <spotLight position={[-5, 8, -2]} intensity={1.3} angle={0.4} penumbra={0.5} color="#ffdca8" />
      <Suspense fallback={<Html center className="rounded-full bg-white px-4 py-2 text-sm text-[#111111]">Loading 3D model...</Html>}>
        {modelUrl ? <GLTFAsset url={modelUrl} /> : <ArchitectureModel />}
        <Environment preset="city" />
      </Suspense>
      <ContactShadows position={[0, -0.18, 0]} blur={2.6} opacity={0.45} scale={18} />
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={14} />
    </>
  );
}

export function ProjectViewer() {
  const [activeProject, setActiveProject] = useState(studioProjects[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
      <div className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Real-time viewer</p>
        <h3 className="display-title mt-4 text-3xl md:text-4xl">Inspect massing, materials, and facade depth</h3>
        <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
          The viewer is built with React Three Fiber and ready to load studio GLB or GLTF files. The demo falls back to a parametric villa so the interaction works before model uploads are connected.
        </p>

        <div className="mt-6 grid gap-3">
          {studioProjects.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => setActiveProject(project)}
              className={`rounded-[24px] border px-4 py-4 text-left transition-all backdrop-blur-md ${
                activeProject.slug === project.slug
                  ? "border-[#c8a97e]/42 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(200,169,126,0.2))] text-[#111111] shadow-[0_14px_32px_rgba(200,169,126,0.16)]"
                  : "border-black/10 bg-white/70 text-[#222222] hover:border-[#c8a97e]/42 hover:bg-white/82"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] opacity-70">{project.projectType}</p>
              <p className="display-title mt-2 text-2xl">{project.title}</p>
              <p className="mt-2 text-sm opacity-75">{project.location}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 text-sm text-[#3d3d3d] md:grid-cols-2">
          <div className="rounded-[24px] border border-black/8 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Controls</p>
            <p className="mt-2 leading-7">Drag to rotate, scroll to zoom, and inspect elevations from every approach.</p>
          </div>
          <div className="rounded-[24px] border border-black/8 bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Model pipeline</p>
            <p className="mt-2 leading-7">Supports GLB / GLTF uploads routed from the admin panel and cloud storage.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-[32px] p-3">
        <div className="h-[520px] overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_top,#ece4d7,#e6e0d7_35%,#dad3ca_100%)]">
          <Canvas shadows camera={{ position: [7.2, 4.8, 7.6], fov: 36 }}>
            <ViewerScene modelUrl={activeProject.modelUrl} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
