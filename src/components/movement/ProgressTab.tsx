import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, X, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  saveMeasurements, getLatestMeasurements, getFirstMeasurements,
  getMeasurementDates, getMeasurements, type BodyMeasurements,
} from "@/data/workouts";
import { haptic } from "@/hooks/use-mobile";

export default function ProgressTab() {
  const [subTab, setSubTab] = useState<"measurements" | "photos" | "silhouette">("measurements");
  const todayStr = new Date().toISOString().split("T")[0];
  const latest = getLatestMeasurements();
  const first = getFirstMeasurements();

  const [height, setHeight] = useState(latest?.height || 165);
  const [weight, setWeight] = useState(latest?.weight || 60);
  const [chest, setChest] = useState(latest?.chest || 0);
  const [waist, setWaist] = useState(latest?.waist || 0);
  const [hips, setHips] = useState(latest?.hips || 0);
  const [upperArm, setUpperArm] = useState(latest?.upperArm || 0);
  const [thigh, setThigh] = useState(latest?.thigh || 0);
  const [saved, setSaved] = useState(false);

  const [photos, setPhotos] = useState<{ front?: string; side?: string; back?: string }>({});

  const handleSave = () => {
    haptic("medium");
    saveMeasurements({ date: todayStr, height, weight, chest, waist, hips, upperArm, thigh });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoUpload = (view: "front" | "side" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos(prev => ({ ...prev, [view]: reader.result as string }));
      // Save to localStorage
      localStorage.setItem(`progressPhoto:${view}:${todayStr}`, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Weight history for chart
  const dates = getMeasurementDates();
  const weightHistory = dates.map(d => {
    const m = getMeasurements(d);
    return { date: d.slice(5), weight: m?.weight || 0 };
  }).filter(d => d.weight > 0);

  // Change calculations
  const weightChange = first && latest && first.weight && latest.weight ? latest.weight - first.weight : null;
  const waistChange = first && latest && first.waist && latest.waist ? latest.waist - first.waist : null;

  const SUB_TABS = [
    { id: "measurements" as const, label: "Measurements" },
    { id: "photos" as const, label: "Photos" },
    { id: "silhouette" as const, label: "Silhouette" },
  ];

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex gap-1 rounded-full bg-secondary/60 p-0.5">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { haptic("light"); setSubTab(tab.id); }}
            className={`touch-tab flex-1 rounded-full px-2 py-2 min-h-[38px] font-body text-[10px] font-medium transition-all ${
              subTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {subTab === "measurements" && (
        <div className="space-y-4">
          {/* Input fields */}
          {[
            { label: "Height", value: height, set: setHeight, unit: "cm", once: true },
            { label: "Weight", value: weight, set: setWeight, unit: "kg" },
            { label: "Chest", value: chest, set: setChest, unit: "cm" },
            { label: "Waist", value: waist, set: setWaist, unit: "cm" },
            { label: "Hips", value: hips, set: setHips, unit: "cm" },
            { label: "Upper Arm", value: upperArm, set: setUpperArm, unit: "cm" },
            { label: "Thigh", value: thigh, set: setThigh, unit: "cm" },
          ].map(field => (
            <div key={field.label} className="card-warm p-3 flex items-center justify-between">
              <span className="font-body text-sm text-foreground">{field.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => field.set(v => Math.max(0, v - 0.5))} className="touch-btn h-8 w-8 rounded-full bg-secondary font-mono text-sm">−</button>
                <span className="font-mono text-lg text-foreground w-14 text-center">{field.value}</span>
                <button onClick={() => field.set(v => v + 0.5)} className="touch-btn h-8 w-8 rounded-full bg-secondary font-mono text-sm">+</button>
                <span className="font-mono text-[10px] text-muted-foreground w-6">{field.unit}</span>
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="touch-btn w-full rounded-[14px] py-3 min-h-[48px] font-body text-sm font-bold text-primary-foreground bg-primary"
          >
            {saved ? "Saved ✓" : "Save measurements →"}
          </button>

          {/* Changes */}
          {(weightChange !== null || waistChange !== null) && dates.length >= 2 && (
            <div className="card-warm p-4 space-y-1">
              {weightChange !== null && (
                <p className={`font-hand text-sm ${weightChange <= 0 ? "text-sage-mist" : "text-primary"}`}>
                  Weight: {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)}kg since {dates[0]}.
                </p>
              )}
              {waistChange !== null && waistChange !== 0 && (
                <p className={`font-hand text-sm ${waistChange <= 0 ? "text-sage-mist" : "text-primary"}`}>
                  Waist: {waistChange > 0 ? "+" : ""}{waistChange.toFixed(1)}cm since {dates[0]}.
                </p>
              )}
            </div>
          )}

          {/* Weight chart */}
          {weightHistory.length >= 2 && (
            <div className="card-warm p-4">
              <p className="font-hand text-sm font-bold text-primary mb-2">Weight over time</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightHistory}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" />
                    <YAxis tick={{ fontSize: 9, fontFamily: "Space Mono" }} stroke="hsl(var(--border))" width={35} domain={["dataMin - 2", "dataMax + 2"]} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === "photos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(["front", "side", "back"] as const).map(view => (
              <label key={view} className="cursor-pointer">
                <div className="aspect-[7/9] rounded-2xl border-2 border-dashed border-sketch/30 flex flex-col items-center justify-center bg-secondary/30 overflow-hidden relative">
                  {photos[view] ? (
                    <img src={photos[view]} alt={view} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-muted-foreground/40 mb-1" />
                      <span className="font-hand text-[10px] text-muted-foreground capitalize">{view}</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoUpload(view, e)} />
              </label>
            ))}
          </div>
          <p className="font-body text-[10px] italic text-muted-foreground text-center">
            Your photos are stored only on this device. They are never uploaded or shared.
          </p>
        </div>
      )}

      {subTab === "silhouette" && (
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            {[
              { label: first ? "When I started" : "Current", measurements: first || latest },
              ...(first && latest ? [{ label: "Now", measurements: latest }] : []),
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="font-hand text-xs text-muted-foreground mb-2">{item.label}</p>
                {item.measurements ? (
                  <BodySilhouette measurements={item.measurements} />
                ) : (
                  <div className="w-24 h-40 rounded-xl bg-secondary/40 flex items-center justify-center">
                    <span className="font-hand text-xs text-muted-foreground">No data</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {first && latest && latest.waist && first.waist && (
            <p className={`font-hand text-sm text-center ${
              Math.abs(latest.waist - first.waist) > 2 ? "text-sage-mist" : "text-muted-foreground"
            }`}>
              {Math.abs(latest.waist - first.waist) > 2
                ? "Your shape is shifting. This is working."
                : "Changes are often subtle. Keep going."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Parametric body silhouette
function BodySilhouette({ measurements }: { measurements: BodyMeasurements }) {
  const baseW = 100;
  const baseH = 180;
  const shoulderScale = measurements.chest ? (measurements.chest / 90) : 1;
  const waistScale = measurements.waist ? (measurements.waist / 70) : 1;
  const hipScale = measurements.hips ? (measurements.hips / 95) : 1;
  const thighScale = measurements.thigh ? (measurements.thigh / 55) : 1;

  const cx = baseW / 2;

  return (
    <svg width={100} height={160} viewBox={`0 0 ${baseW} ${baseH}`} className="mx-auto">
      {/* Background */}
      <rect width={baseW} height={baseH} rx={12} fill="hsl(340 74% 80% / 0.08)" />
      {/* Head */}
      <ellipse cx={cx} cy={22} rx={10} ry={12} fill="hsl(36 47% 95%)" stroke="#8B6F5E" strokeWidth={1.5} />
      {/* Neck */}
      <line x1={cx - 3} y1={34} x2={cx - 3} y2={42} stroke="#8B6F5E" strokeWidth={1.5} />
      <line x1={cx + 3} y1={34} x2={cx + 3} y2={42} stroke="#8B6F5E" strokeWidth={1.5} />
      {/* Body path */}
      <path
        d={`
          M ${cx - 18 * shoulderScale} 42
          Q ${cx - 20 * shoulderScale} 50, ${cx - 16 * waistScale} 75
          Q ${cx - 14 * waistScale} 82, ${cx - 20 * hipScale} 95
          Q ${cx - 18 * hipScale} 105, ${cx - 12 * thighScale} 120
          L ${cx - 10 * thighScale} 155
          L ${cx - 5} 160
          L ${cx + 5} 160
          L ${cx + 10 * thighScale} 155
          L ${cx + 12 * thighScale} 120
          Q ${cx + 18 * hipScale} 105, ${cx + 20 * hipScale} 95
          Q ${cx + 14 * waistScale} 82, ${cx + 16 * waistScale} 75
          Q ${cx + 20 * shoulderScale} 50, ${cx + 18 * shoulderScale} 42
          Z
        `}
        fill="hsl(36 47% 95%)"
        stroke="#8B6F5E"
        strokeWidth={1.5}
      />
      {/* Arms */}
      <path d={`M ${cx - 18 * shoulderScale} 44 Q ${cx - 28} 70, ${cx - 22} 100`} fill="none" stroke="#8B6F5E" strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M ${cx + 18 * shoulderScale} 44 Q ${cx + 28} 70, ${cx + 22} 100`} fill="none" stroke="#8B6F5E" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
