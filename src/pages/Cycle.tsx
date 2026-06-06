import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { GatedFeature } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import { CymatiSketch, MoonPhaseRow, HandUnderline } from "@/components/BotanicalElements";
import CalendarDaySheet from "@/components/CalendarDaySheet";
import InsightsTab from "@/components/InsightsTab";
import { useCycle } from "@/contexts/CycleContext";
import {
  setLastPeriodStart, getPhaseFromDay, getDaysUntilNextPhase,
  Phase, PHASE_LABELS, PHASE_SHORT, getCycleDayForDate,
  getDayIndicators, getMonthLogSummary, getMoods, getWeight, getWeightUnit,
  getPeriodEnd, getLoggedWorkouts,
} from "@/lib/cycle-utils";
import CalendarMoodPopover, { getMoodDotColor } from "@/components/CalendarMoodPopover";
import { haptic } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/useProfile";

import CycleModeSelector, { CycleMode } from "@/components/cycle/CycleModeSelector";
import PhaseProgressStrip from "@/components/cycle/PhaseProgressStrip";
import PhaseDashboard from "@/components/cycle/PhaseDashboard";
import EnhancedSymptomTracker from "@/components/cycle/EnhancedSymptomTracker";
import HormoneEducationHub from "@/components/cycle/HormoneEducationHub";
import PerimenopauseMode from "@/components/cycle/PerimenopauseMode";
import CycleInsights from "@/components/cycle/CycleInsights";
import IrregularPeriodSupport from "@/components/cycle/IrregularPeriodSupport";
import QuickLogPills from "@/components/cycle/QuickLogPills";
import Last28DaysMiniDashboard from "@/components/cycle/Last28DaysMiniDashboard";
import PhaseCountdownBanner from "@/components/cycle/PhaseCountdownBanner";
import WhatsComingNext from "@/components/cycle/WhatsComingNext";
import PhaseLearnCard from "@/components/cycle/PhaseLearnCard";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

