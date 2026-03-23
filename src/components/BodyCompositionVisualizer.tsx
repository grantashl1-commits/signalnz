// MUSCLE_API_KEY is stored as a runtime secret and proxied via edge function
// Free key at: https://rapidapi.com/ascendapi/api/muscle-visualizer-api

import { useState, useCallback } from "react";
import { Settings, Activity, Heart, Ruler } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

const ALL_MUSCLES = [
  "CHEST", "ABS", "OBLIQUES", "QUADRICEPS", "BICEPS", "TRICEPS",
  "SHOULDERS", "UPPER_BACK", "LOWER_BACK", "GLUTES", "HAMSTRINGS", "CALVES",
] as const;

type Gender = "female" | "male";

interface Stats {
  bmi: number;
  bmiCategory: string;
  bodyFat: number;
  whr: number;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function buildHeatmapParams(gender: Gender, waist: number, bodyFat: number) {
  const warmZone = new Set<string>();

  const waistThreshold = gender === "female" ? 88 : 102;
  if (waist > waistThreshold) {
    warmZone.add("OBLIQUES");
    warmZone.add("ABS");
  }
  if (bodyFat > 30) {
    warmZone.add("CHEST");
    warmZone.add("UPPER_BACK");
  }
  if (bodyFat > 35) {
    warmZone.add("QUADRICEPS");
    warmZone.add("GLUTES");
  }

  const muscles = ALL_MUSCLES.join(",");
  const colors = ALL_MUSCLES.map((m) =>
    warmZone.has(m) ? "E74C3C" : "A8D8A8"
  ).join(",");

  return { muscles, colors, gender, background: "transparent", size: "large", format: "png" };
}

function PillToggle({ options, value, onChange }: { options: [string, string]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-full bg-accent p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt.toLowerCase())}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            value === opt.toLowerCase()
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function UnitToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent p-0.5 gap-0.5 ml-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
            value === opt
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </span>
  );
}

function FormInput({ label, value, onChange, placeholder, unit }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground font-medium min-w-[70px]">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "—"}
          className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground text-right placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {unit}
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function BodyCompositionVisualizer({ defaultGender = "female" }: { defaultGender?: Gender }) {
  const [gender, setGender] = useState<Gender>(defaultGender);

  // Persist gender choice for cross-component sync
  const handleGenderChange = (v: string) => {
    const g = v as Gender;
    setGender(g);
    try { localStorage.setItem("signal_user_gender", g); } catch {}
  };
  const [heightVal, setHeightVal] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightVal, setWeightVal] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [chest, setChest] = useState("");
  const [inseam, setInseam] = useState("");
  const [bodyFat, setBodyFat] = useState(25);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVisualize = useCallback(async () => {
    if (!HAS_API_KEY) {
      setError("Body visualization unavailable — check your API key in settings");
      return;
    }

    const weightKg = weightUnit === "kg" ? Number(weightVal) : Number(weightVal) * 0.453592;
    const heightCm = heightUnit === "cm" ? Number(heightVal) : Number(heightVal) * 30.48;
    const heightM = heightCm / 100;
    const waistCm = Number(waist);
    const hipsCm = Number(hips);

    if (!weightKg || !heightM) return;

    const bmi = weightKg / (heightM * heightM);
    const whr = hipsCm > 0 ? waistCm / hipsCm : 0;

    setStats({ bmi, bmiCategory: getBmiCategory(bmi), bodyFat, whr });
    setLoading(true);
    setError(null);

    try {
      const url = buildHeatmapUrl(gender, waistCm, bodyFat);
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-host": "muscle-visualizer-api.p.rapidapi.com",
          "x-rapidapi-key": import.meta.env.VITE_MUSCLE_API_KEY,
        },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch {
      setError("Body visualization unavailable — check your API key in settings");
    } finally {
      setLoading(false);
    }
  }, [gender, heightVal, heightUnit, weightVal, weightUnit, waist, hips, bodyFat]);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* ── Left: Form ── */}
        <div className="p-6 space-y-5 border-b md:border-b-0 md:border-r border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Body Composition</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Enter your measurements to generate a heatmap</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Gender</span>
            <PillToggle options={["Female", "Male"]} value={gender} onChange={handleGenderChange} />
          </div>

          <FormInput
            label="Height"
            value={heightVal}
            onChange={setHeightVal}
            placeholder={heightUnit}
            unit={<UnitToggle options={["cm", "ft"]} value={heightUnit} onChange={setHeightUnit} />}
          />

          <FormInput
            label="Weight"
            value={weightVal}
            onChange={setWeightVal}
            placeholder={weightUnit}
            unit={<UnitToggle options={["kg", "lbs"]} value={weightUnit} onChange={setWeightUnit} />}
          />

          <FormInput label="Waist" value={waist} onChange={setWaist} placeholder="cm" />
          <FormInput label="Hips" value={hips} onChange={setHips} placeholder="cm" />
          <FormInput label="Chest" value={chest} onChange={setChest} placeholder="cm" />
          <FormInput label="Inseam" value={inseam} onChange={setInseam} placeholder="cm" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Body fat %</span>
              <span className="text-sm font-bold text-foreground">{bodyFat}%</span>
            </div>
            <Slider min={10} max={50} step={1} value={[bodyFat]} onValueChange={([v]) => setBodyFat(v)} />
          </div>

          <button
            onClick={handleVisualize}
            disabled={loading || !heightVal || !weightVal}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary-soft active:scale-[0.98] text-sm font-semibold transition-all duration-200 shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Visualize
          </button>
        </div>

        {/* ── Right: Body figure ── */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[420px] gap-4">
          {loading ? (
            <Skeleton className="w-[280px] h-[380px] rounded-2xl bg-gradient-to-b from-accent to-secondary animate-pulse" />
          ) : error ? (
            <div className="text-center space-y-2 px-4">
              <Settings className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={`${gender} body composition heatmap`}
                className="max-h-[360px] object-contain rounded-xl"
              />
              {stats && (
                <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
                  <StatBadge icon={Activity} label="BMI" value={`${stats.bmi.toFixed(1)} ${stats.bmiCategory}`} />
                  <StatBadge icon={Heart} label="Body Fat" value={`${stats.bodyFat}%`} />
                  <StatBadge icon={Ruler} label="WHR" value={stats.whr > 0 ? stats.whr.toFixed(2) : "—"} />
                </div>
              )}
            </>
          ) : (
            <div className="w-[280px] h-[380px] rounded-2xl border-2 border-dashed border-border flex items-center justify-center px-6">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Enter your measurements and tap <span className="font-semibold text-primary">Visualize</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}