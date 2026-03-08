import { useState } from "react";
import { motion } from "framer-motion";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase, Phase, PHASE_LABELS } from "@/lib/cycle-utils";

const PHASE_DATA: Record<Phase, { hormones: string; energy: number; mood: string; focus: string }> = {
  menstrual: { hormones: "Estrogen and progesterone at their lowest. The body sheds the uterine lining.", energy: 1, mood: "Reflective, introspective, potentially fatigued", focus: "Rest, nourishment, and gentle self-care" },
  follicular: { hormones: "Estrogen begins to rise steadily. FSH stimulates follicle development.", energy: 4, mood: "Optimistic, creative, energised", focus: "New projects, strength training, social connection" },
  ovulatory: { hormones: "Estrogen peaks. LH surges to trigger ovulation. Testosterone briefly rises.", energy: 5, mood: "Confident, communicative, magnetic", focus: "High-intensity activity, presentations, bold moves" },
  luteal: { hormones: "Progesterone rises and peaks. Estrogen has a second smaller rise then falls.", energy: 3, mood: "Turning inward, detail-oriented, may feel irritable", focus: "Organisation, moderate exercise, nesting" },
};

const PHASE_SEGMENTS: { phase: Phase; startDeg: number; endDeg: number }[] = [
  { phase: "menstrual", startDeg: 0, endDeg: 64 },
  { phase: "follicular", startDeg: 64, endDeg: 167 },
  { phase: "ovulatory", startDeg: 167, endDeg: 206 },
  { phase: "luteal", startDeg: 206, endDeg: 360 },
];

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B2E2E",
  follicular: "#7C9E8A",
  ovulatory: "#C9A84C",
  luteal: "#5C3D6E",
};

function PhaseWheel({ currentPhase }: { currentPhase: Phase }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90;

  function arc(startDeg: number, endDeg: number) {
    const startRad = ((startDeg - 90) * Math.PI) / 180;
    const endRad = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {PHASE_SEGMENTS.map((seg) => (
        <motion.path
          key={seg.phase}
          d={arc(seg.startDeg, seg.endDeg)}
          fill={PHASE_HEX[seg.phase]}
          opacity={seg.phase === currentPhase ? 1 : 0.35}
          initial={{ scale: 1 }}
          animate={{ scale: seg.phase === currentPhase ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={35} fill="hsl(36, 47%, 93%)" />
    </svg>
  );
}

export default function CyclePage() {
  const [lastPeriod, setLastPeriod] = useState(getLastPeriodStart() || "");
  const info = getCycleInfo(lastPeriod || null);
  const data = PHASE_DATA[info.phase];
  const daysUntil = getDaysUntilNextPhase(info.cycleDay, info.phase);
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const nextPhaseIdx = (phases.indexOf(info.phase) + 1) % 4;
  const nextPhase = PHASE_LABELS[phases[nextPhaseIdx]];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastPeriod(e.target.value);
    setLastPeriodStart(e.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Cycle Tracker</h1>
        <p className="text-muted-foreground mt-1">Understand your rhythm</p>
      </div>

      {/* Date picker */}
      <div className="card-warm p-5">
        <label className="block text-sm font-medium text-foreground mb-2">When did your last period start?</label>
        <input
          type="date"
          value={lastPeriod}
          onChange={handleDateChange}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* Phase display */}
      <div className="text-center space-y-4">
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
        <PhaseWheel currentPhase={info.phase} />
        <p className="text-sm text-muted-foreground">{nextPhase} begins in approximately {daysUntil} days</p>
      </div>

      {/* Phase info cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {phases.map((phase) => {
          const d = PHASE_DATA[phase];
          const active = phase === info.phase;
          return (
            <motion.div
              key={phase}
              className={`card-warm p-5 ${active ? "ring-2 ring-accent/40" : "opacity-70"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: active ? 1 : 0.7, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${active ? `phase-${phase}` : `phase-${phase}-light`}`}>
                  {PHASE_LABELS[phase]}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-2 w-2 rounded-full ${n <= d.energy ? "bg-accent" : "bg-border"}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{d.hormones}</p>
              <p className="text-xs text-foreground"><span className="font-medium">Mood:</span> {d.mood}</p>
              <p className="text-xs text-foreground mt-1"><span className="font-medium">Focus:</span> {d.focus}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
