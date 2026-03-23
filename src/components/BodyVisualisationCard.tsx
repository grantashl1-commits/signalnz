import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Body3DViewer = lazy(() => import("@/components/movement/Body3DViewer"));

const UNIT_SETS = {
  weight: ["kg", "lbs"] as const,
  height: ["cm", "ft/in"] as const,
  measurement: ["cm", "in"] as const,
};

function UnitToggle({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 p-0.5 gap-0.5 ml-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            value === opt
              ? "bg-white text-purple-900 shadow"
              : "text-white/60 hover:text-white"
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
      <span className="text-sm text-white/70 min-w-[90px]">
        {label}
        {optional && (
          <span className="ml-1 text-[10px] uppercase tracking-widest text-white/30 font-semibold">
            optional
          </span>
        )}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 text-right focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
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

  const loadHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("body_measurements")
      .select("id, recorded_at, weight, waist, body_fat")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(5);
    if (data) setHistory(data);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

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
      console.error("Save error:", error);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setWeight(""); setHeightCm(""); setHeightFt(""); setHeightIn("");
    setChest(""); setWaist(""); setHips(""); setThighs(""); setArms(""); setBodyFat("");
    loadHistory();
  }

  return (
    <div className="space-y-4">
      {/* ── Card ── */}
      <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d1050] to-[#0d0d1a]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(170,59,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(170,59,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">3D Body Visualisation</h2>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Enter your measurements to build<br />your personalised avatar.
              </p>
            </div>
            <div className="relative flex-shrink-0 w-16 h-20 ml-3">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-14 opacity-60">
                  <ellipse cx="20" cy="8" rx="6" ry="6.5" fill="white" />
                  <path d="M10 22C10 17 14 14 20 14C26 14 30 17 30 22V38H10V22Z" fill="white" />
                  <rect x="4" y="22" width="7" height="18" rx="3.5" fill="white" />
                  <rect x="29" y="22" width="7" height="18" rx="3.5" fill="white" />
                  <path d="M10 38L8 60H18L20 46L22 60H32L30 38H10Z" fill="white" />
                </svg>
                <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(170,59,255,0.07) 3px, rgba(170,59,255,0.07) 4px)" }} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-5" />

          <div className="space-y-3">
            {/* Weight */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center min-w-[90px]">
                <span className="text-sm text-white/70">Weight</span>
                <UnitToggle options={UNIT_SETS.weight} value={weightUnit} onChange={setWeightUnit} />
              </div>
              <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="—"
                className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 text-right focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all" />
            </div>

            {/* Height */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center min-w-[90px]">
                <span className="text-sm text-white/70">Height</span>
                <UnitToggle options={UNIT_SETS.height} value={heightUnit} onChange={setHeightUnit} />
              </div>
              {heightUnit === "cm" ? (
                <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="cm"
                  className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 text-right focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all" />
              ) : (
                <div className="flex gap-1">
                  <input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft"
                    className="w-14 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 text-right focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all" />
                  <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="in"
                    className="w-12 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white placeholder-white/30 text-right focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all" />
                </div>
              )}
            </div>

            {/* Measurements label */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Measurements</span>
              <UnitToggle options={UNIT_SETS.measurement} value={measureUnit} onChange={setMeasureUnit} />
            </div>

            <InputRow label="Chest" value={chest} onChange={setChest} placeholder={measureUnit} />
            <InputRow label="Waist" value={waist} onChange={setWaist} placeholder={measureUnit} />
            <InputRow label="Hips" value={hips} onChange={setHips} placeholder={measureUnit} />
            <InputRow label="Thighs" value={thighs} onChange={setThighs} placeholder={measureUnit} />
            <InputRow label="Arms" value={arms} onChange={setArms} placeholder={measureUnit} />
            <InputRow label="Body fat %" value={bodyFat} onChange={setBodyFat} placeholder="%" optional />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-5" />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Save My Measurements
              </>
            )}
          </button>
        </div>
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
              <div className="flex gap-3 font-mono text-xs text-foreground">
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
