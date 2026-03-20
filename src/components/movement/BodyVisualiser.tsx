import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Ruler } from "lucide-react";
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

function MeasurementsForm() {
  const [measurements, setMeasurements] = useState<Measurements>(loadMeasurements);
  const [saved, setSaved] = useState(false);

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
    <div className="space-y-5">
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
