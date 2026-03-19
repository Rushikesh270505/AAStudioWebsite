"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const WALKTHROUGH_BOUNDS = {
  minX: -15.5,
  maxX: 15.5,
  minZ: -13.5,
  maxZ: 13.5,
};

export const WALKTHROUGH_OBSTACLES = [
  { minX: -2.6, maxX: 2.6, minZ: 6.2, maxZ: 8.8 },
  { minX: -8.2, maxX: -4.2, minZ: 4.6, maxZ: 7.3 },
  { minX: -11.8, maxX: -8.3, minZ: -0.5, maxZ: 1.5 },
  { minX: -10.2, maxX: -5.8, minZ: -8.2, maxZ: -5.2 },
  { minX: -0.5, maxX: 2.8, minZ: -9.8, maxZ: -6.4 },
  { minX: 6.4, maxX: 10.6, minZ: -8.2, maxZ: -5.2 },
  { minX: 6.5, maxX: 10.2, minZ: 1.4, maxZ: 4.7 },
  { minX: 11.8, maxX: 13.6, minZ: 2.2, maxZ: 6.4 },
  { minX: 12.0, maxX: 13.8, minZ: -8.3, maxZ: -4.1 },
];

function WarmFloor() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[34, 30, 1, 1]} />
      <meshStandardMaterial color="#e7ddcf" roughness={0.22} metalness={0.06} />
    </mesh>
  );
}

function CeilingPlane() {
  return (
    <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 3.84, 0]}>
      <planeGeometry args={[34, 30]} />
      <meshStandardMaterial color="#f4ede3" roughness={0.88} />
    </mesh>
  );
}

function PerimeterShell() {
  const wallMaterial = <meshStandardMaterial color="#efe4d4" roughness={0.82} />;
  const trimMaterial = <meshStandardMaterial color="#8b6649" roughness={0.58} />;

  return (
    <group>
      <mesh position={[0, 1.9, -14]} castShadow receiveShadow>
        <boxGeometry args={[32, 3.8, 0.28]} />
        {wallMaterial}
      </mesh>
      <mesh position={[0, 1.9, 14]} castShadow receiveShadow>
        <boxGeometry args={[32, 3.8, 0.28]} />
        {wallMaterial}
      </mesh>
      <mesh position={[-16, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 3.8, 28]} />
        {wallMaterial}
      </mesh>
      <mesh position={[16, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 3.8, 28]} />
        {wallMaterial}
      </mesh>

      <mesh position={[0, 3.25, -13.82]} castShadow receiveShadow>
        <boxGeometry args={[31.2, 0.24, 0.2]} />
        {trimMaterial}
      </mesh>
      <mesh position={[0, 3.25, 13.82]} castShadow receiveShadow>
        <boxGeometry args={[31.2, 0.24, 0.2]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-15.82, 3.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.24, 27.2]} />
        {trimMaterial}
      </mesh>
      <mesh position={[15.82, 3.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.24, 27.2]} />
        {trimMaterial}
      </mesh>
    </group>
  );
}

function WindowBay({ position, rotation = [0, 0, 0] as [number, number, number], width = 5.4 }: { position: [number, number, number]; rotation?: [number, number, number]; width?: number; }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 2.7, 0.08]} />
        <meshPhysicalMaterial color="#cfd9db" transmission={0.92} roughness={0.04} thickness={0.1} transparent opacity={0.78} />
      </mesh>
      {[-width / 2 + 0.18, width / 2 - 0.18].map((x) => (
        <mesh key={x} position={[x, 1.58, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 2.75, 0.12]} />
          <meshStandardMaterial color="#8b6548" roughness={0.56} />
        </mesh>
      ))}
      <mesh position={[0, 1.58, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.75, 0.12]} />
        <meshStandardMaterial color="#8b6548" roughness={0.56} />
      </mesh>
      <mesh position={[0, 3, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.35, 0.18, 0.16]} />
        <meshStandardMaterial color="#8b6548" roughness={0.56} />
      </mesh>
      {[-width / 2 + 0.55, width / 2 - 0.55].map((x) => (
        <mesh key={`curtain-${x}`} position={[x, 1.58, 0.08]} castShadow>
          <boxGeometry args={[0.58, 2.55, 0.08]} />
          <meshStandardMaterial color="#e8ddd0" roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

function CoveLights() {
  const strips = [
    { position: [0, 3.58, 10.8], args: [14, 0.06, 0.06] },
    { position: [0, 3.58, 1], args: [12, 0.06, 0.06] },
    { position: [0, 3.58, -8.4], args: [13, 0.06, 0.06] },
    { position: [-10.7, 3.58, -6], args: [0.06, 0.06, 7.6] },
    { position: [10.7, 3.58, -6], args: [0.06, 0.06, 7.6] },
    { position: [-10.4, 3.58, 5.2], args: [0.06, 0.06, 4.8] },
    { position: [10.4, 3.58, 4.5], args: [0.06, 0.06, 4.8] },
  ];

  return (
    <group>
      {strips.map((strip, index) => (
        <mesh key={index} position={strip.position as [number, number, number]}>
          <boxGeometry args={strip.args as [number, number, number]} />
          <meshStandardMaterial color="#f3d8a9" emissive="#f6d8a1" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 3.4, 9]} intensity={16} distance={12} color="#ffd8a6" />
      <pointLight position={[0, 3.4, 0.8]} intensity={15} distance={11} color="#ffd4a1" />
      <pointLight position={[0, 3.4, -8]} intensity={14} distance={11} color="#ffcf98" />
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.48, 18]} />
        <meshStandardMaterial color="#ba9f7a" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.44, 18, 18]} />
        <meshStandardMaterial color="#7d9872" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0.18, 1.05, 0.04]} rotation={[0.2, 0.3, -0.3]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#90aa7d" roughness={0.78} />
      </mesh>
      <mesh castShadow position={[-0.18, 1, -0.06]} rotation={[0.2, -0.2, 0.3]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#8ea77b" roughness={0.78} />
      </mesh>
    </group>
  );
}

