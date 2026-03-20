import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { ChevronLeft, ChevronRight, Check, Pencil } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, MoonPhaseRow, BotanicalSprig, WildStar, RootSystem, HandUnderline } from "@/components/BotanicalElements";
import CalendarDaySheet from "@/components/CalendarDaySheet";
import InsightsTab from "@/components/InsightsTab";
import {
  getCycleInfo, getLastPeriodStart, setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase,
  Phase, PHASE_LABELS, PHASE_SHORT, getCycleDayForDate,
  getDayIndicators, getMonthLogSummary,
} from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

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
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

// Moon Wheel
function MoonWheel({ currentPhase, cycleDay }: { currentPhase: Phase; cycleDay: number }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <CymatiSketch phase={currentPhase} size={120} opacity={0.08} />
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#8B6F5E" strokeWidth={0.8} strokeDasharray="8 4" opacity={0.2} />
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
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#2C1810" className="text-2xl font-bold" style={{ fontFamily: "Space Mono" }}>
          {cycleDay}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#2C1810" opacity={0.5} className="text-xs" style={{ fontFamily: "Caveat" }}>
          {PHASE_SHORT[currentPhase].toLowerCase()}
        </text>
      </svg>

      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 font-hand text-[10px] text-phase-menstrual">menstrual</span>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 font-hand text-[10px] text-phase-follicular">follicular</span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 font-hand text-[10px] text-phase-ovulatory">ovulatory</span>
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 font-hand text-[10px] text-phase-luteal">luteal</span>
    </div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function CyclePage() {
  const [lastPeriod, setLastPeriod] = useState(getLastPeriodStart() || "");
  const { openSignal } = useSignalPanel();
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "insights">("overview");
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [dateEditValue, setDateEditValue] = useState(lastPeriod);
  const [refreshKey, setRefreshKey] = useState(0);

  const info = getCycleInfo(lastPeriod || null);
  const daysUntil = getDaysUntilNextPhase(info.cycleDay, info.phase);
  const phases: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
  const nextPhaseIdx = (phases.indexOf(info.phase) + 1) % 4;
  const nextPhase = PHASE_LABELS[phases[nextPhaseIdx]];
  const todayStr = new Date().toISOString().split("T")[0];
  const hasDateSet = !!lastPeriod;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLastPeriod(val);
    setLastPeriodStart(val);
  };

  const handleDateEditSave = () => {
    setLastPeriod(dateEditValue);
    setLastPeriodStart(dateEditValue);
    setShowDateEdit(false);
    setRefreshKey((k) => k + 1);
  };

  const handleCycleUpdate = useCallback(() => {
    setLastPeriod(getLastPeriodStart() || "");
    setRefreshKey((k) => k + 1);
  }, []);

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

  const monthSummary = useMemo(() => {
    return getMonthLogSummary(calendarMonth.getFullYear(), calendarMonth.getMonth());
  }, [calendarMonth, refreshKey]);

  

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "calendar" as const, label: "Calendar" },
    { id: "insights" as const, label: "Insights" },
  ];

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Cycle tracker</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Your Cycle</h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            {PHASE_DATA[info.phase].poetry}
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-8 md:space-y-10">

      <SignalContextChips pageContext="cycle" onOpenSignal={(p) => openSignal(p, "cycle")} compact />

      {/* Date picker — only shown if no date set yet */}
      {!hasDateSet && (
        <div className="card-warm p-4 md:p-5">
          <label className="block font-hand text-sm font-bold text-primary mb-2">when did your last period start?</label>
          <input
            type="date"
            value={lastPeriod}
            onChange={handleDateChange}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[52px] font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ fontSize: "16px" }}
          />
        </div>
      )}

      {/* Date edit bottom sheet */}
      {showDateEdit && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-4 md:p-5">
          <label className="block font-hand text-sm font-bold text-primary mb-2">when did your last period start?</label>
          <input
            type="date"
            value={dateEditValue}
            onChange={(e) => setDateEditValue(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[52px] font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ fontSize: "16px" }}
          />
          <div className="flex gap-2 mt-3">
            <button onClick={handleDateEditSave} className="touch-btn flex-1 rounded-xl bg-primary px-4 py-3 min-h-[44px] font-body text-sm font-bold text-primary-foreground active:opacity-90">
              Save
            </button>
            <button onClick={() => setShowDateEdit(false)} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[44px] font-body text-sm text-muted-foreground active:opacity-90">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Phase hero */}
      {hasDateSet && (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-display text-2xl md:text-3xl font-bold italic text-foreground">
                {PHASE_SHORT[info.phase]} — Day {info.cycleDay}
              </h2>
              <button onClick={() => { haptic("light"); setShowDateEdit(true); }} className="touch-btn p-1.5 rounded-full bg-secondary/60 min-w-[32px] min-h-[32px] flex items-center justify-center">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <HandUnderline width={120} className="mx-auto md:hidden" color={PHASE_HEX[info.phase]} />
            <HandUnderline width={160} className="mx-auto hidden md:block" color={PHASE_HEX[info.phase]} />
            <p className="font-display text-sm italic text-muted-foreground max-w-md mx-auto mt-2">
              {PHASE_DATA[info.phase].poetry}
            </p>
            <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
          </div>

          <MoonPhaseRow width={200} className="mx-auto md:hidden" opacity={0.25} />
          <MoonPhaseRow width={240} className="mx-auto hidden md:block" opacity={0.25} />
        </>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic("light"); setActiveTab(tab.id); }}
            className={`touch-tab flex-1 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 md:space-y-10">
          {hasDateSet && <MoonWheel currentPhase={info.phase} cycleDay={info.cycleDay} />}
          <p className="text-center font-hand text-sm text-muted-foreground">
            {nextPhase} begins in ~{daysUntil} days
          </p>

          {/* Phase cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {phases.map((phase, i) => {
              const d = PHASE_DATA[phase];
              const active = phase === info.phase;
              const expanded = expandedPhase === phase;
              return (
                <motion.div
                  key={phase}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariant}
                  className={`relative overflow-hidden card-warm p-4 md:p-5 cursor-pointer touch-card ${
                    active ? "ring-1 opacity-100" : "opacity-60"
                  }`}
                  style={active ? { borderColor: PHASE_HEX[phase] } : {}}
                  onClick={() => { haptic("light"); setExpandedPhase(expanded ? null : phase); }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-2 right-2 w-12 h-12 md:w-16 md:h-16 pointer-events-none">
                    <CymatiSketch phase={phase} size={48} opacity={0.1} />
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: PHASE_HEX[phase] }} />

                  <h3 className="font-display text-base md:text-lg italic pl-3" style={{ color: PHASE_HEX[phase] }}>
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
                      <BotanicalSprig width={100} opacity={0.2} />
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Body:</span> {d.body}</p>
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Nutrition:</span> {d.nutrition}</p>
                      <p className="font-body text-xs text-muted-foreground"><span className="text-foreground/70">Movement:</span> {d.movement}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Seed cycling moved to Nourish page */}
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-4 md:space-y-6">
          {/* Month summary header */}
          <p className="font-body text-xs text-muted-foreground font-light text-center">
            {calendarMonth.toLocaleDateString("en-US", { month: "long" })}: {monthSummary.periodDays} period days · {monthSummary.symptomsLogged} symptoms logged · {monthSummary.moodsLogged} moods recorded
          </p>

          <div className="flex items-center justify-between">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="touch-btn p-2 active:bg-secondary rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
            <h3 className="font-display text-base md:text-lg italic text-foreground">
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="touch-btn p-2 active:bg-secondary rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={`${d}-${i}`} className="font-body text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : null;
              const phase = cycleDay ? getPhaseFromDay(cycleDay) : null;
              const indicators = getDayIndicators(dateStr, lastPeriod);

              return (
                <button
                  key={dateStr}
                  onClick={() => { haptic("light"); setSelectedDate(dateStr); }}
                  className={`touch-btn relative rounded-xl p-1 md:p-2 text-center transition-all active:bg-secondary min-h-[44px] ${isToday ? "ring-1 ring-primary" : ""}`}
                >
                  <span className="font-mono text-xs text-foreground">{date.getDate()}</span>
                  <div className="flex justify-center gap-[2px] mt-0.5 flex-wrap">
                    {phase && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_HEX[phase] }} />}
                  </div>
                  {/* Indicator dots */}
                  <div className="flex justify-center gap-[1px] mt-[1px]">
                    {indicators.isPeriodDay && <div className="h-1 w-1 rounded-full" style={{ backgroundColor: "#C4526E" }} />}
                    {indicators.hasMood && <div className="h-1 w-1 rounded-full bg-foreground/40" />}
                    {indicators.hasSymptoms && phase && <div className="h-1 w-1 rounded-full" style={{ backgroundColor: PHASE_HEX[phase], opacity: 0.6 }} />}
                    {indicators.hasWeight && <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />}
                    {indicators.hasNotes && <div className="h-1 w-1 rounded-full bg-foreground/30" />}
                    {indicators.hasSeeds && <div className="h-1 w-1 rounded-full" style={{ backgroundColor: "#C47A8A" }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Day sheet */}
          {selectedDate && (
            <CalendarDaySheet
              dateStr={selectedDate}
              onClose={() => { setSelectedDate(null); setRefreshKey((k) => k + 1); }}
              onCycleUpdate={handleCycleUpdate}
            />
          )}
        </div>
      )}

      {activeTab === "insights" && <InsightsTab />}
      </ContentSection>
    </div>
  );
}
