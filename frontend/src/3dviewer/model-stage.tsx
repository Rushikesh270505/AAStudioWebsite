import { useGLTF } from "@react-three/drei";

export function GLTFAsset({ url }: { url: string }) {
  const model = useGLTF(url);

  return <primitive object={model.scene} scale={1.4} position={[0, -0.2, 0]} />;
}
