import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ALL_MUSCLES = [
  "CHEST", "ABS", "OBLIQUES", "QUADRICEPS", "BICEPS", "TRICEPS",
  "SHOULDERS", "UPPER_BACK", "LOWER_BACK", "GLUTES", "HAMSTRINGS", "CALVES",
] as const;

function buildHeatmapParams(gender: string, waist: number, bodyFat: number) {
  const warmZone = new Set<string>();
  const waistThreshold = gender === "female" ? 88 : 102;
  if (waist > waistThreshold) { warmZone.add("OBLIQUES"); warmZone.add("ABS"); }
  if (bodyFat > 30) { warmZone.add("CHEST"); warmZone.add("UPPER_BACK"); }
  if (bodyFat > 35) { warmZone.add("QUADRICEPS"); warmZone.add("GLUTES"); }

  const muscles = ALL_MUSCLES.join(",");
  const colors = ALL_MUSCLES.map((m) => warmZone.has(m) ? "#E74C3C" : "#A8D8A8").join(",");
  return { muscles, colors, gender, background: "transparent", size: "small", format: "jpeg" };
}

function parseNumeric(val: string | null | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? undefined : n;
}

function MuscleHeatmap({ gender, waist, bodyFat }: { gender: string; waist: number; bodyFat: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!waist && !bodyFat) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    const params = buildHeatmapParams(gender, waist, bodyFat);
    supabase.functions.invoke("muscle-visualize", { body: params }).then(({ data, error: fnError }) => {
      if (cancelled) return;
      if (fnError) { setError(true); setLoading(false); return; }
      const blob = data instanceof Blob ? data : new Blob([data]);
      setImageUrl(URL.createObjectURL(blob));
      setLoading(false);
    }).catch(() => { if (!cancelled) { setError(true); setLoading(false); } });

    return () => { cancelled = true; };
  }, [gender, waist, bodyFat]);

  if (!waist && !bodyFat) return null;

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
      {loading ? (
        <Skeleton className="w-[200px] h-[280px] rounded-2xl animate-pulse" />
      ) : error ? (
        <div className="w-[200px] h-[280px] rounded-2xl bg-muted flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center px-4">Heatmap unavailable</p>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Body composition heatmap" className="max-h-[300px] object-contain rounded-xl" />
      ) : null}
    </div>
  );
}

const UNIT_SETS = {
  weight: ["kg", "lbs"] as const,
  height: ["cm", "ft/in"] as const,
  measurement: ["cm", "in"] as const,
};

function UnitToggle({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
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

function InputRow({ label, value, onChange, placeholder = "—", optional = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground min-w-[90px]">
        {label}
        {optional && <span className="ml-1 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">optional</span>}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-28 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

interface HistoryRow {
  id: string;
  recorded_at: string;
  weight: string | null;
  waist: string | null;
  body_fat: string | null;
}

export default function BodyVisualisationCard() {
  const [latestMeasurement, setLatestMeasurement] = useState<any>(null);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [measureUnit, setMeasureUnit] = useState("cm");

  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [thighs, setThighs] = useState("");
  const [arms, setArms] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistoryData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(5);
    if (data && data.length > 0) {
      setHistory(data);
      setLatestMeasurement(data[0]);
    }
  }, []);

  useEffect(() => { loadHistoryData(); }, [loadHistoryData]);

  // Derive waist/bodyFat in cm/% for heatmap
  const waistCm = measureUnit === "in" ? (Number(waist) || 0) * 2.54 : Number(waist) || parseNumeric(latestMeasurement?.waist) || 0;
  const bodyFatNum = Number(bodyFat) || parseNumeric(latestMeasurement?.body_fat) || 0;
  const gender = (() => { try { return localStorage.getItem("signal_user_gender") || "female"; } catch { return "female"; } })();

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const heightVal =
      heightUnit === "cm"
        ? heightCm ? `${heightCm} cm` : null
        : heightFt || heightIn ? `${heightFt || 0}ft ${heightIn || 0}in` : null;

    const row = {
      user_id: user.id,
      weight: weight ? `${weight} ${weightUnit}` : null,
      height: heightVal,
      chest: chest ? `${chest} ${measureUnit}` : null,
      waist: waist ? `${waist} ${measureUnit}` : null,
      hips: hips ? `${hips} ${measureUnit}` : null,
      thighs: thighs ? `${thighs} ${measureUnit}` : null,
      arms: arms ? `${arms} ${measureUnit}` : null,
      body_fat: bodyFat ? `${bodyFat}%` : null,
    };

    setSaving(true);
    const { error } = await supabase.from("body_measurements").insert(row);
    setSaving(false);

    if (error) {
      toast.error("Couldn't save measurements — please try again.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setWeight(""); setHeightCm(""); setHeightFt(""); setHeightIn("");
    setChest(""); setWaist(""); setHips(""); setThighs(""); setArms(""); setBodyFat("");
    loadHistoryData();
  }

  return (
    <div className="space-y-4">
      {/* ── Muscle Heatmap from API ── */}
      <MuscleHeatmap gender={gender} waist={waistCm} bodyFat={bodyFatNum} />

      {/* ── Measurement Form ── */}
      <div className="card-warm rounded-2xl p-5 space-y-4 max-w-md mx-auto">
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">Body Measurements</h2>
          <p className="text-xs text-muted-foreground mt-1">Enter measurements to generate a muscle heatmap</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-[90px]">
              <span className="text-sm text-muted-foreground">Weight</span>
              <UnitToggle options={UNIT_SETS.weight} value={weightUnit} onChange={setWeightUnit} />
            </div>
            <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="—"
              className="w-28 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-[90px]">
              <span className="text-sm text-muted-foreground">Height</span>
              <UnitToggle options={UNIT_SETS.height} value={heightUnit} onChange={setHeightUnit} />
            </div>
            {heightUnit === "cm" ? (
              <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="cm"
                className="w-28 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
            ) : (
              <div className="flex gap-1">
                <input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft"
                  className="w-14 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
                <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="in"
                  className="w-12 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground placeholder-muted-foreground/40 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Measurements</span>
            <UnitToggle options={UNIT_SETS.measurement} value={measureUnit} onChange={setMeasureUnit} />
          </div>

          <InputRow label="Chest" value={chest} onChange={setChest} placeholder={measureUnit} />
          <InputRow label="Waist" value={waist} onChange={setWaist} placeholder={measureUnit} />
          <InputRow label="Hips" value={hips} onChange={setHips} placeholder={measureUnit} />
          <InputRow label="Thighs" value={thighs} onChange={setThighs} placeholder={measureUnit} />
          <InputRow label="Arms" value={arms} onChange={setArms} placeholder={measureUnit} />
          <InputRow label="Body fat %" value={bodyFat} onChange={setBodyFat} placeholder="%" optional />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-soft disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
          ) : saved ? (
            "✓ Saved!"
          ) : (
            <><Activity className="h-4 w-4" />Save My Measurements</>
          )}
        </button>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-display text-sm font-semibold text-foreground">Recent Entries</h3>
          {history.map((row) => (
            <div key={row.id} className="rounded-xl bg-card border border-border p-3 flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground">
                {new Date(row.recorded_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <div className="flex gap-3 font-body text-xs text-foreground">
                {row.weight && <span>{row.weight}</span>}
                {row.waist && <span>W: {row.waist}</span>}
                {row.body_fat && <span>BF: {row.body_fat}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
