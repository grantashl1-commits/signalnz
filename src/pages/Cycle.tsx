import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, MoonPhaseRow, BotanicalSprig, WildStar, RootSystem, HandUnderline } from "@/components/BotanicalElements";
import {
  getCycleInfo, getLastPeriodStart, setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase,
  Phase, PHASE_LABELS, PHASE_SHORT, getCycleDayForDate, getSymptoms, logSymptom,
  getSeedsTaken, setSeedsTaken, getLoggedWorkouts
} from "@/lib/cycle-utils";

const PHASE_DATA: Record<Phase, { hormones: string; energy: number; mood: string; body: string; focus: string; nutrition: string; movement: string; poetry: string }> = {
  menstrual: {
    hormones: "Estrogen + Progesterone both low",
    energy: 2, mood: "Introspective, need for rest",
    body: "Increased sensitivity, possible cramping",
    focus: "Rest, reflection, gentle movement",
    nutrition: "Iron, magnesium, anti-inflammatory foods",
    movement: "Yin yoga, walking, rest",
    poetry: "the signal goes quiet. this is not absence — this is integration.",
  },
  follicular: {
    hormones: "Estrogen rising",
    energy: 4, mood: "Optimistic, motivated, sociable",
    body: "Increased stamina, clearer skin",
    focus: "New projects, planning, socialising",
    nutrition: "Complex carbs, fermented foods, lighter eating",
    movement: "Strength training, HIIT, trying new workouts",
    poetry: "your body is rising into its power phase.",
  },
  ovulatory: {
    hormones: "Estrogen peak, LH surge",
    energy: 5, mood: "Confident, communicative, magnetic",
    body: "Highest pain threshold, peak strength",
    focus: "Important conversations, presentations, collaboration",
    nutrition: "Antioxidants, zinc, folate, raw foods",
    movement: "High intensity, cardio, challenging classes",
    poetry: "you are transmitting at full signal.",
  },
  luteal: {
    hormones: "Progesterone rising then both drop",
    energy: 3, mood: "Introspective, detail-oriented, then PMS possible",
    body: "Bloating possible, heightened senses",
    focus: "Completing tasks, editing, self-care",
    nutrition: "Nutrient-dense carbs, magnesium, B6, no skipping meals",
    movement: "Pilates, moderate strength, intuitive movement",
    poetry: "the harvest is rich. honour the complexity.",
  },
};

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Tender breasts", "Spotting", "Back pain", "Mood changes"];
const FLOW_LEVELS = ["Light", "Medium", "Heavy", "Spotting"];

