import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Camera, Image, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { haptic } from "@/hooks/use-mobile";
import { getCycleInfo, getLastPeriodStart, Phase } from "@/lib/cycle-utils";
import { PHASE_WORKOUTS, TODAY_WORKOUT, type Workout } from "@/data/workouts";

// ── Measurements ──
interface Measurements {
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hips: string;
  inseam: string;
}

const MEASUREMENT_FIELDS: { key: keyof Measurements; label: string; unit: string; placeholder: string }[] = [
  { key: "height", label: "Height", unit: "cm", placeholder: "165" },
  { key: "weight", label: "Weight", unit: "kg", placeholder: "62" },
  { key: "bust", label: "Bust", unit: "cm", placeholder: "88" },
  { key: "waist", label: "Waist", unit: "cm", placeholder: "72" },
  { key: "hips", label: "Hips", unit: "cm", placeholder: "96" },
  { key: "inseam", label: "Inseam", unit: "cm", placeholder: "78" },
];

const STORAGE_KEY = "signal_body_measurements";

function loadMeasurements(): Measurements {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { height: "", weight: "", bust: "", waist: "", hips: "", inseam: "" };
}

function saveMeasurements(m: Measurements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...m, _savedAt: new Date().toISOString() }));
}

function getSavedTimestamp(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed._savedAt || null;
    }
  } catch {}
  return null;
}

