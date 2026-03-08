import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import CymaticPattern from "@/components/CymaticPatterns";
import NetworkBackground from "@/components/NetworkBackground";
import {
  getCycleInfo, getLastPeriodStart, setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase,
  Phase, PHASE_LABELS, PHASE_SHORT, getCycleDayForDate, getSymptoms, logSymptom,
  getSeedsTaken, setSeedsTaken, getLoggedWorkouts
} from "@/lib/cycle-utils";

const PHASE_DATA: Record<Phase, { hormones: string; energy: number; mood: string; body: string; focus: string; nutrition: string; movement: string; metaphor: string }> = {
  menstrual: {
    hormones: "Estrogen + Progesterone both low",
    energy: 2, mood: "Introspective, need for rest",
    body: "Increased sensitivity, possible cramping",
    focus: "Rest, reflection, gentle movement",
    nutrition: "Iron, magnesium, anti-inflammatory foods",
    movement: "Yin yoga, walking, rest",
    metaphor: "the signal goes quiet. this is not absence. this is integration.",
  },
  follicular: {
    hormones: "Estrogen rising",
    energy: 4, mood: "Optimistic, motivated, sociable",
    body: "Increased stamina, clearer skin",
    focus: "New projects, planning, socialising",
    nutrition: "Complex carbs, fermented foods, lighter eating",
    movement: "Strength training, HIIT, trying new workouts",
    metaphor: "the signal rises. new information. new transmission.",
  },
  ovulatory: {
    hormones: "Estrogen peak, LH surge",
    energy: 5, mood: "Confident, communicative, magnetic",
    body: "Highest pain threshold, peak strength",
    focus: "Important conversations, presentations, collaboration",
    nutrition: "Antioxidants, zinc, folate, raw foods",
    movement: "High intensity, cardio, challenging classes",
    metaphor: "peak signal. you are broadcasting clearly. the network is listening.",
  },
  luteal: {
    hormones: "Progesterone rising then both drop",
    energy: 3, mood: "Introspective, detail-oriented, then PMS possible",
    body: "Bloating possible, heightened senses",
    focus: "Completing tasks, editing, self-care",
    nutrition: "Nutrient-dense carbs, magnesium, B6, no skipping meals",
    movement: "Pilates, moderate strength, intuitive movement",
    metaphor: "complex harmonics. the signal carries everything it has learned.",
  },
};

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A4A",
  follicular: "#00C9A7",
  ovulatory: "#FFD166",
  luteal: "#4A3F7A",
};

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Tender breasts", "Spotting", "Back pain", "Mood changes"];
const FLOW_LEVELS = ["Light", "Medium", "Heavy", "Spotting"];

