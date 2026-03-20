/**
 * 3D Exercise Rig — Procedural humanoid figure rendered with React Three Fiber.
 * Driven by the same JointPose keyframe data as the 2D rig.
 * Maps 2D SVG coords (200×300 viewBox) to 3D space and adds depth.
 */

import { useRef, useEffect, useCallback, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { JointPose, ExerciseAnimationDef } from "@/data/exercise-animations";

// ── Interpolation (same logic as 2D rig) ──

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: JointPose, b: JointPose, t: number): JointPose {
  const result = {} as JointPose;
  for (const key of Object.keys(a) as (keyof JointPose)[]) {
    result[key] = lerp(a[key], b[key], t);
  }
  return result;
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function getPoseAtTime(keyframes: JointPose[], cycleDuration: number, elapsed: number): JointPose {
  if (keyframes.length < 2) return keyframes[0];
  const segments = keyframes.length - 1;
  const segDuration = cycleDuration / segments;
  const looped = elapsed % cycleDuration;
  const segIndex = Math.min(Math.floor(looped / segDuration), segments - 1);
  const segT = easeInOutSine((looped - segIndex * segDuration) / segDuration);
  return lerpPose(keyframes[segIndex], keyframes[segIndex + 1], segT);
}

// ── 2D → 3D coordinate mapping ──
// SVG viewBox is 200×300, centre at (100, 150)
// Map to 3D: X stays, Y inverts (up = positive), Z adds slight depth

function to3D(x: number, y: number, z: number = 0): [number, number, number] {
  const scale = 0.02;
  return [
    (x - 100) * scale,
    (150 - y) * scale,
    z * scale,
  ];
}

// ── Colours from the brand (HSL from index.css tokens) ──
const SKIN_COLOR = new THREE.Color("hsl(25, 40%, 82%)");
const BODY_COLOR = new THREE.Color("hsl(270, 25%, 55%)"); // Signal purple
const DARK_COLOR = new THREE.Color("hsl(270, 20%, 35%)");
const JOINT_COLOR = new THREE.Color("hsl(270, 30%, 60%)");
const SHOE_COLOR = new THREE.Color("hsl(270, 15%, 50%)");

// ── Limb capsule component ──

function Limb({
  start,
  end,
  radius,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: THREE.Color;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const dir = e.clone().sub(s);
    const length = dir.length();

    meshRef.current.position.copy(mid);
    meshRef.current.scale.set(1, length || 0.001, 1);

    if (length > 0.001) {
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
      meshRef.current.quaternion.copy(quat);
    }
  }, [start, end]);

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[radius, 1, 4, 8]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  );
}

// ── Joint sphere ──

