import { RoundedBox } from "@react-three/drei";

function Column({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[0.18, 2.3, 0.18]} />
      <meshStandardMaterial color="#d7c5a3" metalness={0.12} roughness={0.38} />
    </mesh>
  );
}

export function ArchitectureModel() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      <RoundedBox args={[8.6, 0.35, 6.4]} radius={0.12} smoothness={6} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9dfcf" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[5.6, 0.25, 2.2]} radius={0.1} smoothness={6} position={[-0.8, 0.4, 1.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f1e8" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[3.1, 0.22, 5.5]} radius={0.08} smoothness={6} position={[2.3, 0.39, -0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#dbccb3" roughness={0.72} />
      </RoundedBox>

      <RoundedBox args={[5.8, 2.2, 0.18]} radius={0.04} smoothness={4} position={[-0.6, 1.5, -2.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f5f1" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[3.4, 2.2, 0.18]} radius={0.04} smoothness={4} position={[2.4, 1.5, 2.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#ede6da" roughness={0.58} />
      </RoundedBox>

      <mesh position={[0.8, 1.5, 1.55]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.1, 0.08]} />
        <meshPhysicalMaterial color="#b9c5cb" transmission={0.86} roughness={0.05} thickness={0.2} transparent opacity={0.75} />
      </mesh>

      <mesh position={[3.2, 0.13, -1.6]} receiveShadow>
        <boxGeometry args={[2.6, 0.04, 1.8]} />
        <meshStandardMaterial color="#8db5c7" roughness={0.25} metalness={0.12} />
      </mesh>

      {[
        [-3.4, 1.35, 2.1],
        [-1.9, 1.35, 2.1],
        [-0.4, 1.35, 2.1],
        [1.1, 1.35, 2.1],
      ].map((position, index) => (
        <Column key={index} position={position as [number, number, number]} />
      ))}

      <mesh position={[0.1, 2.55, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.18, 2.4]} />
        <meshStandardMaterial color="#d8c3a2" roughness={0.52} />
      </mesh>
    </group>
  );
}
