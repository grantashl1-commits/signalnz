import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { MOOD_ICONS, SYMPTOM_ICONS, MOODS, SYMPTOM_LIST, ScaleIcon, MoodFaceIcon, SpiralSymptomIcon, QuillIcon } from "@/components/TrackingIcons";
import {
  Phase, getPhaseFromDay, getCycleDayForDate, getLastPeriodStart, setLastPeriodStart,
  getMoods, setMoods, getSymptomsNew, setSymptomsNew,
  getWeight, setWeight, getWeightUnit, setWeightUnit, getWeightHistory,
  getNotes, setNotes, getPeriodEnd, setPeriodEnd, getPeriodLength,
  PHASE_SHORT,
} from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#7D9E82", ovulatory: "#E8A030", luteal: "#9B89B4",
};

interface Props {
  dateStr: string;
  onClose: () => void;
  onCycleUpdate?: () => void;
}

type Panel = "main" | "mood" | "symptoms" | "weight" | "notes";

export default function CalendarDaySheet({ dateStr, onClose, onCycleUpdate }: Props) {
  const [panel, setPanel] = useState<Panel>("main");
  const lastPeriod = getLastPeriodStart();
  const date = new Date(dateStr + "T12:00:00");
  const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : null;
  const phase: Phase = cycleDay ? getPhaseFromDay(cycleDay) : "follicular";
  const phaseColor = PHASE_HEX[phase];

  // Period tracking
  const isPeriodDay = cycleDay !== null && cycleDay >= 1 && cycleDay <= 5;
  const monthKey = dateStr.slice(0, 7);
  const periodEnd = getPeriodEnd(monthKey);

  // Mood state
  const [selectedMoods, setSelectedMoods] = useState<string[]>(getMoods(dateStr));

  // Symptoms state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(getSymptomsNew(dateStr));

  // Weight state
  const [weightValue, setWeightValue] = useState<string>(getWeight(dateStr)?.toString() || "");
  const [unit, setUnit] = useState<"kg" | "lbs">(getWeightUnit());
  const weightHistory = getWeightHistory(7);

  // Notes state
  const [notesText, setNotesText] = useState(getNotes(dateStr));

  const handleStartPeriod = () => {
    haptic("medium");
    setLastPeriodStart(dateStr);
    onCycleUpdate?.();
  };

  const handleEndPeriod = () => {
    haptic("medium");
    setPeriodEnd(monthKey, dateStr);
    onCycleUpdate?.();
  };

  const saveMoods = () => {
    haptic("success");
    setMoods(dateStr, selectedMoods);
    setPanel("main");
  };

  const saveSymptoms = () => {
    haptic("success");
    setSymptomsNew(dateStr, selectedSymptoms);
    setPanel("main");
  };

  const saveWeight = () => {
    haptic("success");
    const val = parseFloat(weightValue);
    if (!isNaN(val) && val > 0) {
      setWeight(dateStr, unit === "lbs" ? val * 0.453592 : val);
      setWeightUnit(unit);
    }
    setPanel("main");
  };

  const saveNotes = () => {
    haptic("success");
    setNotes(dateStr, notesText);
    setPanel("main");
  };

  const periodLength = lastPeriod && periodEnd ? getPeriodLength(lastPeriod, periodEnd) : null;
  const dateLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-[20px] border-t border-border overflow-y-auto"
        style={{ maxHeight: "90vh", paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h3 className="font-display text-lg italic text-foreground">{dateLabel}</h3>
            {cycleDay && (
              <p className="font-hand text-sm" style={{ color: phaseColor }}>
                day {cycleDay} · {PHASE_SHORT[phase].toLowerCase()}
              </p>
            )}
          </div>
          <button onClick={onClose} className="touch-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {panel === "main" && (
            <>
              {/* Period Tracking */}
              <div>
                <p className="font-hand text-sm font-bold text-primary mb-3">period tracking</p>
                <div className="grid grid-cols-2 gap-3">
                  {isPeriodDay && cycleDay ? (
                    <div className="rounded-2xl px-4 py-3 min-h-[52px] flex items-center justify-center" style={{ backgroundColor: "#C4526E" }}>
                      <span className="font-body text-sm font-bold text-card">PERIOD DAY {cycleDay}</span>
                    </div>
                  ) : (
                    <button onClick={handleStartPeriod} className="touch-btn rounded-2xl px-4 py-3 min-h-[52px] font-body text-sm font-bold text-card active:opacity-90" style={{ backgroundColor: "#C4526E" }}>
                      START PERIOD
                    </button>
                  )}
                  <button onClick={handleEndPeriod} className="touch-btn rounded-2xl px-4 py-3 min-h-[52px] font-body text-sm font-bold border-2 active:opacity-90" style={{ borderColor: "#C4526E", color: "#C4526E", backgroundColor: "hsl(36, 47%, 96%)" }}>
                    END PERIOD
                  </button>
                </div>
                {periodLength && (
                  <p className="font-hand text-sm text-muted-foreground mt-2 text-center">
                    period lasted {periodLength} days
                  </p>
                )}
              </div>

              <BotanicalSprig width={140} opacity={0.15} className="mx-auto" />

              {/* Tracking Tiles 2x2 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "weight" as const, label: "weight", Icon: ScaleIcon, hasData: getWeight(dateStr) !== null, preview: getWeight(dateStr) ? `${unit === "lbs" ? (getWeight(dateStr)! / 0.453592).toFixed(1) : getWeight(dateStr)!.toFixed(1)} ${unit}` : "" },
                  { key: "mood" as const, label: "mood", Icon: MoodFaceIcon, hasData: getMoods(dateStr).length > 0, preview: getMoods(dateStr).slice(0, 2).join(", ") },
                  { key: "symptoms" as const, label: "symptoms", Icon: SpiralSymptomIcon, hasData: getSymptomsNew(dateStr).length > 0, preview: getSymptomsNew(dateStr).slice(0, 2).join(", ") },
                  { key: "notes" as const, label: "notes", Icon: QuillIcon, hasData: getNotes(dateStr).length > 0, preview: getNotes(dateStr).slice(0, 30) },
                ].map((tile) => (
                  <button
                    key={tile.key}
                    onClick={() => { haptic("light"); setPanel(tile.key); }}
                    className="touch-card card-warm p-4 text-left relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: phaseColor }} />
                    <div className="pl-2">
                      <tile.Icon size={24} color={phaseColor} />
                      <p className="font-hand text-sm font-bold mt-2" style={{ color: phaseColor }}>{tile.label}</p>
                      {tile.hasData && (
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5 truncate">{tile.preview}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Weight Panel */}
          {panel === "weight" && (
            <div className="space-y-4">
              <button onClick={() => setPanel("main")} className="font-hand text-sm text-primary">← back</button>
              <p className="font-display text-lg italic text-foreground">weight</p>

              <div className="flex gap-2 mb-3">
                {(["kg", "lbs"] as const).map((u) => (
                  <button key={u} onClick={() => { haptic("light"); setUnit(u); }}
                    className={`touch-btn rounded-full px-4 py-2 min-h-[40px] font-mono text-xs ${unit === u ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
                  >{u}</button>
                ))}
              </div>

              <input
                type="number"
                inputMode="decimal"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder={`Enter weight in ${unit}`}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[52px] font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "18px" }}
              />

              {weightHistory.length > 1 && (
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightHistory}>
                      <Line type="monotone" dataKey="value" stroke={phaseColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="font-mono text-[9px] text-muted-foreground text-center">7-day trend</p>
                </div>
              )}

              <button onClick={saveWeight} className="touch-btn w-full rounded-xl bg-primary px-4 py-3 min-h-[52px] font-hand text-base text-primary-foreground active:opacity-90 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> save weight →
              </button>
            </div>
          )}

          {/* Mood Panel */}
          {panel === "mood" && (
            <div className="space-y-4">
              <button onClick={() => setPanel("main")} className="font-hand text-sm text-primary">← back</button>
              <p className="font-display text-lg italic text-foreground">how are you feeling?</p>

              <div className="grid grid-cols-4 gap-2">
                {MOODS.map((mood) => {
                  const Icon = MOOD_ICONS[mood];
                  const selected = selectedMoods.includes(mood);
                  return (
                    <button
                      key={mood}
                      onClick={() => {
                        haptic("light");
                        setSelectedMoods((prev) => prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]);
                      }}
                      className={`touch-btn flex flex-col items-center gap-1 rounded-2xl p-2 min-h-[70px] transition-all ${selected ? "ring-2 bg-secondary/80" : "bg-card border border-border"}`}
                      style={selected ? { borderColor: phaseColor } : {}}
                    >
                      {Icon && <Icon size={28} color={selected ? phaseColor : undefined} />}
                      <span className="font-hand text-[10px] font-bold text-foreground">{mood}</span>
                    </button>
                  );
                })}
              </div>

              <button onClick={saveMoods} className="touch-btn w-full rounded-xl px-4 py-3 min-h-[52px] font-hand text-base active:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: phaseColor, color: "white" }}>
                save my mood →
              </button>
            </div>
          )}

          {/* Symptoms Panel */}
          {panel === "symptoms" && (
            <div className="space-y-4">
              <button onClick={() => setPanel("main")} className="font-hand text-sm text-primary">← back</button>
              <p className="font-display text-lg italic text-foreground">symptoms</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SYMPTOM_LIST.map((symptom) => {
                  const Icon = SYMPTOM_ICONS[symptom];
                  const selected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => {
                        haptic("light");
                        setSelectedSymptoms((prev) => prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]);
                      }}
                      className={`touch-btn flex flex-col items-center gap-1 rounded-2xl p-2 min-h-[80px] transition-all ${selected ? "ring-2" : "bg-card border border-border"}`}
                      style={selected ? { backgroundColor: `${phaseColor}15`, borderColor: phaseColor } : {}}
                    >
                      {Icon && <Icon size={24} color={selected ? phaseColor : undefined} />}
                      <span className="font-hand text-[9px] font-bold text-foreground text-center leading-tight">{symptom}</span>
                    </button>
                  );
                })}
              </div>

              <button onClick={saveSymptoms} className="touch-btn w-full rounded-xl px-4 py-3 min-h-[52px] font-hand text-base active:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: phaseColor, color: "white" }}>
                save symptoms →
              </button>
            </div>
          )}

          {/* Notes Panel */}
          {panel === "notes" && (
            <div className="space-y-4">
              <button onClick={() => setPanel("main")} className="font-hand text-sm text-primary">← back</button>
              <p className="font-display text-lg italic text-foreground">journal notes</p>

              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="How is your body feeling today? What do you want to remember about this day?"
                rows={8}
                className="w-full rounded-xl border border-border px-4 py-3 font-body text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                style={{ backgroundColor: "#F5EDE0", fontSize: "16px" }}
              />
              <p className="font-mono text-[9px] text-muted-foreground text-right">
                {notesText.split(/\s+/).filter(Boolean).length} words
              </p>

              <button onClick={saveNotes} className="touch-btn w-full rounded-xl bg-primary px-4 py-3 min-h-[52px] font-hand text-base text-primary-foreground active:opacity-90 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> save notes →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