function Joint({ position, radius, color }: { position: [number, number, number]; radius: number; color: THREE.Color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

// ── Head ──

function Head({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Hair */}
      <mesh position={[0, 0.04, -0.01]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color={new THREE.Color("hsl(22, 30%, 30%)")} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── Shoe ──

function Shoe({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0] + 0.03, position[1] - 0.02, position[2]]}>
      <boxGeometry args={[0.1, 0.05, 0.06]} />
      <meshStandardMaterial color={SHOE_COLOR} roughness={0.7} />
    </mesh>
  );
}

// ── Animated Figure ──

function AnimatedFigure({
  animation,
  playing,
  mirrored,
}: {
  animation: ExerciseAnimationDef;
  playing: boolean;
  mirrored: boolean;
}) {
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const poseRef = useRef<JointPose>(animation.keyframes[0]);
  const [pose, setPose] = useState<JointPose>(animation.keyframes[0]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!playing) return;
    elapsedRef.current += delta * 1000;
    const newPose = getPoseAtTime(animation.keyframes, animation.cycleDuration, elapsedRef.current);
    poseRef.current = newPose;
    setPose(newPose);
  });

  const p = pose;

  // Convert 2D coords to 3D with slight Z offsets for depth
  const head = to3D(p.headX, p.headY, 0);
  const neck = to3D(p.neckX, p.neckY, 0);
  const shoulderL = to3D(p.shoulderLX, p.shoulderLY, 3);
  const shoulderR = to3D(p.shoulderRX, p.shoulderRY, -3);
  const elbowL = to3D(p.elbowLX, p.elbowLY, 5);
  const elbowR = to3D(p.elbowRX, p.elbowRY, -5);
  const handL = to3D(p.handLX, p.handLY, 6);
  const handR = to3D(p.handRX, p.handRY, -6);
  const hip = to3D(p.hipX, p.hipY, 0);
  const hipL = to3D(p.hipLX, p.hipLY, 2);
  const hipR = to3D(p.hipRX, p.hipRY, -2);
  const kneeL = to3D(p.kneeLX, p.kneeLY, 2);
  const kneeR = to3D(p.kneeRX, p.kneeRY, -2);
  const footL = to3D(p.footLX, p.footLY, 2);
  const footR = to3D(p.footRX, p.footRY, -2);

  const limbR = 0.04;
  const armR = 0.032;

  return (
    <group ref={groupRef} scale={mirrored ? [-1, 1, 1] : [1, 1, 1]}>
      {/* Head */}
      <Head position={head} />

      {/* Neck */}
      <Limb start={[head[0], head[1] - 0.12, head[2]]} end={neck} radius={0.03} color={SKIN_COLOR} />

      {/* Torso - shoulder to shoulder */}
      <Limb start={shoulderL} end={shoulderR} radius={0.055} color={BODY_COLOR} />
      {/* Torso - spine */}
      <Limb start={neck} end={hip} radius={0.06} color={BODY_COLOR} />
      {/* Torso - fill left */}
      <Limb start={shoulderL} end={hipL} radius={0.045} color={BODY_COLOR} />
      {/* Torso - fill right */}
      <Limb start={shoulderR} end={hipR} radius={0.045} color={BODY_COLOR} />
      {/* Hip bar */}
      <Limb start={hipL} end={hipR} radius={0.05} color={BODY_COLOR} />

      {/* Upper arms */}
      <Limb start={shoulderL} end={elbowL} radius={armR} color={SKIN_COLOR} />
      <Limb start={shoulderR} end={elbowR} radius={armR} color={SKIN_COLOR} />

      {/* Forearms */}
      <Limb start={elbowL} end={handL} radius={armR * 0.85} color={SKIN_COLOR} />
      <Limb start={elbowR} end={handR} radius={armR * 0.85} color={SKIN_COLOR} />

      {/* Hands */}
      <Joint position={handL} radius={0.04} color={SKIN_COLOR} />
      <Joint position={handR} radius={0.04} color={SKIN_COLOR} />

      {/* Upper legs */}
      <Limb start={hipL} end={kneeL} radius={limbR * 1.2} color={DARK_COLOR} />
      <Limb start={hipR} end={kneeR} radius={limbR * 1.2} color={DARK_COLOR} />

      {/* Lower legs */}
      <Limb start={kneeL} end={footL} radius={limbR} color={SKIN_COLOR} />
      <Limb start={kneeR} end={footR} radius={limbR} color={SKIN_COLOR} />

      {/* Shoes */}
      <Shoe position={footL} />
      <Shoe position={footR} />

      {/* Joint indicators */}
      {[shoulderL, shoulderR, elbowL, elbowR, hipL, hipR, kneeL, kneeR].map((pos, i) => (
        <Joint key={i} position={pos} radius={0.025} color={JOINT_COLOR} />
      ))}
    </group>
  );
}

// ── Floor grid ──

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        color={new THREE.Color("hsl(30, 15%, 90%)")}
        roughness={0.9}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

// ── Screenshot helper ──

function ScreenshotHelper({ onCapture }: { onCapture: (fn: () => void) => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    onCapture(() => {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "exercise-3d.png";
      link.href = dataUrl;
      link.click();
    });
  }, [gl, scene, camera, onCapture]);

  return null;
}

// ── Main exported component ──

interface ExerciseRig3DProps {
  animation: ExerciseAnimationDef;
  playing?: boolean;
  mirrored?: boolean;
  height?: number;
  onScreenshotReady?: (fn: () => void) => void;
}

export default function ExerciseRig3D({
  animation,
  playing = true,
  mirrored = false,
  height = 280,
  onScreenshotReady,
}: ExerciseRig3DProps) {
  const captureRef = useRef<(() => void) | null>(null);

  const handleCapture = useCallback((fn: () => void) => {
    captureRef.current = fn;
    onScreenshotReady?.(fn);
  }, [onScreenshotReady]);

  return (
    <div style={{ width: "100%", height }} className="rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 4]} intensity={0.8} color="hsl(30, 30%, 100%)" />
          <directionalLight position={[-2, 3, -2]} intensity={0.3} color="hsl(270, 40%, 80%)" />
          <pointLight position={[0, -2, 3]} intensity={0.2} color="hsl(270, 30%, 70%)" />

          <Environment preset="studio" />
          <AnimatedFigure animation={animation} playing={playing} mirrored={mirrored} />
          <Floor />
          <ScreenshotHelper onCapture={handleCapture} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
