import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import { getStructuredSymptoms, setStructuredSymptoms, SymptomEntry } from "@/lib/cycle-symptom-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A2B",
  follicular: "#4CAF50",
  ovulatory: "#F4A63A",
  luteal: "#D4722A",
};

const SEVERITY_LABELS = ["none", "mild", "moderate", "severe"] as const;

interface SymptomCategory {
  label: string;
  symptoms: string[];
}

const PHYSICAL_SYMPTOMS: SymptomCategory = {
  label: "Physical",
  symptoms: [
    "Cramps / pelvic pain", "Bloating", "Breast tenderness", "Headache / migraine",
    "Joint pain or stiffness", "Fatigue / low energy", "Hot flushes",
    "Night sweats", "Heart palpitations", "Digestive changes",
  ],
};

const MENTAL_SYMPTOMS: SymptomCategory = {
  label: "Mental / Emotional",
  symptoms: [
    "Anxiety", "Irritability", "Brain fog", "Low motivation",
    "Feeling overwhelmed", "Low libido",
  ],
};

const BODY_SIGNALS: SymptomCategory = {
  label: "Body Signals",
  symptoms: [
    "Breakouts", "Dry skin", "Cervical fluid — sticky", "Cervical fluid — creamy",
    "Cervical fluid — clear/stretchy",
  ],
};

const ALL_CATEGORIES = [PHYSICAL_SYMPTOMS, MENTAL_SYMPTOMS, BODY_SIGNALS];

interface Props {
  dateStr: string;
  phase: Phase;
  onClose: () => void;
  onSave?: () => void;
}

export default function EnhancedSymptomTracker({ dateStr, phase, onClose, onSave }: Props) {
  const color = PHASE_HEX[phase];
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [mood, setMood] = useState<number>(2); // 0=low, 1=below, 2=stable, 3=elevated
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [nightWaking, setNightWaking] = useState(false);
  const [sleepHours, setSleepHours] = useState("");
  const [bbt, setBbt] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const existing = getStructuredSymptoms(dateStr);
    if (existing) {
      const map: Record<string, number> = {};
      existing.symptoms.forEach((s) => { map[s.name] = s.severity; });
      setEntries(map);
      setMood(existing.mood ?? 2);
      setSleepQuality(existing.sleepQuality ?? 3);
      setNightWaking(existing.nightWaking ?? false);
      setSleepHours(existing.sleepHours ?? "");
      setBbt(existing.bbt ?? "");
      setNotes(existing.notes ?? "");
    }
  }, [dateStr]);

  const toggleSeverity = (symptom: string) => {
    haptic("light");
    setEntries((prev) => {
      const current = prev[symptom] ?? 0;
      const next = current >= 3 ? 0 : current + 1;
      if (next === 0) {
        const { [symptom]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [symptom]: next };
    });
  };

  const handleSave = () => {
    haptic("success");
    const symptoms: SymptomEntry[] = Object.entries(entries)
      .filter(([, sev]) => sev > 0)
      .map(([name, severity]) => ({ name, severity }));

    setStructuredSymptoms(dateStr, {
      symptoms,
      mood,
      sleepQuality,
      nightWaking,
      sleepHours: sleepHours || undefined,
      bbt: bbt || undefined,
      notes: notes || undefined,
    });
    onSave?.();
    onClose();
  };

  const MOOD_LABELS = ["low", "below avg", "stable", "elevated"];

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
        
        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="font-display text-lg italic text-foreground">how are you feeling today?</h3>
          <button onClick={onClose} className="touch-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Mood scale */}
          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>mood</p>
            <div className="flex gap-2">
              {MOOD_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => { haptic("light"); setMood(i); }}
                  className={`touch-btn flex-1 rounded-xl py-2.5 min-h-[44px] font-hand text-xs transition-all ${
                    mood === i ? "text-card font-bold" : "bg-secondary text-muted-foreground"
                  }`}
                  style={mood === i ? { backgroundColor: color } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom categories */}
          {ALL_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="font-hand text-sm font-bold mb-2" style={{ color }}>{category.label.toLowerCase()}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {category.symptoms.map((symptom) => {
                  const severity = entries[symptom] ?? 0;
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSeverity(symptom)}
                      className={`touch-btn rounded-xl px-3 py-2.5 min-h-[44px] text-left transition-all flex items-center justify-between ${
                        severity > 0 ? "ring-1" : "bg-secondary/50"
                      }`}
                      style={severity > 0 ? { 
                        backgroundColor: `${color}${severity === 1 ? "10" : severity === 2 ? "18" : "25"}`,
                        borderColor: color,
                      } : {}}
                    >
                      <span className="font-body text-[11px] text-foreground leading-tight">{symptom}</span>
                      {severity > 0 && (
                        <span className="font-mono text-[9px] shrink-0 ml-1" style={{ color }}>
                          {SEVERITY_LABELS[severity]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sleep section */}
          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>sleep</p>
            <div className="space-y-2">
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">quality (1–5)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => { haptic("light"); setSleepQuality(n); }}
                      className={`touch-btn h-10 w-10 rounded-full font-mono text-sm ${
                        sleepQuality === n ? "text-card font-bold" : "bg-secondary text-muted-foreground"
                      }`}
                      style={sleepQuality === n ? { backgroundColor: color } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { haptic("light"); setNightWaking(!nightWaking); }}
                className={`touch-btn rounded-xl px-3 py-2.5 min-h-[44px] font-body text-xs transition-all ${
                  nightWaking ? "ring-1" : "bg-secondary/50 text-muted-foreground"
                }`}
                style={nightWaking ? { backgroundColor: `${color}15`, borderColor: color, color } : {}}
              >
                waking in the night {nightWaking ? "· yes" : ""}
              </button>
              <input
                type="text"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="approx hours slept"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* BBT */}
          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>basal body temp (optional)</p>
            <input
              type="text"
              value={bbt}
              onChange={(e) => setBbt(e.target.value)}
              placeholder="e.g. 36.5°C"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Free text notes */}
          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>anything else?</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="anything you want to remember about today..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              style={{ fontSize: "16px" }}
            />
          </div>

          <button
            onClick={handleSave}
            className="touch-btn w-full rounded-xl px-4 py-3.5 min-h-[52px] font-hand text-base active:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: color, color: "white" }}
          >
            <Check className="h-4 w-4" /> save check-in →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
