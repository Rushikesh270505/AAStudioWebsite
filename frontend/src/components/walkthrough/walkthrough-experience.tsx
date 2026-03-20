"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import {
  Luxury3BHKScene,
  WALKTHROUGH_BOUNDS,
  WALKTHROUGH_OBSTACLES,
} from "@/components/walkthrough/luxury-3bhk-scene";

function collides(x: number, z: number) {
  return WALKTHROUGH_OBSTACLES.some(
    (obstacle) =>
      x > obstacle.minX - 0.45 &&
      x < obstacle.maxX + 0.45 &&
      z > obstacle.minZ - 0.45 &&
      z < obstacle.maxZ + 0.45,
  );
}

function WalkController() {
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const velocity = useRef(new THREE.Vector3());
  const forwardVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  const upVector = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyW") keysRef.current.forward = true;
      if (event.code === "KeyS") keysRef.current.backward = true;
      if (event.code === "KeyA") keysRef.current.left = true;
      if (event.code === "KeyD") keysRef.current.right = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyW") keysRef.current.forward = false;
      if (event.code === "KeyS") keysRef.current.backward = false;
      if (event.code === "KeyA") keysRef.current.left = false;
      if (event.code === "KeyD") keysRef.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    state.camera.getWorldDirection(forwardVector.current);
    forwardVector.current.y = 0;
    forwardVector.current.normalize();

    sideVector.current.crossVectors(forwardVector.current, upVector.current).normalize();

    const front = Number(keysRef.current.forward) - Number(keysRef.current.backward);
    const side = Number(keysRef.current.right) - Number(keysRef.current.left);

    const targetVelocity = new THREE.Vector3();
    targetVelocity
      .addScaledVector(forwardVector.current, front)
      .addScaledVector(sideVector.current, side);

    if (targetVelocity.lengthSq() > 0) {
      targetVelocity.normalize().multiplyScalar(4.6);
    }

    velocity.current.lerp(targetVelocity, 1 - Math.exp(-delta * 10));

    const nextX = THREE.MathUtils.clamp(
      state.camera.position.x + velocity.current.x * delta,
      WALKTHROUGH_BOUNDS.minX,
      WALKTHROUGH_BOUNDS.maxX,
    );
    const nextZ = THREE.MathUtils.clamp(
      state.camera.position.z + velocity.current.z * delta,
      WALKTHROUGH_BOUNDS.minZ,
      WALKTHROUGH_BOUNDS.maxZ,
    );

    if (!collides(nextX, state.camera.position.z)) {
      state.camera.position.x = nextX;
    }

    if (!collides(state.camera.position.x, nextZ)) {
      state.camera.position.z = nextZ;
    }

    state.camera.position.y = 1.65;
  });

  return <PointerLockControls selector="#walkthrough-launch" />;
}

export function WalkthroughExperience() {
  const routeStops = [
    {
      title: "Living lounge",
      detail: "Start in the open lounge and orient yourself to the central circulation spine.",
    },
    {
      title: "Dining gallery",
      detail: "Move left toward the warm marble dining zone and chandelier-led family setting.",
    },
    {
      title: "Master bedroom",
      detail: "Continue deeper into the suite with layered upholstery, wardrobe walls, and cove lighting.",
    },
    {
      title: "Kids room",
      detail: "Turn into the lighter secondary room with softer styling and playful study details.",
    },
    {
      title: "Bathrooms",
      detail: "Finish in the spa-like bathrooms with backlit mirrors, stone textures, and glass shower zones.",
    },
  ];

  const controlItems = [
    { key: "W / S", label: "Move forward and backward" },
    { key: "A / D", label: "Strafe left and right" },
    { key: "Mouse", label: "Look around once the cursor is locked" },
    { key: "Esc", label: "Release the cursor from the walkthrough" },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[34px] p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.64fr)_minmax(320px,0.36fr)] lg:items-start">
          <div>
            <p className="eyebrow">Luxury 3BHK walkthrough</p>
            <h3 className="display-title mt-4 text-3xl md:text-5xl">
              Walk a warmer, more dressed 3BHK with guided circulation through every key room
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5d5d5d] md:text-base">
              The walkthrough now centers the playable residence and stages a more polished interior palette:
              richer decor, stronger light contrast, cleaner reflections, and a guided route through the living
              room, dining zone, master bedroom, kids room, and spa-inspired bathrooms.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-white/62 p-5 shadow-[0_24px_64px_rgba(44,44,44,0.08)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Route preview</p>
            <div className="mt-4 space-y-3">
              {routeStops.map((stop, index) => (
                <div
                  key={stop.title}
                  className="rounded-[22px] border border-black/6 bg-[#fbf8f2]/75 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full border border-[#d8c8b4] bg-[#f4ece1] text-[11px] font-medium text-[#7f5c38]">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-[#2f2a25]">{stop.title}</p>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[#62574b]">{stop.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[36px] p-4 md:p-5">
        <div className="mx-auto max-w-[1220px]">
          <div className="overflow-hidden rounded-[30px] border border-black/7 bg-[#e1d6c7]/60 shadow-[0_36px_80px_rgba(44,44,44,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/6 bg-white/45 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Playable residence</p>
                <p className="mt-1 text-sm text-[#5b5147]">
                  Centered first-person engine with guided 3BHK room progression.
                </p>
              </div>
              <div className="rounded-full border border-black/8 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#7f5d39]">
                Living • Dining • Master • Kids • Bath
              </div>
            </div>

            <div className="h-[520px] md:h-[620px] xl:h-[700px]">
              <Canvas shadows camera={{ fov: 72, position: [0, 1.65, 11.5] }}>
                <Luxury3BHKScene />
                <WalkController />
              </Canvas>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
        <div className="glass-panel rounded-[30px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Controls</p>
              <h4 className="mt-3 font-display text-3xl leading-none text-[#2c2c2c]">Move through the home</h4>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#5e574f]">
                Launch the walkthrough, click inside the residence, and use the controls below to move through the
                route without leaving the centered engine.
              </p>
            </div>

            <button
              id="walkthrough-launch"
              type="button"
              className="premium-button px-5 py-3 text-sm font-medium shadow-[0_18px_36px_rgba(44,44,44,0.14)]"
            >
              Launch walkthrough
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {controlItems.map((item) => (
              <div
                key={item.key}
                className="rounded-[24px] border border-black/8 bg-white/62 px-4 py-4 shadow-[0_18px_40px_rgba(44,44,44,0.06)]"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">{item.key}</p>
                <p className="mt-2 text-sm leading-6 text-[#38322d]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[30px] p-6">
          <p className="eyebrow">Guided path</p>
          <h4 className="mt-3 font-display text-3xl leading-none text-[#2c2c2c]">Suggested walkthrough order</h4>
          <p className="mt-3 text-sm leading-7 text-[#5e574f]">
            Follow the glowing path markers inside the 3D engine. They quietly lead you from the public living
            zones into the more private bedroom and bathroom suites.
          </p>

          <div className="mt-6 space-y-3">
            {routeStops.map((stop, index) => (
              <div
                key={stop.title}
                className="flex gap-4 rounded-[24px] border border-black/7 bg-white/62 px-4 py-4 shadow-[0_18px_40px_rgba(44,44,44,0.06)]"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#d7c3ab] bg-[#f3eadf] text-[11px] font-medium text-[#7f5a35]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#302a25]">{stop.title}</p>
                  <p className="mt-1 text-xs leading-6 text-[#62574b]">{stop.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
