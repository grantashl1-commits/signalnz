/**
 * MixamoViewer — Loads Mixamo FBX animation files and plays them
 * on a Three.js canvas with save-to-image capability.
 *
 * Place FBX files in public/animations/ (e.g. squat.fbx, lunge.fbx)
 * Download free from: https://www.mixamo.com
 *
 * Falls back to the procedural ExerciseRig3D if no FBX file is mapped.
 */

import { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useAnimations } from "@react-three/drei";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";
import { Camera, Download, Play, Pause, RotateCcw } from "lucide-react";

// ── FBX file mapping — add your Mixamo downloads here ──
// Key: exercise name (lowercase), Value: path to FBX in /public
const FBX_MAP: Record<string, string> = {
  // Example entries — uncomment when you add FBX files:
  // "squat": "/animations/squat.fbx",
  // "push-up": "/animations/push-up.fbx",
  // "lunge": "/animations/lunge.fbx",
  // "deadlift": "/animations/deadlift.fbx",
  // "plank": "/animations/plank.fbx",
  // "hip thrust": "/animations/hip-thrust.fbx",
  // "bicep curl": "/animations/bicep-curl.fbx",
};

/** Check if we have a Mixamo FBX for this exercise */
export function hasMixamoAnimation(exerciseName: string): boolean {
  return exerciseName.toLowerCase() in FBX_MAP;
}

/** Get the FBX path for an exercise */
export function getMixamoPath(exerciseName: string): string | null {
  return FBX_MAP[exerciseName.toLowerCase()] ?? null;
}

// ── Animated FBX Character ──

function FBXCharacter({ url, playing }: { url: string; playing: boolean }) {
  const fbx = useFBX(url);
  const { actions } = useAnimations(fbx.animations, fbx);

  useEffect(() => {
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      if (playing) {
        firstAction.reset().play();
      } else {
        firstAction.paused = true;
      }
    }
    return () => {
      Object.values(actions).forEach(a => a?.stop());
    };
  }, [actions, playing]);

  // Scale + centre the model
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    fbx.scale.setScalar(scale);
    fbx.position.set(-centre.x * scale, -box.min.y * scale - 1.5, -centre.z * scale);
  }, [fbx]);

  return <primitive object={fbx} />;
}

// ── Floor ──

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        color="hsl(30, 15%, 90%)"
        roughness={0.9}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// ── Save screenshot helper inside Canvas ──

function ScreenshotHelper({ onCapture }: { onCapture: (fn: () => void) => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    onCapture(() => {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "exercise-screenshot.png";
      link.href = dataUrl;
      link.click();
    });
  }, [gl, scene, camera, onCapture]);

  return null;
}

// ── Main Component ──

interface MixamoViewerProps {
  exerciseName: string;
  fbxPath: string;
  height?: number;
}

export default function MixamoViewer({ exerciseName, fbxPath, height = 360 }: MixamoViewerProps) {
  const [playing, setPlaying] = useState(true);
  const screenshotFnRef = useRef<(() => void) | null>(null);

  const handleCapture = (fn: () => void) => {
    screenshotFnRef.current = fn;
  };

  const handleScreenshot = () => {
    screenshotFnRef.current?.();
  };

  return (
    <div className="space-y-2">
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          height,
          background: "linear-gradient(160deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.5) 50%, hsl(var(--primary) / 0.05) 100%)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 5, 4]} intensity={0.8} />
            <directionalLight position={[-2, 3, -2]} intensity={0.3} color="hsl(270, 40%, 80%)" />
            <Environment preset="studio" />

            <FBXCharacter url={fbxPath} playing={playing} />
            <Floor />
            <ScreenshotHelper onCapture={handleCapture} />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPlaying(!playing)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-muted-foreground font-mono text-[10px] transition-colors hover:bg-secondary/80"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "pause" : "play"}
        </button>
        <button
          onClick={handleScreenshot}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] transition-colors hover:bg-primary/15"
        >
          <Camera className="h-3 w-3" />
          save image
        </button>
      </div>
      <p className="text-center font-mono text-[9px] text-muted-foreground">{exerciseName} · Mixamo 3D</p>
    </div>
  );
}