export default function CyclePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cycle = useCycle();
  const { getFeatureAccess } = useFeatureGate();
  const { cycleMode, updateCycleMode, onboardingComplete, cycleStatus } = useProfile();
  const [lastPeriod, setLastPeriod] = useState(cycle.cycleStartDate || "");
  const [activeTab, setActiveTab] = useState<"today" | "calendar" | "learn">("today");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [dateEditValue, setDateEditValue] = useState(lastPeriod);
  const [refreshKey, setRefreshKey] = useState(0);
  const [popover, setPopover] = useState<{ dateStr: string; cycleDay: number | null; type: "mood" | "weight" } | null>(null);
  const [showSymptomTracker, setShowSymptomTracker] = useState(false);

  // Deep-link from Home calendar: ?date=YYYY-MM-DD opens the day sheet
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setActiveTab("calendar");
      setSelectedDate(dateParam);
      const [y, m] = dateParam.split("-").map(Number);
      setCalendarMonth(new Date(y, m - 1, 1));
      const next = new URLSearchParams(searchParams);
      next.delete("date");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Only show mode selector if user hasn't completed onboarding AND hasn't manually selected
  const needsModeSelection = !localStorage.getItem("cycleModeSelected") && !onboardingComplete && !cycleStatus;

  const info = { phase: cycle.currentPhase, cycleDay: cycle.currentCycleDay };
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
    cycle.setCycleStartDate(val);
  };

  const handleDateEditSave = () => {
    setLastPeriod(dateEditValue);
    setLastPeriodStart(dateEditValue);
    cycle.setCycleStartDate(dateEditValue);
    setShowDateEdit(false);
    setRefreshKey((k) => k + 1);
  };

  const handleCycleUpdate = useCallback(() => {
    cycle.refresh();
    setLastPeriod(cycle.cycleStartDate || "");
    setRefreshKey((k) => k + 1);
  }, [cycle]);

  const handleModeSelect = (mode: CycleMode) => {
    updateCycleMode(mode);
    localStorage.setItem("cycleModeSelected", "true");
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

  const monthSummary = useMemo(() => {
    return getMonthLogSummary(calendarMonth.getFullYear(), calendarMonth.getMonth());
  }, [calendarMonth, refreshKey]);

  const TABS = cycleMode === "post-menopause"
    ? [
        { id: "today" as const, label: "Today" },
        { id: "learn" as const, label: "Learn" },
      ]
    : [
        { id: "today" as const, label: "Today" },
        { id: "calendar" as const, label: "Calendar" },
        { id: "learn" as const, label: "Learn" },
      ];

  return (
    <div className="relative">
      {needsModeSelection && (
        <CycleModeSelector onSelect={handleModeSelect} />
      )}

      {showSymptomTracker && (
        <EnhancedSymptomTracker
          dateStr={todayStr}
          phase={info.phase}
          onClose={() => setShowSymptomTracker(false)}
          onSave={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* ═══ HERO — factual, not poetic ═══ */}
      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">
            {cycleMode === "perimenopause" ? "Perimenopause" : cycleMode === "post-menopause" ? "Post-menopause" : "Cycle"}
          </p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Rhythm</h1>
          {cycleMode === "cycling" && hasDateSet && (
            <p className="font-body text-sm text-primary-foreground/60">
              Day {info.cycleDay} of {PHASE_SHORT[info.phase].toLowerCase()} · {daysUntil} days held ahead
            </p>
          )}
          {cycleMode === "perimenopause" && (
            <p className="font-body text-sm text-primary-foreground/60">
              moving with the change — held, gently
            </p>
          )}
          {cycleMode === "post-menopause" && (
            <p className="font-body text-sm text-primary-foreground/60">
              strength, softness, the next season
            </p>
          )}
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-8 md:space-y-10">


        {/* Date picker */}
        {!hasDateSet && cycleMode !== "post-menopause" && (
          <div className="card-warm p-4 md:p-5">
            <label className="block font-hand text-sm font-bold text-primary mb-2">when did your last period start?</label>
            <input
              type="date"
              value={lastPeriod}
              onChange={handleDateChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[52px] font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
            />
          </div>
        )}

        {showDateEdit && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-warm p-4 md:p-5">
            <label className="block font-hand text-sm font-bold text-primary mb-2">when did your last period start?</label>
            <input
              type="date"
              value={dateEditValue}
              onChange={(e) => setDateEditValue(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[52px] font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleDateEditSave} className="touch-btn flex-1 rounded-xl bg-primary px-4 py-3 min-h-[44px] font-body text-sm font-bold text-primary-foreground">Save</button>
              <button onClick={() => setShowDateEdit(false)} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[44px] font-body text-sm text-muted-foreground">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Phase hero */}
        {hasDateSet && cycleMode !== "post-menopause" && (
          <>
            <PhaseProgressStrip cycleDay={info.cycleDay} currentPhase={info.phase} />
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
            </div>
          </>
        )}


        {/* Tabs */}
        <div className="flex gap-1 rounded-full bg-secondary p-1 mt-8 md:mt-10">
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

        {/* ═══ TODAY TAB (merged Overview + Insights) ═══ */}
        {activeTab === "today" && (
          <div className="space-y-8 md:space-y-10">
            {hasDateSet && cycleMode !== "post-menopause" && (
              <PhaseCountdownBanner cycleDay={info.cycleDay} phase={info.phase} />
            )}


            {cycleMode === "perimenopause" && (
              <PerimenopauseMode onNavigateToTraining={() => navigate("/movement")} />
            )}

            <IrregularPeriodSupport onNavigateToTraining={() => navigate("/movement")} />

            {/* Collapsible insights */}
            {lastPeriod && (
              <details className="group">
                <summary className="cursor-pointer font-display text-sm italic text-muted-foreground flex items-center gap-2 py-2">
                  <span className="group-open:rotate-90 transition-transform">▸</span>
                  Cycle insights & patterns
                </summary>
                <div className="mt-4 space-y-6">
                  <CycleInsights cycleStartDate={lastPeriod} />
                  <InsightsTab />
                </div>
              </details>
            )}
          </div>
        )}

        {/* ═══ CALENDAR TAB ═══ */}
        {activeTab === "calendar" && (
          <div className="space-y-8 md:space-y-10">
            <div className="flex items-center justify-between">
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="touch-btn p-2 active:bg-secondary rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
              <h3 className="font-display text-base md:text-lg italic text-foreground">
                {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="touch-btn p-2 active:bg-secondary rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
            </div>


            <div className="grid grid-cols-7 gap-1 text-center">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d, i) => (
                <div key={`${d}-${i}`} className="font-body text-[10px] text-muted-foreground py-1">{d}</div>
              ))}
              {calendarDays.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />;
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === todayStr;
                const cycleDay = lastPeriod ? getCycleDayForDate(lastPeriod, date) : null;
                const phase = cycleDay ? getPhaseFromDay(cycleDay) : null;
                const indicators = getDayIndicators(dateStr, lastPeriod);
                const moods = getMoods(dateStr);
                const weightVal = getWeight(dateStr);
                const wUnit = getWeightUnit();
                const displayWeight = weightVal
                  ? wUnit === "lbs"
                    ? `${Math.round(weightVal / 0.453592)}lb`
                    : `${weightVal % 1 === 0 ? weightVal : weightVal.toFixed(1)}kg`
                  : null;
                const shortWeight = displayWeight && displayWeight.length > 5
                  ? (wUnit === "lbs" ? `${Math.round(weightVal! / 0.453592)}lb` : `${Math.round(weightVal!)}kg`)
                  : displayWeight;

                // Period day fading: day 1 = strongest, day 5 = lightest
                const isPeriod = indicators.isPeriodDay && cycleDay !== null;
                const periodOpacity = isPeriod
                  ? cycleDay <= 2 ? 0.85 : cycleDay <= 3 ? 0.6 : cycleDay <= 4 ? 0.4 : 0.2
                  : 0;

                // Check if this date is a logged period end
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                const periodEnd = getPeriodEnd(monthKey);
                const isPeriodEnd = periodEnd === dateStr;
                const hasTraining = getLoggedWorkouts(dateStr).length > 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => { haptic("light"); setSelectedDate(dateStr); }}
                    className="touch-btn relative rounded-xl p-1 md:p-2 text-center transition-all active:bg-secondary min-h-[44px]"
                    style={{
                      ...(isPeriod ? {
                        backgroundColor: `rgba(196, 82, 110, ${periodOpacity})`,
                        borderRadius: "12px",
                      } : {}),
                      ...(isToday ? {
                        outline: '2px solid hsl(284, 22%, 44%)',
                        outlineOffset: -2,
                      } : {}),
                    }}
                  >
                    {/* Today center dot */}
                    {isToday && (
                      <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: 3, width: 4, height: 4, backgroundColor: 'hsl(284, 22%, 44%)' }} />
                    )}
                    <span className={`font-body text-xs ${isPeriod && cycleDay <= 3 ? "text-white font-medium" : "text-foreground"}`}>{date.getDate()}</span>
                    <div className="flex justify-center gap-[3px] mt-0.5 flex-wrap">
                      {/* Period end marker */}
                      {isPeriodEnd && (
                        <div className="rounded-full border-2" style={{ width: 6, height: 6, borderColor: "#C4526E", backgroundColor: "transparent" }} />
                      )}
                      {/* Mood flower icon */}
                      {moods.length > 0 && (
                        <svg width="8" height="8" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="8" cy="4" r="2.5" fill="#7F5B87" opacity="0.7" />
                          <circle cx="12" cy="8" r="2.5" fill="#7F5B87" opacity="0.7" />
                          <circle cx="4" cy="8" r="2.5" fill="#7F5B87" opacity="0.7" />
                          <circle cx="6" cy="12" r="2.5" fill="#7F5B87" opacity="0.7" />
                          <circle cx="10" cy="12" r="2.5" fill="#7F5B87" opacity="0.7" />
                          <circle cx="8" cy="8" r="2" fill="#9B89B4" />
                        </svg>
                      )}
                      {/* Symptom dot — amber */}
                      {indicators.hasSymptoms && (
                        <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: "#D49B4A" }} title="symptoms logged" />
                      )}
                      {/* Training dot — sage */}
                      {hasTraining && (
                        <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: "#7A9B6E" }} title="movement logged" />
                      )}
                      {/* Phase dot — mauve (non-period days) */}
                      {phase && !isPeriod && !isPeriodEnd && !indicators.hasSymptoms && !hasTraining && (
                        <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: "#9B89B4" }} />
                      )}
                    </div>
                    {shortWeight && (
                      <div className="mt-[1px]" onClick={(e) => { e.stopPropagation(); haptic("light"); setPopover({ dateStr, cycleDay, type: "weight" }); }}>
                        <span className="font-body text-muted-foreground leading-none" style={{ fontSize: "9px" }}>{shortWeight}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {popover && (
              <CalendarMoodPopover
                dateStr={popover.dateStr}
                cycleDay={popover.cycleDay}
                type={popover.type}
                onEdit={() => { setPopover(null); setSelectedDate(popover.dateStr); }}
                onClose={() => setPopover(null)}
              />
            )}

            {/* Month summary — below calendar */}
            <p className="font-body text-xs text-muted-foreground font-light text-center">
              {calendarMonth.toLocaleDateString("en-US", { month: "long" })}: {monthSummary.periodDays} period days · {monthSummary.symptomsLogged} symptoms logged · {monthSummary.moodsLogged} moods recorded
            </p>

            {/* Daily check-in — accessible from calendar */}
            <button
              onClick={() => { haptic("light"); setShowSymptomTracker(true); }}
              className="touch-btn w-full card-warm p-4 text-left flex items-center justify-between"
            >
              <div>
                <p className="font-display text-sm italic text-foreground">how are you feeling today?</p>
                <p className="font-body text-xs text-muted-foreground">tap to log symptoms, mood, and sleep</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-hand text-xs text-primary">+</span>
              </div>
            </button>

            {selectedDate && (
              <CalendarDaySheet
                dateStr={selectedDate}
                onClose={() => { setSelectedDate(null); setRefreshKey((k) => k + 1); }}
                onCycleUpdate={handleCycleUpdate}
              />
            )}
          </div>
        )}

        {/* ═══ LEARN TAB ═══ */}
        {activeTab === "learn" && (
          <div className="space-y-8">
            {hasDateSet && cycleMode !== "post-menopause" && (
              <PhaseLearnCard phase={info.phase} cycleDay={info.cycleDay} />
            )}
            <HormoneEducationHub />
          </div>
        )}

      </ContentSection>
    </div>
  );
}