function Fan({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * 2.2;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 12]} />
        <meshStandardMaterial color="#8b6548" roughness={0.54} />
      </mesh>
      <mesh position={[0, -0.24, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#694c35" roughness={0.48} />
      </mesh>
      <group ref={bladesRef} position={[0, -0.24, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation) => (
          <mesh key={rotation} rotation={[0, rotation, 0]} position={[0.68, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.04, 0.16]} />
            <meshStandardMaterial color="#8a6a4e" roughness={0.62} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function WallArt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.4, 0.06]} />
        <meshStandardMaterial color="#ddd1c0" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 1.1, 0.02]} />
        <meshStandardMaterial color="#f7f0e6" roughness={0.94} />
      </mesh>
    </group>
  );
}

function SofaCluster({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[4.4, 0.46, 2.1]} radius={0.12} smoothness={4} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d2c2af" roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[4.4, 0.72, 0.4]} radius={0.1} smoothness={4} position={[0, 0.72, -0.84]} castShadow receiveShadow>
        <meshStandardMaterial color="#d7c9b6" roughness={0.92} />
      </RoundedBox>
      {[-1.45, 0, 1.45].map((x) => (
        <RoundedBox key={x} args={[0.72, 0.28, 0.72]} radius={0.08} smoothness={4} position={[x, 0.76, 0.1]} castShadow receiveShadow>
          <meshStandardMaterial color="#efe5d9" roughness={0.96} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.7, 0.22, 1.15]} radius={0.08} smoothness={4} position={[0.3, 0.18, 2.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#cdb394" roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[3.2, 0.32, 0.52]} radius={0.05} smoothness={4} position={[4.25, 0.3, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#9c744f" roughness={0.5} />
      </RoundedBox>
      <mesh position={[4.28, 1.15, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.34, 0.1]} />
        <meshStandardMaterial color="#231f1d" roughness={0.34} />
      </mesh>
      <Plant position={[5.55, 0, -1.2]} scale={0.9} />
    </group>
  );
}

function DiningArea({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[3.8, 0.18, 1.75]} radius={0.06} smoothness={4} position={[0, 0.86, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f0e7db" roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.62, 0.78, 24]} />
        <meshStandardMaterial color="#b58b57" metalness={0.2} roughness={0.42} />
      </mesh>
      {[-1.55, -0.5, 0.5, 1.55].flatMap((x) => [-1.2, 1.2].map((z) => ({ x, z }))).map(({ x, z }, index) => (
        <group key={index} position={[x, 0, z]}>
          <RoundedBox args={[0.72, 0.14, 0.72]} radius={0.08} smoothness={4} position={[0, 0.48, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#d6c0a7" roughness={0.84} />
          </RoundedBox>
          <RoundedBox args={[0.92, 0.88, 0.14]} radius={0.06} smoothness={4} position={[0, 0.96, z > 0 ? 0.28 : -0.28]} castShadow receiveShadow>
            <meshStandardMaterial color="#ddcab3" roughness={0.88} />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 2.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.45, 18]} />
        <meshStandardMaterial color="#ab8357" roughness={0.32} />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.52, 0.34, 24]} />
        <meshStandardMaterial color="#ceb18a" emissive="#f7d6a6" emissiveIntensity={0.18} roughness={0.18} />
      </mesh>
    </group>
  );
}

function KitchenArea({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[5.8, 1, 0.72]} radius={0.04} smoothness={4} position={[0, 0.52, -1.7]} castShadow receiveShadow>
        <meshStandardMaterial color="#9a724f" roughness={0.46} />
      </RoundedBox>
      <RoundedBox args={[5.8, 0.12, 0.78]} radius={0.04} smoothness={4} position={[0, 1.08, -1.68]} castShadow receiveShadow>
        <meshStandardMaterial color="#ddd0c2" roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[2.6, 0.96, 1.5]} radius={0.06} smoothness={4} position={[-0.45, 0.5, 1.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#b08a63" roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[2.72, 0.12, 1.62]} radius={0.06} smoothness={4} position={[-0.45, 1.05, 1.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#ddd0c2" roughness={0.28} />
      </RoundedBox>
      {[[-2.1, 1.85, -1.65], [-0.4, 1.85, -1.65], [1.3, 1.85, -1.65]].map((pos, index) => (
        <RoundedBox key={index} args={[1.45, 1.1, 0.4]} radius={0.04} smoothness={4} position={pos as [number, number, number]} castShadow receiveShadow>
          <meshStandardMaterial color="#efe5d6" roughness={0.76} />
        </RoundedBox>
      ))}
      <Plant position={[2.85, 0, 1.7]} scale={0.8} />
    </group>
  );
}

function BedSuite({ position, mirror = false, withFan = false }: { position: [number, number, number]; mirror?: boolean; withFan?: boolean }) {
  const side = mirror ? -1 : 1;

  return (
    <group position={position}>
      <RoundedBox args={[3.4, 0.38, 2.48]} radius={0.08} smoothness={4} position={[0, 0.24, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c6a486" roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[3.05, 0.2, 2.15]} radius={0.07} smoothness={4} position={[0, 0.54, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f1eadf" roughness={0.94} />
      </RoundedBox>
      <RoundedBox args={[3.35, 1.15, 0.18]} radius={0.05} smoothness={4} position={[0, 1.12, -1.12]} castShadow receiveShadow>
        <meshStandardMaterial color="#d7c6b1" roughness={0.88} />
      </RoundedBox>
      {[-0.78, 0, 0.78].map((x) => (
        <RoundedBox key={x} args={[0.84, 0.22, 0.62]} radius={0.08} smoothness={4} position={[x, 0.84, -0.28]} castShadow receiveShadow>
          <meshStandardMaterial color="#f5ede1" roughness={0.96} />
        </RoundedBox>
      ))}
      {[-1.8 * side, 1.8 * side].map((x) => (
        <group key={x} position={[x, 0, -0.9]}>
          <RoundedBox args={[0.56, 0.48, 0.56]} radius={0.06} smoothness={4} position={[0, 0.28, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#9b7350" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.48, 12]} />
            <meshStandardMaterial color="#a07a55" roughness={0.42} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.28, 18]} />
            <meshStandardMaterial color="#efe0cb" emissive="#f1d6a5" emissiveIntensity={0.18} roughness={0.22} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[5.1, 0.06, 2.7]} radius={0.06} smoothness={4} position={[0, 0.02, 0.2]} receiveShadow>
        <meshStandardMaterial color="#d9cec0" roughness={0.92} />
      </RoundedBox>
      <mesh position={[0, 2.2, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 2.5, 0.12]} />
        <meshStandardMaterial color="#ece3d7" roughness={0.82} />
      </mesh>
      <WallArt position={[0, 2.1, 0.64]} />
      <RoundedBox args={[4.2, 2.5, 0.55]} radius={0.04} smoothness={4} position={[2.75 * side, 1.35, -0.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#f3ece1" roughness={0.72} />
      </RoundedBox>
      {withFan ? <Fan position={[0, 3.35, 0]} /> : null}
    </group>
  );
}

function EnsuiteBathroom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial color="#d9cab7" roughness={0.26} />
      </mesh>
      <RoundedBox args={[1.35, 0.86, 0.58]} radius={0.04} smoothness={4} position={[-0.7, 0.46, -0.82]} castShadow receiveShadow>
        <meshStandardMaterial color="#ba8d62" roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[1.45, 0.08, 0.66]} radius={0.04} smoothness={4} position={[-0.7, 0.93, -0.82]} castShadow receiveShadow>
        <meshStandardMaterial color="#eee3d7" roughness={0.2} />
      </RoundedBox>
      <mesh position={[-0.7, 1.75, -1.08]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.18, 0.04]} />
        <meshStandardMaterial color="#d2c8bc" emissive="#eed7ab" emissiveIntensity={0.18} roughness={0.18} />
      </mesh>
      <mesh position={[0.8, 1.2, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 2.2, 0.06]} />
        <meshPhysicalMaterial color="#cdd7d8" transmission={0.9} roughness={0.04} transparent opacity={0.62} />
      </mesh>
      <mesh position={[0.8, 0.3, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.1, 1.35]} />
        <meshStandardMaterial color="#d6c9b8" roughness={0.32} />
      </mesh>
      <mesh position={[-0.12, 0.42, 0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.56, 18]} />
        <meshStandardMaterial color="#f3efe8" roughness={0.48} />
      </mesh>
    </group>
  );
}

function AccentDoorway({ position, rotation = [0, 0, 0] as [number, number, number], width = 3.1, height = 3.1 }: { position: [number, number, number]; rotation?: [number, number, number]; width?: number; height?: number; }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[-width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, height, 0.22]} />
        <meshStandardMaterial color="#855f43" roughness={0.46} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, height, 0.22]} />
        <meshStandardMaterial color="#855f43" roughness={0.46} />
      </mesh>
      <mesh position={[0, height, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.18, 0.18, 0.22]} />
        <meshStandardMaterial color="#855f43" roughness={0.46} />
      </mesh>
    </group>
  );
}

function DecorativeLighting() {
  return (
    <>
      <spotLight position={[-8, 5.6, 6]} angle={0.55} penumbra={0.55} intensity={45} distance={15} color="#ffe4b8" castShadow />
      <spotLight position={[8, 5.8, 6]} angle={0.55} penumbra={0.55} intensity={42} distance={15} color="#ffe1b0" castShadow />
      <spotLight position={[-8, 5.2, -6]} angle={0.6} penumbra={0.52} intensity={34} distance={14} color="#ffdbac" castShadow />
      <spotLight position={[8, 5.2, -6]} angle={0.6} penumbra={0.52} intensity={34} distance={14} color="#ffd6a0" castShadow />
      <spotLight position={[0, 5.8, 0]} angle={0.58} penumbra={0.55} intensity={32} distance={16} color="#fbd5a0" castShadow />
    </>
  );
}

export function Luxury3BHKScene() {
  return (
    <group>
      <color attach="background" args={["#e7dece"]} />
      <fog attach="fog" args={["#e7dece", 18, 34]} />

      <ambientLight intensity={0.72} />
      <directionalLight
        position={[7, 11, 8]}
        intensity={1.8}
        color="#fff4df"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <DecorativeLighting />
      <CoveLights />

      <WarmFloor />
      <CeilingPlane />
      <PerimeterShell />

      <AccentDoorway position={[-6.7, 0, 4.8]} width={3.4} />
      <AccentDoorway position={[6.7, 0, 4.8]} width={3.4} />
      <AccentDoorway position={[-8.4, 0, -4.2]} width={2.8} />
      <AccentDoorway position={[8.4, 0, -4.2]} width={2.8} />
      <AccentDoorway position={[0, 0, -4.4]} width={3.1} />

      <WindowBay position={[-12.6, 0, 5.6]} rotation={[0, Math.PI / 2, 0]} width={5.3} />
      <WindowBay position={[12.6, 0, 5]} rotation={[0, -Math.PI / 2, 0]} width={5.1} />
      <WindowBay position={[0, 0, -13.72]} width={10.8} />

      <SofaCluster position={[0, 0, 7]} />
      <DiningArea position={[-8.2, 0, 6.2]} />
      <KitchenArea position={[-8.8, 0, -0.1]} />

      <BedSuite position={[-8.1, 0, -6.7]} withFan />
      <BedSuite position={[0.8, 0, -7.1]} />
      <BedSuite position={[8.4, 0, 3.3]} mirror />

      <EnsuiteBathroom position={[12.1, 0, 4.4]} />
      <EnsuiteBathroom position={[12.3, 0, -6.1]} />

      <Plant position={[-13.2, 0, 8.2]} scale={1.15} />
      <Plant position={[11.8, 0, 8.6]} scale={1.05} />
      <Plant position={[-12.2, 0, -11.3]} scale={1.1} />
      <WallArt position={[8.4, 2, 7.8]} />
      <WallArt position={[-8.2, 2, 8.2]} />
    </group>
  );
}
