import { useState } from "react";
import { motion } from "framer-motion";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, Phase } from "@/lib/cycle-utils";

const PHASE_REC: Record<Phase, string> = {
  menstrual: "Rest is productive. Gentle yoga, walking, and stretching only.",
  follicular: "Your strength window is open. Lift heavy and push your limits.",
  ovulatory: "Peak energy. High intensity cardio, group classes, challenging workouts.",
  luteal: "Intuitive movement. Pilates, moderate strength, walk when in doubt.",
};

type Suitability = "ideal" | "suitable" | "rest";

interface Workout {
  name: string;
  duration: string;
  equipment: string;
  suitability: Record<Phase, Suitability>;
}

const WORKOUTS: Record<string, Workout[]> = {
  strength: [
    { name: "Full Body Compound Lift", duration: "45 min", equipment: "Barbell, Dumbbells", suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" } },
    { name: "Lower Body Power", duration: "40 min", equipment: "Barbell, Rack", suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" } },
    { name: "Upper Body Hypertrophy", duration: "35 min", equipment: "Dumbbells, Cable", suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" } },
  ],
  pilates: [
    { name: "Core Stability Flow", duration: "30 min", equipment: "Mat", suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
    { name: "Reformer Inspired Mat", duration: "40 min", equipment: "Mat, Band", suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
    { name: "Pilates for Posture", duration: "25 min", equipment: "Mat", suitability: { menstrual: "suitable", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
  ],
  yoga: [
    { name: "Restorative Yin", duration: "45 min", equipment: "Mat, Blocks", suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "suitable" } },
    { name: "Somatic Release Flow", duration: "30 min", equipment: "Mat", suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
    { name: "Power Vinyasa", duration: "50 min", equipment: "Mat", suitability: { menstrual: "rest", follicular: "ideal", ovulatory: "ideal", luteal: "suitable" } },
  ],
  walk: [
    { name: "Nature Walk + Breathwork", duration: "30 min", equipment: "None", suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
    { name: "Walk & Talk Meditation", duration: "20 min", equipment: "Headphones", suitability: { menstrual: "ideal", follicular: "suitable", ovulatory: "suitable", luteal: "ideal" } },
    { name: "Incline Walk Intervals", duration: "25 min", equipment: "Treadmill or Hill", suitability: { menstrual: "rest", follicular: "suitable", ovulatory: "ideal", luteal: "suitable" } },
  ],
};

const TAB_LABELS: Record<string, string> = {
  strength: "Strength",
  pilates: "Pilates",
  yoga: "Yoga & Somatic",
  walk: "Walk & Breathe",
};

const FEELINGS = ["Energised", "Good", "Moderate", "Low", "Depleted"];
const FEELING_REC: Record<string, string> = {
  Energised: "You're primed — try the Full Body Compound Lift or Power Vinyasa today.",
  Good: "A solid day for Pilates Core Stability or a moderate strength session.",
  Moderate: "Listen in — a Somatic Release Flow or Nature Walk would serve you well.",
  Low: "Your body is asking for gentleness. Try Restorative Yin or a Walk & Talk Meditation.",
  Depleted: "Rest is not laziness. Stretch gently, drink water, and honour what your body needs.",
};

const SUIT_COLORS: Record<Suitability, { bg: string; text: string; label: string }> = {
  ideal: { bg: "bg-accent/15", text: "text-accent", label: "Ideal This Phase" },
  suitable: { bg: "bg-gold/15", text: "text-gold", label: "Suitable" },
  rest: { bg: "bg-muted", text: "text-muted-foreground", label: "Rest Phase" },
};

export default function MovementPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [tab, setTab] = useState("strength");
  const [feeling, setFeeling] = useState("");

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Movement</h1>
        <p className="text-muted-foreground mt-1">Train with your body, not against it</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />
      </div>

      <div className="card-warm p-5">
        <p className="text-sm text-foreground leading-relaxed italic font-display text-lg">"{PHASE_REC[info.phase]}"</p>
      </div>

      {/* Quick check-in */}
      <section className="card-warm p-5 space-y-4">
        <p className="font-display text-lg text-foreground">How does your body feel right now?</p>
        <div className="flex flex-wrap gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f}
              onClick={() => setFeeling(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                feeling === f ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {feeling && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-foreground leading-relaxed bg-accent/5 rounded-lg p-3"
          >
            {FEELING_REC[feeling]}
          </motion.p>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 overflow-x-auto">
        {Object.keys(TAB_LABELS).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {WORKOUTS[tab].map((w, i) => {
          const suit = w.suitability[info.phase];
          const sc = SUIT_COLORS[suit];
          return (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-warm p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold text-foreground">{w.name}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">{w.duration}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{w.equipment}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
