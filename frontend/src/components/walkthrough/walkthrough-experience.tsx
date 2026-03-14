"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointerLockControls, Sky } from "@react-three/drei";

const OBSTACLES = [
  { minX: -1.6, maxX: 1.6, minZ: -0.8, maxZ: 0.8 },
  { minX: 3.1, maxX: 4.5, minZ: -2.8, maxZ: 2.4 },
  { minX: -6.4, maxX: -4.8, minZ: 1.8, maxZ: 4.6 },
];

function collides(x: number, z: number) {
  return OBSTACLES.some(
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

    const nextX = THREE.MathUtils.clamp(state.camera.position.x + velocity.current.x * delta, -8.8, 8.8);
    const nextZ = THREE.MathUtils.clamp(state.camera.position.z + velocity.current.z * delta, -8.8, 8.8);

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

function InteriorScene() {
  return (
    <>
      <Sky distance={450000} sunPosition={[2, 1, 0]} turbidity={6} rayleigh={2.2} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 10, 5]} intensity={1.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[0, 3, 0]} intensity={12} distance={12} color="#ffd9a6" />
      <pointLight position={[6, 2.2, -3]} intensity={4} distance={8} color="#c5e7ff" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#d9d2c8" />
      </mesh>

      <mesh position={[0, 1.5, -9]} castShadow receiveShadow>
        <boxGeometry args={[18, 3.2, 0.35]} />
        <meshStandardMaterial color="#e6ddd2" />
      </mesh>
      <mesh position={[-9, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 3.2, 18]} />
        <meshStandardMaterial color="#e9e2d8" />
      </mesh>
      <mesh position={[9, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 3.2, 18]} />
        <meshStandardMaterial color="#e9e2d8" />
      </mesh>
      <mesh position={[0, 1.5, 9]} castShadow receiveShadow>
        <boxGeometry args={[18, 3.2, 0.35]} />
        <meshStandardMaterial color="#e6ddd2" />
      </mesh>

      <mesh position={[0, 1.2, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#bca384" roughness={0.64} />
      </mesh>
      <mesh position={[3.8, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.8, 5.2]} />
        <meshStandardMaterial color="#efe7dc" roughness={0.5} />
      </mesh>
      <mesh position={[-5.6, 0.55, 3.2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.1, 2.8]} />
        <meshStandardMaterial color="#d7c8b1" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.45, 6.2]} castShadow receiveShadow>
        <boxGeometry args={[9.6, 2.4, 0.08]} />
        <meshPhysicalMaterial color="#cbd6dc" transmission={0.92} roughness={0.05} transparent opacity={0.82} />
      </mesh>

      <mesh position={[0, 2.9, 0]} receiveShadow>
        <boxGeometry args={[11.6, 0.18, 7.6]} />
        <meshStandardMaterial color="#ccb08c" roughness={0.54} />
      </mesh>

      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 1.4, 5.8]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 0.18]} />
          <meshStandardMaterial color="#d9c8a9" />
        </mesh>
      ))}

      <WalkController />
    </>
  );
}

export function WalkthroughExperience() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.35fr_0.65fr]">
      <div className="glass-panel rounded-[32px] p-6 md:p-8">
        <p className="eyebrow">Walkthrough engine</p>
        <h3 className="display-title mt-4 text-3xl md:text-4xl">Move through the house in first person</h3>
        <p className="mt-4 text-sm leading-7 text-[#5d5d5d]">
          WASD locomotion, pointer-lock look controls, collision boxes, and warm lighting presets create a browser-based spatial review experience for remote clients.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[24px] border border-black/8 bg-white/65 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Controls</p>
            <p className="mt-2 text-sm leading-7 text-[#3d3d3d]">W / S move forward and backward. A / D strafe. Mouse look activates after locking the cursor.</p>
          </div>
          <div className="rounded-[24px] border border-black/8 bg-white/65 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8f6532]">Use case</p>
            <p className="mt-2 text-sm leading-7 text-[#3d3d3d]">Ideal for house previews, interior coordination walkthroughs, and client sign-offs before site execution.</p>
          </div>
        </div>

        <button
          id="walkthrough-launch"
          type="button"
          className="premium-button mt-6 px-5 py-3 text-sm font-medium"
        >
          Click here, then click inside the scene
        </button>
      </div>

      <div className="glass-panel overflow-hidden rounded-[32px] p-3">
        <div className="h-[560px] overflow-hidden rounded-[26px] bg-[#d8d0c5]">
          <Canvas shadows camera={{ fov: 72, position: [0, 1.65, 8.5] }}>
            <InteriorScene />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