// Moon Wheel — 28 hand-drawn-style day nodes
function MoonWheel({ currentPhase, cycleDay }: { currentPhase: Phase; cycleDay: number }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Background cymatic sketch */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CymatiSketch phase={currentPhase} size={140} opacity={0.08} />
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Hand-drawn ring — dashed strokes */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#8B6F5E" strokeWidth={0.8} strokeDasharray="8 4" opacity={0.2} />

        {/* Day nodes */}
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const phase = getPhaseFromDay(day);
          const isCurrent = day === cycleDay;
          const isPast = day < cycleDay;
          const nodeR = isCurrent ? 6 : 3;
          const opacity = isCurrent ? 1 : isPast ? 0.6 : 0.25;

          return (
            <g key={day}>
              <circle cx={x} cy={y} r={nodeR} fill={isCurrent ? PHASE_HEX[phase] : "none"} stroke={PHASE_HEX[phase]} strokeWidth={1} opacity={opacity} />
              {isCurrent && (
                <circle cx={x} cy={y} r={10} fill="none" stroke={PHASE_HEX[phase]} strokeWidth={0.8} opacity={0.3}>
                  <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#2C1810" className="text-2xl font-bold" style={{ fontFamily: "Space Mono" }}>
          {cycleDay}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#2C1810" opacity={0.5} className="text-xs" style={{ fontFamily: "Caveat" }}>
          {PHASE_SHORT[currentPhase].toLowerCase()}
        </text>
      </svg>

      {/* Compass labels */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 font-hand text-[11px] text-phase-menstrual">menstrual</span>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 font-hand text-[11px] text-phase-follicular">follicular</span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 font-hand text-[11px] text-phase-ovulatory">ovulatory</span>
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 font-hand text-[11px] text-phase-luteal">luteal</span>
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
      <div className="absolute -top-10 -right-10 pointer-events-none">
        <RootSystem size={200} opacity={0.05} />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">cycle tracker</p>
        <h1 className="font-display text-4xl font-bold italic text-foreground">Cycle Tracker</h1>
      </div>

      {/* Date picker */}
      <div className="card-warm p-5">
        <label className="block font-hand text-sm font-bold text-primary mb-2">when did your last period start?</label>
        <input
          type="date"
          value={lastPeriod}
          onChange={handleDateChange}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Phase hero */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-bold italic text-foreground">
          {PHASE_SHORT[info.phase]} — Day {info.cycleDay}
        </h2>
        <HandUnderline width={160} className="mx-auto" color={PHASE_HEX[info.phase]} />
        <p className="font-display text-sm italic text-muted-foreground max-w-md mx-auto mt-2">
          {PHASE_DATA[info.phase].poetry}
        </p>
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
      </div>

      <MoonPhaseRow width={240} className="mx-auto" opacity={0.25} />

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full px-3 py-2 font-body text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <MoonWheel currentPhase={info.phase} cycleDay={info.cycleDay} />
          <p className="text-center font-hand text-sm text-muted-foreground">
            {nextPhase} begins in ~{daysUntil} days
          </p>

          {/* Phase cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {phases.map((phase) => {
              const d = PHASE_DATA[phase];
              const active = phase === info.phase;
              const expanded = expandedPhase === phase;
              return (
                <motion.div
                  key={phase}
                  className={`relative overflow-hidden card-warm p-5 cursor-pointer transition-all ${
                    active ? "ring-1" : "opacity-60"
                  }`}
                  style={active ? { borderColor: PHASE_HEX[phase] } : {}}
                  onClick={() => setExpandedPhase(expanded ? null : phase)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: active ? 1 : 0.6, y: 0 }}
                >
                  <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none">
                    <CymatiSketch phase={phase} size={64} opacity={0.1} />
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: PHASE_HEX[phase] }} />

                  <h3 className="font-display text-lg italic pl-3" style={{ color: PHASE_HEX[phase] }}>
                    {PHASE_LABELS[phase]}
                  </h3>
                  <p className="font-hand text-xs pl-3 mt-0.5" style={{ color: PHASE_HEX[phase] }}>{d.poetry}</p>

                  <div className="pl-3 mt-3 flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">Energy</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={`h-2 w-2 rounded-full ${n <= d.energy ? "" : "bg-border"}`} style={n <= d.energy ? { backgroundColor: PHASE_HEX[phase] } : {}} />
                      ))}
                    </div>
                  </div>

                  <div className="pl-3 mt-2 space-y-1">
                    <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Hormones:</span> {d.hormones}</p>
                    <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Mood:</span> {d.mood}</p>
                  </div>

                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-3 mt-3 pt-3 border-t border-border space-y-1">
                      <BotanicalSprig width={120} opacity={0.2} />
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
          <div className="card-warm p-5">
            <p className="font-hand text-sm font-bold text-primary mb-2">seed cycling</p>
            <p className="font-body text-sm text-muted-foreground mb-3">
              {info.cycleDay <= 14 ? "Days 1–14: Pumpkin + Flaxseeds" : "Days 15–28: Sunflower + Sesame"}
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seedsTaken} onChange={(e) => { setSeedsTakenState(e.target.checked); setSeedsTaken(todayStr, e.target.checked); }} className="rounded border-border text-primary focus:ring-primary" />
              <span className="font-body text-sm text-foreground">seeds taken today</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-secondary rounded-full"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
            <h3 className="font-display text-lg italic text-foreground">
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-secondary rounded-full"><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="font-body text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : null;
              const phase = cycleDay ? getPhaseFromDay(cycleDay) : null;
              const checkedIn = !!localStorage.getItem(`mindcast_checkin_${dateStr}`);
              const hasWorkout = getLoggedWorkouts(dateStr).length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => openDayLog(dateStr)}
                  className={`relative rounded-xl p-2 text-center transition-all hover:bg-secondary ${isToday ? "ring-1 ring-primary" : ""}`}
                >
                  <span className="font-mono text-xs text-foreground">{date.getDate()}</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {phase && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_HEX[phase] }} />}
                    {checkedIn && <WildStar size={8} color={PHASE_HEX[phase || "follicular"]} />}
                    {hasWorkout && <div className="h-1.5 w-1.5 rounded-full bg-phase-ovulatory/60" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-5 space-y-4">
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
                <p className="font-hand text-sm font-bold text-primary mb-2">flow</p>
                <div className="flex flex-wrap gap-1.5">
                  {FLOW_LEVELS.map((f) => (
                    <button key={f} onClick={() => setSelectedFlow(selectedFlow === f ? "" : f)}
                      className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${selectedFlow === f ? "bg-phase-menstrual text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                    >{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-hand text-sm font-bold text-primary mb-2">symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOMS.map((s) => (
                    <button key={s} onClick={() => setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${selectedSymptoms.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ label: "energy", value: selectedEnergy, set: setSelectedEnergy }, { label: "sleep", value: selectedSleep, set: setSelectedSleep }].map(({ label, value, set }) => (
                  <div key={label}>
                    <p className="font-hand text-sm font-bold text-primary mb-2">{label}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => set(n)} className={`h-5 w-5 rounded-full transition-all ${n <= value ? "bg-primary" : "bg-secondary"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={saveSymptoms} className="w-full rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Save
              </button>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="card-warm p-6 text-center">
            <p className="font-hand text-sm font-bold text-primary mb-4">cycle patterns</p>
            <p className="font-display text-sm italic text-muted-foreground mb-6">Your insights will build over time. Here's a typical pattern:</p>

            <div>
              <p className="font-hand text-sm font-bold text-primary mb-3 text-left">energy across cycle</p>
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
                      style={{ height: `${h}%`, backgroundColor: PHASE_HEX[phase], opacity: isCurrent ? 1 : 0.5 }}
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
                <p className="font-body text-[10px] text-muted-foreground">Avg. Cycle</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-mono text-2xl text-foreground">5</p>
                <p className="font-body text-[10px] text-muted-foreground">Avg. Period</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