// Signal Wheel - 28 nodes in a ring
function SignalWheel({ currentPhase, cycleDay }: { currentPhase: Phase; cycleDay: number }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Cymatic pattern in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CymaticPattern phase={currentPhase} size={160} opacity={0.15} active />
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Connection threads between adjacent nodes */}
        {Array.from({ length: 28 }, (_, i) => {
          const angle1 = (i / 28) * Math.PI * 2 - Math.PI / 2;
          const angle2 = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + r * Math.cos(angle1);
          const y1 = cy + r * Math.sin(angle1);
          const x2 = cx + r * Math.cos(angle2);
          const y2 = cy + r * Math.sin(angle2);
          return (
            <line key={`t-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#7FFFD4" strokeWidth={0.3} opacity={0.15}
            />
          );
        })}

        {/* Day nodes */}
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const phase = getPhaseFromDay(day);
          const isCurrent = day === cycleDay;
          const isPast = day < cycleDay;
          const nodeR = isCurrent ? 5 : 2.5;
          const opacity = isCurrent ? 1 : isPast ? 0.6 : 0.2;

          return (
            <g key={day}>
              <circle cx={x} cy={y} r={nodeR} fill={PHASE_HEX[phase]} opacity={opacity} />
              {isCurrent && (
                <>
                  <circle cx={x} cy={y} r={8} fill="none" stroke={PHASE_HEX[phase]} strokeWidth={1} opacity={0.4}>
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}

        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" className="font-mono text-2xl font-bold" style={{ fontFamily: "Space Mono" }}>
          {cycleDay}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="white" opacity={0.5} className="text-[10px]" style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic" }}>
          {PHASE_SHORT[currentPhase]}
        </text>
      </svg>
    </div>
  );
}

export default function CyclePage() {
  const [lastPeriod, setLastPeriod] = useState(getLastPeriodStart() || "");
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "insights">("overview");
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEnergy, setSelectedEnergy] = useState(0);
  const [selectedSleep, setSelectedSleep] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState("");

  const info = getCycleInfo(lastPeriod || null);
  const daysUntil = getDaysUntilNextPhase(info.cycleDay, info.phase);
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const nextPhaseIdx = (phases.indexOf(info.phase) + 1) % 4;
  const nextPhase = PHASE_LABELS[phases[nextPhaseIdx]];
  const todayStr = new Date().toISOString().split("T")[0];
  const [seedsTaken, setSeedsTakenState] = useState(getSeedsTaken(todayStr));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastPeriod(e.target.value);
    setLastPeriodStart(e.target.value);
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [calendarMonth]);

  const openDayLog = (dateStr: string) => {
    setSelectedDate(dateStr);
    const symptoms = getSymptoms(dateStr);
    setSelectedSymptoms(symptoms.symptoms || []);
    setSelectedEnergy(symptoms.energy || 0);
    setSelectedSleep(symptoms.sleep || 0);
    setSelectedFlow(symptoms.flow || "");
  };

  const saveSymptoms = () => {
    if (!selectedDate) return;
    logSymptom(selectedDate, { symptoms: selectedSymptoms, energy: selectedEnergy, sleep: selectedSleep, flow: selectedFlow });
    setSelectedDate(null);
  };

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "calendar" as const, label: "Calendar" },
    { id: "insights" as const, label: "Insights" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      {activeTab === "overview" && (
        <div className="fixed inset-0 -z-10"><NetworkBackground opacity={0.2} /></div>
      )}

      <div>
        <p className="ui-label mb-2">cycle signal</p>
        <h1 className="font-display text-4xl font-light italic text-foreground">Cycle Tracker</h1>
      </div>

      {/* Date picker */}
      <div className="card-deep p-5">
        <label className="block ui-label mb-2">last period start</label>
        <input
          type="date"
          value={lastPeriod}
          onChange={handleDateChange}
          className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan/40"
        />
      </div>

      {/* Phase hero */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-semibold italic text-foreground">
          {PHASE_SHORT[info.phase]} — Day {info.cycleDay}
        </h2>
        <p className="font-display text-sm italic text-muted-foreground max-w-md mx-auto">
          {PHASE_DATA[info.phase].metaphor}
        </p>
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 font-body text-xs font-medium uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-card text-cyan shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <SignalWheel currentPhase={info.phase} cycleDay={info.cycleDay} />
          <p className="text-center font-mono text-xs text-muted-foreground">
            {nextPhase} begins in ~{daysUntil} days
          </p>

          {/* Phase frequency cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {phases.map((phase) => {
              const d = PHASE_DATA[phase];
              const active = phase === info.phase;
              const expanded = expandedPhase === phase;
              return (
                <motion.div
                  key={phase}
                  className={`relative overflow-hidden rounded-xl border border-border bg-card p-5 cursor-pointer transition-all ${
                    active ? "ring-1 ring-cyan/30" : "opacity-60"
                  }`}
                  onClick={() => setExpandedPhase(expanded ? null : phase)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: active ? 1 : 0.6, y: 0 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 -translate-y-8 translate-x-8 pointer-events-none">
                    <CymaticPattern phase={phase} size={128} opacity={active ? 0.12 : 0.05} />
                  </div>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl`} style={{ backgroundColor: PHASE_HEX[phase] }} />

                  <h3 className="font-display text-lg italic pl-3" style={{ color: PHASE_HEX[phase] }}>
                    {PHASE_LABELS[phase]}
                  </h3>
                  <p className="font-display text-xs italic text-muted-foreground pl-3 mt-0.5">{d.metaphor}</p>

                  <div className="pl-3 mt-3 flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Energy</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={`h-1.5 w-1.5 rounded-full ${n <= d.energy ? "bg-cyan" : "bg-border"}`} />
                      ))}
                    </div>
                  </div>

                  <div className="pl-3 mt-2 space-y-1">
                    <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Hormones:</span> {d.hormones}</p>
                    <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Mood:</span> {d.mood}</p>
                  </div>

                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-3 mt-3 pt-3 border-t border-border space-y-1">
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Body:</span> {d.body}</p>
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Nutrition:</span> {d.nutrition}</p>
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Movement:</span> {d.movement}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Seed cycling */}
          <div className="card-deep p-5">
            <p className="ui-label mb-2">seed cycling</p>
            <p className="font-body text-sm text-muted-foreground mb-3">
              {info.cycleDay <= 14 ? "Days 1–14: Pumpkin + Flaxseeds" : "Days 15–28: Sunflower + Sesame"}
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seedsTaken} onChange={(e) => { setSeedsTakenState(e.target.checked); setSeedsTaken(todayStr, e.target.checked); }} className="rounded border-border text-cyan focus:ring-cyan" />
              <span className="font-body text-sm text-foreground">seeds taken today</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-secondary rounded-lg"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
            <h3 className="font-mono text-sm text-foreground uppercase tracking-wider">
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-secondary rounded-lg"><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="font-body text-[9px] uppercase tracking-widest text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : null;
              const phase = cycleDay ? getPhaseFromDay(cycleDay) : null;
              const checkedIn = !!localStorage.getItem(`mindcast_checkin_${dateStr}`);
              const hasWorkout = getLoggedWorkouts(dateStr).length > 0;
              const symptoms = getSymptoms(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => openDayLog(dateStr)}
                  className={`relative rounded-lg p-2 text-center transition-all hover:bg-secondary ${isToday ? "ring-1 ring-cyan" : ""}`}
                >
                  <span className="font-mono text-xs text-foreground">{date.getDate()}</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {phase && <div className={`h-1.5 w-1.5 rounded-full`} style={{ backgroundColor: PHASE_HEX[phase] }} />}
                    {checkedIn && <div className="h-1.5 w-1.5 rounded-full bg-cyan/60" />}
                    {hasWorkout && <div className="h-1.5 w-1.5 rounded-full bg-phase-ovulatory/60" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-deep p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg italic text-foreground">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="font-body text-xs text-muted-foreground hover:text-foreground">Close</button>
              </div>

              {lastPeriod && (() => {
                const d = new Date(selectedDate + "T12:00:00");
                const cd = getCycleDayForDate(lastPeriod, d);
                return <PhaseBadge phase={getPhaseFromDay(cd)} cycleDay={cd} />;
              })()}

              <div>
                <p className="ui-label mb-2">flow</p>
                <div className="flex flex-wrap gap-1.5">
                  {FLOW_LEVELS.map((f) => (
                    <button key={f} onClick={() => setSelectedFlow(selectedFlow === f ? "" : f)}
                      className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${selectedFlow === f ? "bg-phase-menstrual text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                    >{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="ui-label mb-2">symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOMS.map((s) => (
                    <button key={s} onClick={() => setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${selectedSymptoms.includes(s) ? "bg-cyan text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ label: "energy", value: selectedEnergy, set: setSelectedEnergy, color: "bg-cyan" }, { label: "sleep", value: selectedSleep, set: setSelectedSleep, color: "bg-phase-luteal" }].map(({ label, value, set, color }) => (
                  <div key={label}>
                    <p className="ui-label mb-2">{label}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => set(n)} className={`h-5 w-5 rounded-full transition-all ${n <= value ? color : "bg-secondary"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={saveSymptoms} className="w-full rounded-lg bg-cyan px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Save Signal
              </button>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="card-deep p-6 text-center">
            <p className="ui-label mb-4">cycle patterns</p>
            <p className="font-display text-sm italic text-muted-foreground mb-6">Your insights will build over time. Here's a typical signal pattern:</p>

            <div>
              <p className="ui-label mb-3 text-left">energy across cycle</p>
              <div className="flex items-end gap-0.5 h-32">
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const phase = getPhaseFromDay(day);
                  const heights: Record<Phase, number[]> = {
                    menstrual: [30, 25, 20, 25, 30],
                    follicular: [35, 45, 55, 65, 70, 75, 80, 85],
                    ovulatory: [95, 100, 95],
                    luteal: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 30],
                  };
                  const phaseDay = phase === "menstrual" ? day - 1 : phase === "follicular" ? day - 6 : phase === "ovulatory" ? day - 14 : day - 17;
                  const h = heights[phase][phaseDay] || 40;
                  const isCurrent = day === info.cycleDay;
                  return (
                    <div key={day} className={`flex-1 rounded-t transition-all ${isCurrent ? "ring-1 ring-foreground" : ""}`}
                      style={{ height: `${h}%`, backgroundColor: PHASE_HEX[phase], opacity: isCurrent ? 1 : 0.6 }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1">
                <span>D1</span><span>D14</span><span>D28</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-foreground">28</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Avg. Cycle</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-foreground">5</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Avg. Period</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
