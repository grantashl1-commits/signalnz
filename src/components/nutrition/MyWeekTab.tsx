import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCycle } from "@/contexts/CycleContext";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, MEAT_MEAL_PLANS, TODAY_MEALS } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import { haptic } from "@/hooks/use-mobile";
import { formatDateShort } from "@/lib/weekly-planner";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_FOCUS: Record<Phase, string> = {
  menstrual: "Iron-rich, gentle and warming",
  follicular: "Light, energising, high fibre",
  ovulatory: "Antioxidant-rich, raw and vibrant",
  luteal: "Warming, sustaining, magnesium-rich",
};

const PHASE_SNACKS: Record<Phase, { morning: string; afternoon: string }> = {
  menstrual: { morning: "Dark chocolate & trail mix", afternoon: "Turmeric latte" },
  follicular: { morning: "Fermented cashew yoghurt with kiwi", afternoon: "Edamame with sea salt" },
  ovulatory: { morning: "Fresh fruit salad with mint", afternoon: "Almonds & fresh berries" },
  luteal: { morning: "Apple slices with tahini", afternoon: "Chocolate banana nice cream" },
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getPhaseFromCycleDay(cycleDay: number): Phase {
  if (cycleDay >= 1 && cycleDay <= 5) return "menstrual";
  if (cycleDay >= 6 && cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

function getPlanMeals(cycleDay: number) {
  const phase = getPhaseFromCycleDay(cycleDay);
  const plan = PHASE_MEAL_PLANS[phase];

  // Map cycle day to day index within phase
  const phaseRanges: Record<Phase, [number, number]> = {
    menstrual: [1, 7],
    follicular: [8, 14],
    ovulatory: [15, 21],
    luteal: [22, 28],
  };
  const [start] = phaseRanges[phase];
  const dayIndex = (cycleDay - start) % plan.days.length;

  const dayPlan = plan.days[Math.max(0, dayIndex)];
  return {
    phase,
    breakfast: dayPlan.breakfast.split(" — ")[0],
    lunch: dayPlan.lunch.split(" — ")[0],
    dinner: dayPlan.dinner.split(" — ")[0],
  };
}

function getMondayOfWeek(date: Date, weekOffset: number = 0): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = (dayOfWeek + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNameShort: string;
  cycleDay: number;
  phase: Phase;
  breakfast: string;
  lunch: string;
  dinner: string;
  isToday: boolean;
}

export default function MyWeekTab() {
  const { currentPhase, currentCycleDay, getCycleDayForDate } = useCycle();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const weekData = useMemo(() => {
    const monday = getMondayOfWeek(new Date(), weekOffset);
    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const cycleDay = getCycleDayForDate(date);
      const meals = getPlanMeals(cycleDay);
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        date,
        dateStr,
        dayName: DAY_NAMES[i],
        dayNameShort: DAY_NAMES_SHORT[i],
        cycleDay,
        phase: meals.phase,
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        isToday: dateStr === todayStr,
      });
    }

    // Determine dominant phase for header
    const phaseCounts: Record<Phase, number> = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
    days.forEach(d => phaseCounts[d.phase]++);
    const dominantPhase = (Object.entries(phaseCounts) as [Phase, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    return { days, monday, dominantPhase };
  }, [weekOffset, getCycleDayForDate, todayStr]);

  const { days, monday, dominantPhase } = weekData;
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const phaseColor = PHASE_HEX[dominantPhase];

  const headerLabel = `${dominantPhase.charAt(0).toUpperCase() + dominantPhase.slice(1)} Week`;
  const dateRangeLabel = `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;

  return (
    <div className="space-y-5">
      {/* Header with navigation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => { haptic("light"); setWeekOffset(o => o - 1); setExpandedDay(null); }}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="text-center">
            <h2 className="font-display text-2xl font-bold italic text-foreground">{headerLabel}</h2>
            <p className="font-body text-sm mt-0.5" style={{ color: phaseColor }}>
              {dateRangeLabel}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {PHASE_FOCUS[dominantPhase]}
            </p>
          </div>

          <button
            onClick={() => { haptic("light"); setWeekOffset(o => o + 1); setExpandedDay(null); }}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {weekOffset !== 0 && (
          <button
            onClick={() => { haptic("light"); setWeekOffset(0); setExpandedDay(null); }}
            className="mx-auto block font-body text-xs text-muted-foreground underline mt-1"
          >
            Back to this week
          </button>
        )}
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {days.map((day, i) => {
          const expanded = expandedDay === i;
          const dayPhaseColor = PHASE_HEX[day.phase];
          const bRecipe = findRecipeByName(day.breakfast);
          const lRecipe = findRecipeByName(day.lunch);
          const dRecipe = findRecipeByName(day.dinner);
          const snacks = PHASE_SNACKS[day.phase];

          return (
            <div
              key={day.dateStr}
              className="rounded-[18px] bg-card shadow-soft overflow-hidden relative"
              style={day.isToday ? { boxShadow: `0 4px 20px ${dayPhaseColor}20` } : {}}
            >
              {day.isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px]" style={{ backgroundColor: dayPhaseColor }} />
              )}

              <button
                onClick={() => { haptic("light"); setExpandedDay(expanded ? null : i); }}
                className="touch-card w-full text-left p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className={day.isToday ? "pl-2" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-sm font-bold text-foreground">{day.dayName}</span>
                      <span className="font-body text-xs text-muted-foreground">
                        {day.date.toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}
                      </span>
                      {day.isToday && (
                        <span
                          className="font-body text-[11px] font-bold rounded-full px-2.5 py-0.5"
                          style={{ backgroundColor: `${dayPhaseColor}15`, color: dayPhaseColor }}
                        >
                          Today
                        </span>
                      )}
                      <span
                        className="font-body text-[10px] font-medium rounded-full px-2 py-0.5 bg-secondary"
                        style={{ color: dayPhaseColor }}
                      >
                        D{day.cycleDay}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Breakfast</span> {day.breakfast}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Lunch</span> {day.lunch}
                      </p>
                      <p className="font-body text-sm text-foreground">
                        <span className="font-semibold text-muted-foreground w-[70px] inline-block">Dinner</span> {day.dinner}
                      </p>
                    </div>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-5 pb-4 pt-2 border-t border-border space-y-3">
                      {[
                        { label: "Breakfast", name: day.breakfast, recipe: bRecipe },
                        { label: "Morning Snack", name: snacks.morning },
                        { label: "Lunch", name: day.lunch, recipe: lRecipe },
                        { label: "Afternoon Snack", name: snacks.afternoon },
                        { label: "Dinner", name: day.dinner, recipe: dRecipe },
                      ].map(({ label, name, recipe }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex items-start gap-3">
                            {recipe?.image && (
                              <img src={recipe.image} alt={name} className="h-12 w-12 rounded-lg object-contain bg-secondary/20 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: dayPhaseColor }}>{label}</p>
                              <p className="font-body text-sm text-foreground mt-0.5">{name}</p>
                              {recipe && (
                                <p className="font-body text-xs text-muted-foreground mt-0.5">
                                  {recipe.prepTime} · Serves {recipe.serves}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Ingredients & method for recipes */}
                          {recipe && (
                            <div className="ml-0 mt-2 space-y-2 pl-0">
                              {recipe.keyNutrients.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {recipe.keyNutrients.map(n => (
                                    <span key={n} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                      {n}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div>
                                <p className="font-body text-xs font-semibold text-foreground mb-1">Ingredients</p>
                                <ul className="space-y-0.5">
                                  {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="font-body text-xs text-muted-foreground">• {ing}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-body text-xs font-semibold text-foreground mb-1">Method</p>
                                <ol className="space-y-1">
                                  {recipe.method.map((step, idx) => (
                                    <li key={idx} className="font-body text-xs text-muted-foreground">
                                      <span className="font-semibold text-foreground">{idx + 1}.</span> {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                              {recipe.phaseBenefit && (
                                <p className="font-body text-xs italic text-muted-foreground mt-1">
                                  💡 {recipe.phaseBenefit}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
