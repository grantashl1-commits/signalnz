import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import {
  getCycleInfo, getLastPeriodStart, setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase,
  Phase, PHASE_LABELS, PHASE_SHORT, getCycleDayForDate, getSymptoms, logSymptom,
  getCheckin, getSeedsTaken, setSeedsTaken, getLoggedWorkouts
} from "@/lib/cycle-utils";

const PHASE_DATA: Record<Phase, { hormones: string; energy: number; mood: string; body: string; focus: string; nutrition: string; movement: string }> = {
  menstrual: {
    hormones: "Estrogen + Progesterone both low",
    energy: 2,
    mood: "Introspective, need for rest",
    body: "Increased sensitivity, possible cramping",
    focus: "Rest, reflection, gentle movement",
    nutrition: "Iron, magnesium, anti-inflammatory foods",
    movement: "Yin yoga, walking, rest",
  },
  follicular: {
    hormones: "Estrogen rising",
    energy: 4,
    mood: "Optimistic, motivated, sociable",
    body: "Increased stamina, clearer skin",
    focus: "New projects, planning, socialising",
    nutrition: "Complex carbs, fermented foods, lighter eating",
    movement: "Strength training, HIIT, trying new workouts",
  },
  ovulatory: {
    hormones: "Estrogen peak, LH surge",
    energy: 5,
    mood: "Confident, communicative, magnetic",
    body: "Highest pain threshold, peak strength",
    focus: "Important conversations, presentations, collaboration",
    nutrition: "Antioxidants, zinc, folate, raw foods",
    movement: "High intensity, cardio, challenging classes",
  },
  luteal: {
    hormones: "Progesterone rising then both drop",
    energy: 3,
    mood: "Introspective, detail-oriented, then PMS possible",
    body: "Bloating possible, heightened senses",
    focus: "Completing tasks, editing, self-care",
    nutrition: "Nutrient-dense carbs, magnesium, B6, no skipping meals",
    movement: "Pilates, moderate strength, intuitive movement",
  },
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

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Tender breasts", "Spotting", "Back pain", "Mood changes"];
const FLOW_LEVELS = ["Light", "Medium", "Heavy", "Spotting"];

function PhaseWheel({ currentPhase, cycleDay }: { currentPhase: Phase; cycleDay: number }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;

  function arc(startDeg: number, endDeg: number, radius: number) {
    const startRad = ((startDeg - 90) * Math.PI) / 180;
    const endRad = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  // Day marker position
  const dayAngle = ((cycleDay - 1) / 28) * 360 - 90;
  const markerR = r + 12;
  const mx = cx + markerR * Math.cos((dayAngle * Math.PI) / 180);
  const my = cy + markerR * Math.sin((dayAngle * Math.PI) / 180);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {PHASE_SEGMENTS.map((seg) => (
        <motion.path
          key={seg.phase}
          d={arc(seg.startDeg, seg.endDeg, seg.phase === currentPhase ? r + 4 : r)}
          fill={PHASE_HEX[seg.phase]}
          opacity={seg.phase === currentPhase ? 1 : 0.3}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={38} fill="hsl(36, 47%, 93%)" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground text-xs font-medium" style={{ fontFamily: "DM Sans" }}>
        Day
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="fill-foreground text-xl font-bold" style={{ fontFamily: "Cormorant Garamond" }}>
        {cycleDay}
      </text>
      {/* Day marker */}
      <circle cx={mx} cy={my} r={5} fill="hsl(36, 47%, 93%)" stroke={PHASE_HEX[currentPhase]} strokeWidth={2} />
    </svg>
  );
}

export default function CyclePage() {
  const [lastPeriod, setLastPeriod] = useState(getLastPeriodStart() || "");
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "insights">("overview");
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const info = getCycleInfo(lastPeriod || null);
  const daysUntil = getDaysUntilNextPhase(info.cycleDay, info.phase);
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const nextPhaseIdx = (phases.indexOf(info.phase) + 1) % 4;
  const nextPhase = PHASE_LABELS[phases[nextPhaseIdx]];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastPeriod(e.target.value);
    setLastPeriodStart(e.target.value);
  };

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [calendarMonth]);

  const todayStr = new Date().toISOString().split("T")[0];
  const seedInfo = lastPeriod ? (() => {
    const cycleDay = info.cycleDay;
    return cycleDay <= 14 ? "Pumpkin + Flaxseeds" : "Sunflower + Sesame";
  })() : null;

  const [seedsTaken, setSeedsTakenState] = useState(getSeedsTaken(todayStr));

  // Symptom logging for selected date
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEnergy, setSelectedEnergy] = useState(0);
  const [selectedSleep, setSelectedSleep] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState("");

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
    logSymptom(selectedDate, {
      symptoms: selectedSymptoms,
      energy: selectedEnergy,
      sleep: selectedSleep,
      flow: selectedFlow,
    });
    setSelectedDate(null);
  };

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "calendar" as const, label: "Calendar" },
    { id: "insights" as const, label: "Insights" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
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

      {/* Phase hero */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          {PHASE_SHORT[info.phase].toUpperCase()} — DAY {info.cycleDay}
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {info.phase === "follicular" && "Estrogen is rising. Energy, creativity, and focus are building. This is your planning and starting phase."}
          {info.phase === "menstrual" && "Your hormones are at their lowest. This is your inner winter — rest, reflect, and be gentle with yourself."}
          {info.phase === "ovulatory" && "Estrogen is peaking. You're at your most communicative, confident, and physically strong."}
          {info.phase === "luteal" && "Progesterone is rising. Turn inward, prioritise rest, and nourish yourself with warming, dense foods."}
        </p>
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <PhaseWheel currentPhase={info.phase} cycleDay={info.cycleDay} />
          <p className="text-center text-sm text-muted-foreground">{nextPhase} begins in approximately {daysUntil} days</p>

          {/* Phase info cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {phases.map((phase) => {
              const d = PHASE_DATA[phase];
              const active = phase === info.phase;
              const expanded = expandedPhase === phase;
              return (
                <motion.div
                  key={phase}
                  className={`card-warm p-5 cursor-pointer transition-all ${active ? "ring-2 ring-accent/40" : "opacity-70"}`}
                  onClick={() => setExpandedPhase(expanded ? null : phase)}
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
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2"><span className="font-medium">Hormones:</span> {d.hormones}</p>
                  <p className="text-xs text-foreground"><span className="font-medium">Mood:</span> {d.mood}</p>
                  <p className="text-xs text-foreground mt-1"><span className="font-medium">Focus:</span> {d.focus}</p>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border space-y-1"
                    >
                      <p className="text-xs text-foreground"><span className="font-medium">Body:</span> {d.body}</p>
                      <p className="text-xs text-foreground"><span className="font-medium">Nutrition:</span> {d.nutrition}</p>
                      <p className="text-xs text-foreground"><span className="font-medium">Movement:</span> {d.movement}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Seed cycling */}
          <div className="card-warm p-5">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Seed Cycling</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {info.cycleDay <= 14 ? "Days 1–14: Pumpkin seeds + Flaxseeds" : "Days 15–28: Sunflower seeds + Sesame seeds"}
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={seedsTaken}
                onChange={(e) => {
                  setSeedsTakenState(e.target.checked);
                  setSeedsTaken(todayStr, e.target.checked);
                }}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-foreground">I took my seeds today</span>
            </label>
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-[10px] uppercase tracking-wider text-muted-foreground py-1">{d}</div>
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
              const hasFlow = !!symptoms.flow;

              const phaseColor = phase === "menstrual" ? "bg-burgundy" : phase === "follicular" ? "bg-accent" : phase === "ovulatory" ? "bg-gold" : phase === "luteal" ? "bg-plum" : "";

              return (
                <button
                  key={dateStr}
                  onClick={() => openDayLog(dateStr)}
                  className={`relative rounded-lg p-2 text-center transition-all hover:bg-muted/80 ${
                    isToday ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <span className="text-sm text-foreground">{date.getDate()}</span>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {phase && <div className={`h-1.5 w-1.5 rounded-full ${phaseColor}`} />}
                    {checkedIn && <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />}
                    {hasWorkout && <div className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </div>
                  {hasFlow && <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-burgundy" />}
                </button>
              );
            })}
          </div>

          {/* Selected date panel */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-warm p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
              </div>

              {lastPeriod && (() => {
                const d = new Date(selectedDate + "T12:00:00");
                const cd = getCycleDayForDate(lastPeriod, d);
                const ph = getPhaseFromDay(cd);
                return <PhaseBadge phase={ph} cycleDay={cd} />;
              })()}

              {/* Flow logging for menstrual days */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Flow</p>
                <div className="flex flex-wrap gap-1.5">
                  {FLOW_LEVELS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlow(selectedFlow === f ? "" : f)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedFlow === f ? "bg-burgundy text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedSymptoms.includes(s) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy & Sleep */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Energy</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSelectedEnergy(n)}
                        className={`h-6 w-6 rounded-full transition-all ${n <= selectedEnergy ? "bg-accent" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wider">Sleep</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSelectedSleep(n)}
                        className={`h-6 w-6 rounded-full transition-all ${n <= selectedSleep ? "bg-plum" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={saveSymptoms}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" /> Save
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="card-warm p-6 text-center">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Your Cycle Patterns</h3>
            <p className="text-sm text-muted-foreground mb-6">Your insights will build over time. Here's what a typical cycle looks like:</p>

            {/* Placeholder energy chart */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-3 text-left">Energy Across Your Cycle</p>
                <div className="flex items-end gap-1 h-32">
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
                    const color = phase === "menstrual" ? "bg-burgundy" : phase === "follicular" ? "bg-accent" : phase === "ovulatory" ? "bg-gold" : "bg-plum";
                    const isCurrentDay = day === info.cycleDay;
                    return (
                      <div
                        key={day}
                        className={`flex-1 rounded-t ${color} ${isCurrentDay ? "ring-1 ring-foreground" : ""}`}
                        style={{ height: `${h}%` }}
                        title={`Day ${day}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>Day 1</span>
                  <span>Day 14</span>
                  <span>Day 28</span>
                </div>
              </div>

              {/* Average cycle */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display font-semibold text-foreground">28</p>
                  <p className="text-xs text-muted-foreground">Avg. Cycle Length</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display font-semibold text-foreground">5</p>
                  <p className="text-xs text-muted-foreground">Avg. Period Length</p>
                </div>
              </div>

              {/* Common symptoms */}
              <div className="text-left mt-4">
                <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">Most Common Symptoms by Phase</p>
                <div className="space-y-2">
                  {[
                    { phase: "menstrual" as Phase, symptoms: ["Cramps", "Fatigue", "Back pain"] },
                    { phase: "follicular" as Phase, symptoms: ["Increased energy", "Clearer skin"] },
                    { phase: "ovulatory" as Phase, symptoms: ["Increased libido", "Mild bloating"] },
                    { phase: "luteal" as Phase, symptoms: ["Bloating", "Mood changes", "Tender breasts"] },
                  ].map((item) => (
                    <div key={item.phase} className="flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium phase-${item.phase}-light`}>
                        {PHASE_SHORT[item.phase]}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.symptoms.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
