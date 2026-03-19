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
  return (
    <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
      <div className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Luxury 3BHK walkthrough</p>
        <h3 className="display-title mt-4 text-3xl md:text-4xl">Walk through a warm, hotel-inspired 3BHK in first person</h3>
        <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
          This interactive walkthrough now stages a premium three-bedroom residence with marble flooring, soft beige paneling, tailored bedrooms, dining, living, and spa-style bath zones inspired by your reference mood.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[24px] border border-black/8 bg-white/65 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Spaces</p>
            <p className="mt-2 text-sm leading-7 text-[#3d3d3d]">Move from living and dining into the bedroom suites and bathrooms to review circulation, lighting, and the overall atmosphere of the residence.</p>
          </div>
          <div className="rounded-[24px] border border-black/8 bg-white/65 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Controls</p>
            <p className="mt-2 text-sm leading-7 text-[#3d3d3d]">W / S move forward and backward, A / D strafe, and mouse look activates after locking the cursor inside the scene.</p>
          </div>
        </div>

        <button
          id="walkthrough-launch"
          type="button"
          className="premium-button mt-6 px-5 py-3 text-sm font-medium"
        >
          Click here, then click inside the residence
        </button>
      </div>

      <div className="glass-panel overflow-hidden rounded-[32px] p-3">
        <div className="h-[560px] overflow-hidden rounded-[26px] bg-[#d8d0c5]">
          <Canvas shadows camera={{ fov: 72, position: [0, 1.65, 11.5] }}>
            <Luxury3BHKScene />
            <WalkController />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
