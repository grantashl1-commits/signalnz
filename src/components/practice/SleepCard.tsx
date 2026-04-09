import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star } from "lucide-react";
import { useCycle } from "@/contexts/CycleContext";
import TimeDrumPicker from "./TimeDrumPicker";

interface SleepData {
  bedtime: string;
  wakeTime: string;
  quality: number;
}

function getSleepKey(date: string) {
  return `sleep_log_${date}`;
}

function getSleepData(date: string): SleepData | null {
  const val = localStorage.getItem(getSleepKey(date));
  return val ? JSON.parse(val) : null;
}

function saveSleepData(date: string, data: SleepData) {
  localStorage.setItem(getSleepKey(date), JSON.stringify(data));
}

function calcHours(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let bedMins = bh * 60 + bm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= bedMins) wakeMins += 24 * 60;
  return Math.round((wakeMins - bedMins) / 60 * 10) / 10;
}

const PHASE_SLEEP_TARGETS: Record<string, { min: number; max: number; note: string }> = {
  menstrual: { min: 8, max: 9, note: "Your body is doing real work — aim for 8–9 hours." },
  follicular: { min: 7, max: 8, note: "Energy is building — 7–8 hours is your sweet spot." },
  ovulatory: { min: 7, max: 8, note: "Peak energy — 7–8 hours keeps you balanced." },
  luteal: { min: 8, max: 9, note: "Progesterone disrupts sleep architecture — need more time in bed." },
};

interface Props {
  phaseColor: string;
}

export default function SleepCard({ phaseColor }: Props) {
  const { currentPhase } = useCycle();
  const cycleMode = localStorage.getItem("cycle_mode") || "cycling";
  const todayStr = new Date().toISOString().split("T")[0];
  const [data, setData] = useState<SleepData | null>(getSleepData(todayStr));
  const [editing, setEditing] = useState(!data);

  const target = PHASE_SLEEP_TARGETS[currentPhase] || PHASE_SLEEP_TARGETS.follicular;
  const hours = data?.bedtime && data?.wakeTime ? calcHours(data.bedtime, data.wakeTime) : 0;

  const handleSave = (newData: SleepData) => {
    saveSleepData(todayStr, newData);
    setData(newData);
    setEditing(false);
  };

  if (editing || !data) {
    return (
      <SleepInput
        initial={data}
        onSave={handleSave}
        onCancel={data ? () => setEditing(false) : undefined}
        phaseColor={phaseColor}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] bg-card p-5 shadow-soft cursor-pointer"
      onClick={() => setEditing(true)}
    >
      <div className="flex items-center gap-2 mb-3">
        <Moon className="h-4 w-4" style={{ color: phaseColor }} />
        <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Last night's sleep
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="h-14 w-14">
            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke={phaseColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(hours / 9) * 150.8} 150.8`}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-foreground">
            {hours}h
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-muted-foreground">
            {data.bedtime} → {data.wakeTime}
          </p>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i <= (data.quality || 0) ? phaseColor : "transparent"}
                stroke={i <= (data.quality || 0) ? phaseColor : "hsl(var(--border))"}
              />
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground mt-1.5">
            Target: {target.min}–{target.max}h · {target.note}
          </p>
        </div>
      </div>

      {cycleMode === "perimenopause" && (
        <p className="font-body text-xs text-muted-foreground/70 mt-3 italic">
          Sleep disruption is one of the most common perimenopause symptoms. Prioritise 8–9 hours in bed even if sleep is fragmented.
        </p>
      )}
    </motion.div>
  );
}

function SleepInput({
  initial,
  onSave,
  onCancel,
  phaseColor,
}: {
  initial: SleepData | null;
  onSave: (d: SleepData) => void;
  onCancel?: () => void;
  phaseColor: string;
}) {
  const [bedtime, setBedtime] = useState(initial?.bedtime || "22:00");
  const [wakeTime, setWakeTime] = useState(initial?.wakeTime || "06:30");
  const [quality, setQuality] = useState(initial?.quality || 0);
  const [pickerOpen, setPickerOpen] = useState<"bedtime" | "wake" | null>(null);

  const formatDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { time: `${h12}:${m.toString().padStart(2, "0")}`, suffix };
  };

  const bed = formatDisplay(bedtime);
  const wake = formatDisplay(wakeTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] bg-card p-5 shadow-soft"
    >
      <div className="flex items-center gap-2 mb-4">
        <Moon className="h-4 w-4" style={{ color: phaseColor }} />
        <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Log last night's sleep
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Bedtime</label>
          <button
            onClick={() => setPickerOpen("bedtime")}
            className="w-full rounded-full border border-border bg-secondary/50 px-4 py-3 flex items-center justify-center gap-1.5 hover:border-primary/30 transition-colors"
          >
            <span className="font-display text-xl font-bold text-foreground">{bed.time}</span>
            <span className="font-body text-xs font-medium text-muted-foreground mt-0.5">{bed.suffix}</span>
          </button>
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Wake time</label>
          <button
            onClick={() => setPickerOpen("wake")}
            className="w-full rounded-full border border-border bg-secondary/50 px-4 py-3 flex items-center justify-center gap-1.5 hover:border-primary/30 transition-colors"
          >
            <span className="font-display text-xl font-bold text-foreground">{wake.time}</span>
            <span className="font-body text-xs font-medium text-muted-foreground mt-0.5">{wake.suffix}</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="font-body text-xs text-muted-foreground block mb-2">Sleep quality</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => {
            const filled = i <= quality;
            const GOLD = "#D4A843";
            return (
              <motion.button
                key={i}
                onClick={() => setQuality(i)}
                whileTap={{ scale: 1.35 }}
                animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="touch-btn"
              >
                <Star
                  className="transition-colors duration-200"
                  style={{ width: 32, height: 32 }}
                  fill={filled ? GOLD : "hsl(var(--primary) / 0.25)"}
                  stroke={filled ? GOLD : "hsl(var(--primary) / 0.25)"}
                  strokeWidth={1.5}
                />
              </motion.button>
            );
          })}
        </div>
        {quality > 0 && (
          <motion.p
            key={quality}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-xs font-medium mt-2"
            style={{ color: "#D4A843" }}
          >
            {quality <= 2 ? "Restless" : quality === 3 ? "Okay" : quality === 4 ? "Good" : "Deeply rested"}
          </motion.p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({ bedtime, wakeTime, quality })}
          className="flex-1 rounded-full bg-primary py-2.5 font-body text-sm font-medium text-primary-foreground"
        >
          Save
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full bg-secondary px-4 py-2.5 font-body text-sm text-muted-foreground"
          >
            Cancel
          </button>
        )}
      </div>

      <TimeDrumPicker
        value={pickerOpen === "bedtime" ? bedtime : wakeTime}
        onChange={pickerOpen === "bedtime" ? setBedtime : setWakeTime}
        open={pickerOpen !== null}
        onClose={() => setPickerOpen(null)}
        label={pickerOpen === "bedtime" ? "Bedtime" : "Wake time"}
        accentColor={phaseColor}
      />
    </motion.div>
  );
}
