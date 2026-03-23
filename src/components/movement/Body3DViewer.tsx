import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BodyParams {
  weight?: number;   // numeric kg
  height?: number;   // numeric cm
  chest?: number;    // numeric cm
  waist?: number;    // numeric cm
  hips?: number;     // numeric cm
  thighs?: number;   // numeric cm
  arms?: number;     // numeric cm
  bodyFat?: number;  // numeric %
}

function parseNumeric(val: string | null | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? undefined : n;
}

// Parametric human body mesh built from primitives
function HumanBody({ params }: { params: BodyParams }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Normalise measurements to scale factors (base = average female)
  const baseChest = 90, baseWaist = 72, baseHips = 96, baseThighs = 56, baseArms = 28;
  const baseHeight = 165;

  const heightScale = params.height ? params.height / baseHeight : 1;
  const chestScale = params.chest ? params.chest / baseChest : 1;
  const waistScale = params.waist ? params.waist / baseWaist : 1;
  const hipScale = params.hips ? params.hips / baseHips : 1;
  const thighScale = params.thighs ? params.thighs / baseThighs : 1;
  const armScale = params.arms ? params.arms / baseArms : 1;

  // Body fat affects softness/roundness
  const fatFactor = params.bodyFat ? Math.max(0.85, 1 + (params.bodyFat - 22) * 0.012) : 1;

  const skinColor = "#e8c4a0";
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.7,
    metalness: 0.05,
  }), []);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2d1050",
    roughness: 0.5,
    metalness: 0.1,
  }), []);

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      {/* Head */}
      <mesh position={[0, 1.65 * heightScale, 0]} material={mat}>
        <sphereGeometry args={[0.12, 24, 24]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.52 * heightScale, 0]} material={mat}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
      </mesh>

      {/* Upper torso (chest) */}
      <mesh position={[0, 1.35 * heightScale, 0]} material={mat}>
        <cylinderGeometry args={[
          0.16 * chestScale * fatFactor, // top
          0.14 * waistScale * fatFactor, // bottom
          0.28 * heightScale,
          16
        ]} />
      </mesh>

      {/* Lower torso (waist to hips) */}
      <mesh position={[0, 1.08 * heightScale, 0]} material={mat}>
        <cylinderGeometry args={[
          0.13 * waistScale * fatFactor,
          0.17 * hipScale * fatFactor,
          0.26 * heightScale,
          16
        ]} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.2 * chestScale, 1.38 * heightScale, 0]} rotation={[0, 0, 0.15]}>
        <mesh position={[0, -0.15, 0]} material={mat}>
          <cylinderGeometry args={[0.04 * armScale * fatFactor, 0.035 * armScale * fatFactor, 0.25, 10]} />
        </mesh>
        <mesh position={[0, -0.38, 0]} material={mat}>
          <cylinderGeometry args={[0.035 * armScale * fatFactor, 0.025, 0.22, 10]} />
        </mesh>
      </group>

      {/* Right arm */}
      <group position={[0.2 * chestScale, 1.38 * heightScale, 0]} rotation={[0, 0, -0.15]}>
        <mesh position={[0, -0.15, 0]} material={mat}>
          <cylinderGeometry args={[0.04 * armScale * fatFactor, 0.035 * armScale * fatFactor, 0.25, 10]} />
        </mesh>
        <mesh position={[0, -0.38, 0]} material={mat}>
          <cylinderGeometry args={[0.035 * armScale * fatFactor, 0.025, 0.22, 10]} />
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.08 * hipScale, 0.94 * heightScale, 0]}>
        <mesh position={[0, -0.2, 0]} material={mat}>
          <cylinderGeometry args={[0.07 * thighScale * fatFactor, 0.05 * thighScale * fatFactor, 0.36, 12]} />
        </mesh>
        <mesh position={[0, -0.54, 0]} material={mat}>
          <cylinderGeometry args={[0.045, 0.035, 0.32, 10]} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.72, 0.02]} material={darkMat}>
          <boxGeometry args={[0.06, 0.04, 0.1]} />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.08 * hipScale, 0.94 * heightScale, 0]}>
        <mesh position={[0, -0.2, 0]} material={mat}>
          <cylinderGeometry args={[0.07 * thighScale * fatFactor, 0.05 * thighScale * fatFactor, 0.36, 12]} />
        </mesh>
        <mesh position={[0, -0.54, 0]} material={mat}>
          <cylinderGeometry args={[0.045, 0.035, 0.32, 10]} />
        </mesh>
        <mesh position={[0, -0.72, 0.02]} material={darkMat}>
          <boxGeometry args={[0.06, 0.04, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

interface Body3DViewerProps {
  measurements?: {
    weight?: string | null;
    height?: string | null;
    chest?: string | null;
    waist?: string | null;
    hips?: string | null;
    thighs?: string | null;
    arms?: string | null;
    body_fat?: string | null;
  } | null;
}

export default function Body3DViewer({ measurements }: Body3DViewerProps) {
  const params: BodyParams = useMemo(() => ({
    weight: parseNumeric(measurements?.weight),
    height: parseNumeric(measurements?.height),
    chest: parseNumeric(measurements?.chest),
    waist: parseNumeric(measurements?.waist),
    hips: parseNumeric(measurements?.hips),
    thighs: parseNumeric(measurements?.thighs),
    arms: parseNumeric(measurements?.arms),
    bodyFat: parseNumeric(measurements?.body_fat),
  }), [measurements]);

  return (
    <div className="w-full aspect-[3/4] max-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a0533] to-[#0d0d1a] border border-white/10">
      <Canvas camera={{ position: [0, 1.2, 2.2], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} color="#a855f7" />
        <pointLight position={[0, 0, 2]} intensity={0.3} color="#818cf8" />
        <HumanBody params={params} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 1.1, 0]}
        />
      </Canvas>
      <div className="relative -mt-10 text-center pb-3">
        <p className="font-mono text-[10px] text-white/40">Drag to rotate</p>
      </div>
    </div>
  );
}