function MeasurementsForm() {
  const [measurements, setMeasurements] = useState<Measurements>(loadMeasurements);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(getSavedTimestamp);

  const hasValues = Object.values(measurements).some(v => v.trim() !== "");

  const handleChange = (key: keyof Measurements, value: string) => {
    const numeric = value.replace(/[^0-9.]/g, "").slice(0, 6);
    setMeasurements(prev => ({ ...prev, [key]: numeric }));
    setSaved(false);
  };

  const handleSave = () => {
    haptic("medium");
    saveMeasurements(measurements);
    setSaved(true);
    setLastUpdated(new Date().toISOString());
    setTimeout(() => setSaved(false), 2000);
  };

  // Derived stats
  const w = parseFloat(measurements.waist);
  const h = parseFloat(measurements.hips);
  const ht = parseFloat(measurements.height);
  const wt = parseFloat(measurements.weight);
  const whr = w && h ? (w / h).toFixed(2) : null;
  const bmi = wt && ht ? (wt / ((ht / 100) ** 2)).toFixed(1) : null;

  return (
    <div className="card-warm p-4 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold text-foreground">My Measurements</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map(field => (
          <div key={field.key} className="space-y-1">
            <label className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
              {field.label} ({field.unit})
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={measurements[field.key]}
              onChange={e => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="h-10 text-base rounded-xl bg-background border-border"
            />
          </div>
        ))}
      </div>

      {/* Derived stats */}
      {(whr || bmi) && (
        <div className="flex gap-3">
          {bmi && (
            <div className="flex-1 rounded-xl bg-background p-3 text-center">
              <p className="font-mono text-lg text-foreground">{bmi}</p>
              <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">BMI</p>
            </div>
          )}
          {whr && (
            <div className="flex-1 rounded-xl bg-background p-3 text-center">
              <p className="font-mono text-lg text-foreground">{whr}</p>
              <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Waist-Hip</p>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasValues}
        className="w-full h-10 rounded-full font-body text-sm font-semibold"
      >
        {saved ? "Saved ✓" : "Save measurements"}
      </Button>

      {lastUpdated && (
        <p className="font-body text-[10px] text-muted-foreground text-center">
          Last updated {new Date(lastUpdated).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {new Date(lastUpdated).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      {/* Proportional silhouette */}
      <ProportionalSilhouette
        bust={parseFloat(measurements.bust) || 0}
        waist={parseFloat(measurements.waist) || 0}
        hips={parseFloat(measurements.hips) || 0}
        height={parseFloat(measurements.height) || 0}
        inseam={parseFloat(measurements.inseam) || 0}
      />
    </div>
  );
}

// ── Progress Photos ──
const PHOTOS_KEY = "signal_body_photos";

interface BodyPhoto {
  id: string;
  dataUrl: string;
  date: string;
}

function loadPhotos(): BodyPhoto[] {
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function savePhotos(photos: BodyPhoto[]) {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

function ProgressPhotos() {
  const [photos, setPhotos] = useState<BodyPhoto[]>(loadPhotos);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto: BodyPhoto = {
        id: `photo-${Date.now()}`,
        dataUrl: reader.result as string,
        date: new Date().toISOString().split("T")[0],
      };
      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      savePhotos(updated);
      haptic("medium");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [photos]);

  const removePhoto = useCallback((id: string) => {
    haptic("light");
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    savePhotos(updated);
  }, [photos]);

  return (
    <div className="card-warm p-4 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-semibold text-foreground">Progress Photos</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            className="touch-btn rounded-full p-2 bg-primary/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <Camera className="h-4 w-4 text-primary" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="touch-btn rounded-full p-2 bg-primary/10 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <Image className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <p className="font-body text-[11px] text-muted-foreground">
        Photos are stored privately on your device only.
      </p>

      {photos.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="touch-btn w-full border-2 border-dashed border-border rounded-2xl py-8 flex flex-col items-center gap-2"
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="font-body text-sm text-muted-foreground">Add your first photo</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {photos.map(photo => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary"
              >
                <img src={photo.dataUrl} alt="Progress" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="font-mono text-[9px] text-white">
                    {new Date(photo.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 rounded-full bg-black/40 p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Proportional feminine silhouette ──
function ProportionalSilhouette({
  bust, waist, hips, height, inseam,
}: {
  bust: number; waist: number; hips: number; height: number; inseam: number;
}) {
  // Need at least bust/waist/hips to render
  if (!bust && !waist && !hips) return null;

  // Normalise proportions relative to hips (widest point baseline)
  const baseHips = hips || 96;
  const bustR = (bust || baseHips * 0.92) / baseHips;
  const waistR = (waist || baseHips * 0.75) / baseHips;
  const hipsR = 1;

  // Height-to-width aspect: taller = more elongated silhouette
  const heightFactor = height ? Math.max(0.85, Math.min(1.2, height / 165)) : 1;
  // Inseam affects leg length proportion
  const legRatio = inseam && height ? Math.max(0.4, Math.min(0.55, inseam / height)) : 0.46;

  // SVG coordinate system: 200 wide, height scales
  const svgW = 200;
  const totalH = 340 * heightFactor;
  const cx = svgW / 2;

  // Vertical landmarks
  const headTop = 10;
  const headR = 14;
  const neckY = headTop + headR * 2 + 4;
  const shoulderY = neckY + 12;
  const bustY = shoulderY + 28;
  const waistY = bustY + 32;
  const hipY = waistY + 28;
  const crotchY = hipY + 18;
  const kneeY = crotchY + (totalH - crotchY) * (1 - legRatio) * 0.6 + (totalH - crotchY) * legRatio * 0.45;
  const ankleY = totalH - 16;
  const footY = totalH - 6;

  // Widths (half-widths from centre)
  const maxW = 48;
  const shoulderW = maxW * bustR * 0.88;
  const bustW = maxW * bustR;
  const waistW = maxW * waistR;
  const hipW = maxW * hipsR;
  const thighW = hipW * 0.52;
  const kneeW = thighW * 0.72;
  const ankleW = kneeW * 0.6;

  // Arm dimensions
  const armGap = 4;
  const elbowY = waistY + 8;
  const wristY = hipY + 14;
  const upperArmW = 7;
  const forearmW = 5.5;

  // Build left side path (mirrored for right)
  const buildSide = (sign: 1 | -1) => {
    const s = sign;
    const armOuterX = cx + s * (shoulderW + armGap + upperArmW);
    const armInnerX = cx + s * (shoulderW + armGap);
    const elbowOuterX = cx + s * (waistW + armGap + 6 + upperArmW);
    const elbowInnerX = cx + s * (waistW + armGap + 6);
    const wristOuterX = cx + s * (waistW + armGap + 4 + forearmW);
    const wristInnerX = cx + s * (waistW + armGap + 4);

    return `
      M ${cx + s * 4} ${neckY}
      Q ${cx + s * shoulderW * 0.5} ${neckY - 2} ${cx + s * shoulderW} ${shoulderY}
      L ${cx + s * (shoulderW + armGap)} ${shoulderY}
      Q ${armInnerX + s * 2} ${(shoulderY + elbowY) / 2} ${elbowInnerX} ${elbowY}
      Q ${elbowInnerX - s * 1} ${(elbowY + wristY) / 2} ${wristInnerX} ${wristY}
      L ${wristOuterX} ${wristY}
      Q ${elbowOuterX + s * 1} ${(elbowY + wristY) / 2} ${elbowOuterX} ${elbowY}
      Q ${armOuterX - s * 2} ${(shoulderY + elbowY) / 2} ${armOuterX} ${shoulderY}
      L ${cx + s * shoulderW} ${shoulderY}
      Q ${cx + s * (bustW + 2)} ${bustY - 6} ${cx + s * bustW} ${bustY}
      Q ${cx + s * (waistW - 2)} ${(bustY + waistY) / 2} ${cx + s * waistW} ${waistY}
      Q ${cx + s * (hipW + 2)} ${(waistY + hipY) / 2} ${cx + s * hipW} ${hipY}
      Q ${cx + s * (hipW - 1)} ${(hipY + crotchY) / 2} ${cx + s * thighW + s * 6} ${crotchY}
      L ${cx + s * thighW} ${crotchY + 4}
      Q ${cx + s * (thighW + 1)} ${(crotchY + kneeY) / 2} ${cx + s * kneeW} ${kneeY}
      Q ${cx + s * (ankleW + 1)} ${(kneeY + ankleY) / 2} ${cx + s * ankleW} ${ankleY}
      L ${cx + s * (ankleW + 4)} ${footY}
      L ${cx + s * 3} ${footY}
      L ${cx + s * 3} ${ankleY}
      Q ${cx + s * 2} ${(kneeY + ankleY) / 2} ${cx + s * kneeW * 0.3} ${kneeY}
      Q ${cx + s * 3} ${(crotchY + kneeY) / 2} ${cx + s * 4} ${crotchY + 4}
    `;
  };

  // Full body outline: left side down, cross crotch, right side up
  const outline = `
    M ${cx} ${headTop + headR * 2 + 2}
    ${buildSide(1)}
    L ${cx + 3} ${crotchY + 4}
    L ${cx - 3} ${crotchY + 4}
    ${buildSide(-1)}
    Z
  `;

  return (
    <div className="flex flex-col items-center pt-2 pb-1">
      <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Your proportions</p>
      <svg
        viewBox={`0 0 ${svgW} ${totalH + 10}`}
        className="w-40 max-h-[320px]"
        style={{ filter: "drop-shadow(0 2px 8px hsl(var(--primary) / 0.15))" }}
      >
        {/* Head */}
        <ellipse
          cx={cx}
          cy={headTop + headR}
          rx={headR * 0.82}
          ry={headR}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.8"
          opacity={0.7}
        />
        {/* Body outline */}
        <path
          d={outline}
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary))"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Measurement guide lines */}
        {bust > 0 && (
          <line
            x1={cx - bustW - 6} y1={bustY}
            x2={cx + bustW + 6} y2={bustY}
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            strokeDasharray="3,3"
            opacity={0.35}
          />
        )}
        {waist > 0 && (
          <line
            x1={cx - waistW - 6} y1={waistY}
            x2={cx + waistW + 6} y2={waistY}
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            strokeDasharray="3,3"
            opacity={0.35}
          />
        )}
        {hips > 0 && (
          <line
            x1={cx - hipW - 6} y1={hipY}
            x2={cx + hipW + 6} y2={hipY}
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            strokeDasharray="3,3"
            opacity={0.35}
          />
        )}
      </svg>
    </div>
  );
}

// ── Muscle groups and their SVG region IDs ──
export type MuscleGroup =
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms"
  | "upper-back" | "lats" | "lower-back"
  | "core" | "obliques"
  | "glutes" | "quads" | "hamstrings" | "calves" | "hip-flexors" | "adductors";

interface MuscleInfo {
  label: string;
  intensity: "primary" | "secondary" | "light";
}

// Map exercise names → muscle groups
const EXERCISE_MUSCLES: Record<string, MuscleGroup[]> = {
  // Compound
  "Dumbbell Deadlift": ["hamstrings", "glutes", "lower-back", "core"],
  "Romanian Deadlift": ["hamstrings", "glutes", "lower-back"],
  "Single-Leg Romanian Deadlift": ["hamstrings", "glutes", "lower-back", "core"],
  "Single-Leg Deadlift": ["hamstrings", "glutes", "lower-back"],
  "Sumo Deadlift": ["hamstrings", "glutes", "adductors", "quads"],
  "Good Morning": ["hamstrings", "lower-back", "glutes"],
  // Squat patterns
  "Goblet Squat": ["quads", "glutes", "core"],
  "Goblet Squat To Press": ["quads", "glutes", "shoulders", "core"],
  "Sumo Squat": ["quads", "glutes", "adductors"],
  "Squat Pulse": ["quads", "glutes"],
  "Suitcase Carry Squat": ["quads", "glutes", "core", "obliques"],
  "Split Squat": ["quads", "glutes", "hip-flexors"],
  "Rear Foot Elevated Split Squat": ["quads", "glutes", "hip-flexors"],
  // Lunges
  "Reverse Lunge To Bicep Curl": ["quads", "glutes", "biceps"],
  "Reverse Lunge Alternating": ["quads", "glutes"],
  "Lateral Lunge To Lateral Raise": ["quads", "adductors", "shoulders"],
  "Walking Lunge": ["quads", "glutes", "hamstrings"],
  // Push
  "Push-Up To Downward Dog": ["chest", "shoulders", "triceps", "core"],
  "Push-Up Full Or Modified": ["chest", "shoulders", "triceps"],
  "Pike Push-Up": ["shoulders", "triceps"],
  "Single-Arm Push-Up Prep": ["chest", "triceps", "core"],
  "Chest Press On Mat": ["chest", "triceps", "shoulders"],
  "Chest Fly On Mat": ["chest", "shoulders"],
  "Single-Arm Chest Fly On Mat": ["chest", "core"],
  "Arnold Press": ["shoulders", "triceps"],
  "Single-Arm Overhead Press": ["shoulders", "triceps", "core"],
  "Lateral Raise": ["shoulders"],
  "Rear Delt Fly": ["shoulders", "upper-back"],
  "Upright Row": ["shoulders", "upper-back"],
  "Band Pull-Apart": ["shoulders", "upper-back"],
  "Face Pull With Band": ["shoulders", "upper-back"],
  "Tricep Overhead Extension": ["triceps"],
  "Tricep Kickback": ["triceps"],
  // Pull
  "Single-Arm Dumbbell Row": ["lats", "biceps", "upper-back"],
  "Single-Arm Row To Rotation": ["lats", "obliques", "upper-back"],
  "Bent-Over Row Bilateral": ["lats", "upper-back", "biceps"],
  "Underhand Row Supinated Grip": ["lats", "biceps"],
  "Renegade Row": ["lats", "core", "chest"],
  "Bird Dog Row": ["lats", "core", "glutes"],
  "Single-Arm Row In Side Plank": ["lats", "obliques", "core"],
  "Bicep Curl": ["biceps"],
  "Hammer Curl": ["biceps", "forearms"],
  // Glutes & legs accessory
  "Glute Bridge With Band": ["glutes", "hamstrings"],
  "Hip Thrust With Dumbbell": ["glutes", "hamstrings"],
  "Single-Leg Hip Thrust": ["glutes", "hamstrings", "core"],
  "Bridge Pulse": ["glutes"],
  "Frog Bridge": ["glutes", "adductors"],
  "Donkey Kicks With Band": ["glutes"],
  "Fire Hydrant Pulse": ["glutes", "hip-flexors"],
  "Lateral Band Walk": ["glutes", "hip-flexors"],
  "Side-Lying Leg Raise": ["glutes", "hip-flexors"],
  "Calf Raise": ["calves"],
  "Wall Sit": ["quads", "glutes"],
  "Step Up With Dumbbell": ["quads", "glutes"],
  // Core
  "Dead Bug": ["core", "hip-flexors"],
  "Dead Bug With Dumbbell Press": ["core", "chest"],
  "Plank To Push-Up": ["core", "chest", "triceps"],
  "Plank Shoulder Taps": ["core", "shoulders"],
  "Bear Hold": ["core", "shoulders"],
  "Hollow Body Hold": ["core"],
  "Superman Hold": ["lower-back", "glutes"],
  "Half-Kneeling Chop": ["core", "obliques"],
  "Mountain Climbers": ["core", "hip-flexors", "shoulders"],
  "Inchworm": ["core", "hamstrings", "shoulders"],
  "Thoracic Rotation Half-Kneeling": ["core", "obliques"],
};

function getMusclesFromWorkout(workout: Workout): Map<MuscleGroup, MuscleInfo> {
  const counts = new Map<MuscleGroup, number>();
  for (const ex of workout.exercises) {
    const muscles = EXERCISE_MUSCLES[ex.name] || [];
    muscles.forEach((m, i) => {
      const weight = i === 0 ? 3 : i === 1 ? 2 : 1;
      counts.set(m, (counts.get(m) || 0) + weight);
    });
  }
  const result = new Map<MuscleGroup, MuscleInfo>();
  const max = Math.max(...counts.values(), 1);
  for (const [muscle, count] of counts) {
    const ratio = count / max;
    result.set(muscle, {
      label: muscle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      intensity: ratio > 0.5 ? "primary" : ratio > 0.25 ? "secondary" : "light",
    });
  }
  return result;
}

const PHASE_COLOR: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const INTENSITY_OPACITY: Record<string, number> = {
  primary: 0.85,
  secondary: 0.5,
  light: 0.25,
};

// SVG body front regions (simplified anatomical paths)
const FRONT_REGIONS: Record<MuscleGroup, string> = {
  // Head/neck area omitted
  chest: "M 85,95 Q 100,88 115,95 L 115,115 Q 100,120 85,115 Z",
  shoulders: "M 70,85 Q 80,78 88,88 L 85,100 Q 77,95 70,100 Z M 130,85 Q 120,78 112,88 L 115,100 Q 123,95 130,100 Z",
  biceps: "M 68,102 L 72,100 L 76,130 L 68,130 Z M 132,102 L 128,100 L 124,130 L 132,130 Z",
  triceps: "M 62,102 L 68,102 L 68,130 L 62,128 Z M 138,102 L 132,102 L 132,130 L 138,128 Z",
  forearms: "M 60,132 L 68,132 L 65,160 L 58,158 Z M 140,132 L 132,132 L 135,160 L 142,158 Z",
  core: "M 88,118 L 112,118 L 110,155 Q 100,158 90,155 Z",
  obliques: "M 80,118 L 88,118 L 90,150 L 82,145 Z M 120,118 L 112,118 L 110,150 L 118,145 Z",
  "hip-flexors": "M 85,155 L 95,155 L 93,170 L 83,170 Z M 115,155 L 105,155 L 107,170 L 117,170 Z",
  quads: "M 82,170 L 98,170 L 96,215 L 84,215 Z M 118,170 L 102,170 L 104,215 L 116,215 Z",
  adductors: "M 96,170 L 104,170 L 103,210 L 97,210 Z",
  calves: "M 84,222 L 96,222 L 94,260 L 86,260 Z M 116,222 L 104,222 L 106,260 L 114,260 Z",
  // Back muscles shown faintly on front view
  "upper-back": "",
  lats: "",
  "lower-back": "",
  glutes: "",
  hamstrings: "",
};

const BACK_REGIONS: Record<MuscleGroup, string> = {
  "upper-back": "M 85,90 L 115,90 L 112,110 Q 100,108 88,110 Z",
  lats: "M 78,105 L 88,110 L 90,140 L 80,135 Z M 122,105 L 112,110 L 110,140 L 120,135 Z",
  "lower-back": "M 90,140 L 110,140 L 108,160 Q 100,162 92,160 Z",
  shoulders: "M 70,85 Q 80,78 88,88 L 85,100 Q 77,95 70,100 Z M 130,85 Q 120,78 112,88 L 115,100 Q 123,95 130,100 Z",
  triceps: "M 62,102 L 68,102 L 68,130 L 62,128 Z M 138,102 L 132,102 L 132,130 L 138,128 Z",
  glutes: "M 82,158 L 100,158 L 100,185 Q 90,188 82,182 Z M 118,158 L 100,158 L 100,185 Q 110,188 118,182 Z",
  hamstrings: "M 82,188 L 98,188 L 96,230 L 84,230 Z M 118,188 L 102,188 L 104,230 L 116,230 Z",
  calves: "M 84,232 L 96,232 L 94,265 L 86,265 Z M 116,232 L 104,232 L 106,265 L 114,265 Z",
  // Not visible from back
  chest: "", biceps: "", forearms: "", core: "", obliques: "",
  "hip-flexors": "", quads: "", adductors: "",
};

function BodySVG({
  regions,
  muscleMap,
  color,
}: {
  regions: Record<MuscleGroup, string>;
  muscleMap: Map<MuscleGroup, MuscleInfo>;
  color: string;
}) {
  return (
    <svg viewBox="30 60 140 220" className="w-full h-full max-h-[400px]">
      {/* Body outline */}
      <g fill="none" stroke="hsl(var(--border))" strokeWidth="1.2" opacity={0.5}>
        {/* Head */}
        <circle cx="100" cy="72" r="12" />
        {/* Torso */}
        <path d="M 78,85 Q 68,90 62,100 L 58,158 Q 80,168 100,170 Q 120,168 142,158 L 138,100 Q 132,90 122,85 Q 100,78 78,85" />
        {/* Arms */}
        <path d="M 68,100 Q 60,120 58,140 Q 55,155 50,168" />
        <path d="M 132,100 Q 140,120 142,140 Q 145,155 150,168" />
        {/* Legs */}
        <path d="M 85,168 Q 82,200 84,230 Q 85,250 86,268" />
        <path d="M 115,168 Q 118,200 116,230 Q 115,250 114,268" />
        <path d="M 95,168 Q 96,200 96,230 Q 96,250 96,268" />
        <path d="M 105,168 Q 104,200 104,230 Q 104,250 104,268" />
      </g>

      {/* Muscle fills */}
      {(Object.keys(regions) as MuscleGroup[]).map((muscle) => {
        const path = regions[muscle];
        if (!path) return null;
        const info = muscleMap.get(muscle);
        if (!info) return null;
        return (
          <motion.path
            key={muscle}
            d={path}
            fill={color}
            fillOpacity={INTENSITY_OPACITY[info.intensity]}
            stroke={color}
            strokeWidth={0.5}
            strokeOpacity={0.3}
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: INTENSITY_OPACITY[info.intensity] }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        );
      })}
    </svg>
  );
}

export default function BodyVisualiser() {
  const info = getCycleInfo(getLastPeriodStart());
  const [view, setView] = useState<"front" | "back">("front");
  const phaseWorkouts = PHASE_WORKOUTS[info.phase];
  const todayId = TODAY_WORKOUT[info.phase];
  const todayWorkout = phaseWorkouts.find(w => w.id === todayId) || phaseWorkouts[0];
  const [selectedWorkout, setSelectedWorkout] = useState(todayWorkout);
  const color = PHASE_COLOR[info.phase];

  const muscleMap = useMemo(() => getMusclesFromWorkout(selectedWorkout), [selectedWorkout]);

  const primaryMuscles = [...muscleMap.entries()].filter(([, v]) => v.intensity === "primary");
  const secondaryMuscles = [...muscleMap.entries()].filter(([, v]) => v.intensity === "secondary");

  return (
    <div className="space-y-6">
      {/* Measurements form */}
      <MeasurementsForm />

      {/* Progress photos */}
      <ProgressPhotos />

      {/* Workout selector */}
      <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
        {phaseWorkouts.filter(w => w.exercises.length > 0).map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWorkout(w)}
            className={`scroll-snap-item flex-shrink-0 rounded-xl px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${
              selectedWorkout.id === w.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {w.name}
          </button>
        ))}
      </div>

      {/* Body map */}
      <div className="card-warm p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-foreground">{selectedWorkout.name}</h3>
          <div className="flex rounded-full bg-secondary p-0.5">
            {(["front", "back"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-all ${
                  view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-1/2 flex-shrink-0">
            <BodySVG
              regions={view === "front" ? FRONT_REGIONS : BACK_REGIONS}
              muscleMap={muscleMap}
              color={color}
            />
          </div>

          <div className="flex-1 space-y-4 pt-4">
            {primaryMuscles.length > 0 && (
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Primary</p>
                <div className="flex flex-wrap gap-1.5">
                  {primaryMuscles.map(([muscle, info]) => (
                    <span
                      key={muscle}
                      className="rounded-full px-2.5 py-1 font-body text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {info.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {secondaryMuscles.length > 0 && (
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Secondary</p>
                <div className="flex flex-wrap gap-1.5">
                  {secondaryMuscles.map(([muscle, info]) => (
                    <span
                      key={muscle}
                      className="rounded-full px-2.5 py-1 font-body text-xs font-medium border"
                      style={{ borderColor: color, color }}
                    >
                      {info.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1 pt-2">
              <p className="font-mono text-xs text-foreground">{selectedWorkout.duration}</p>
              <p className="font-body text-xs text-muted-foreground">{selectedWorkout.equipment}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        {[
          { label: "Primary", opacity: 0.85 },
          { label: "Secondary", opacity: 0.5 },
          { label: "Light", opacity: 0.25 },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color, opacity: l.opacity }} />
            <span className="font-body text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
