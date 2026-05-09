import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Baby } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_MEAL_PLANS, MEAT_MEAL_PLANS, Recipe } from "@/data/meal-plans";
import { findRecipeByName, findRecipeById } from "@/lib/recipe-index";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { RecipeShoppingButton, IngredientSearchLinks } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";
import { getWeeklyPlan } from "@/lib/weekly-planner";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_NUTRITION_FOCUS: Record<Phase, string> = {
  menstrual: "Iron-rich, gentle and warming",
  follicular: "Light, energising, high fibre",
  ovulatory: "Antioxidant-rich, raw and vibrant",
  luteal: "Warming, sustaining, magnesium-rich",
};

const WEEK_PHASES: { phase: Phase; startDay: number; endDay: number }[] = [
  { phase: "menstrual", startDay: 1, endDay: 7 },
  { phase: "follicular", startDay: 8, endDay: 14 },
  { phase: "ovulatory", startDay: 15, endDay: 21 },
  { phase: "luteal", startDay: 22, endDay: 28 },
];

interface DayMeals {
  cycleDay: number;
  calendarDate: Date | null;
  breakfast: { name: string; recipe?: Recipe };
  lunch: { name: string; recipe?: Recipe };
  dinner: { name: string; recipe?: Recipe };
}

interface PlansTabProps {
  phase: Phase;
  cycleDay: number;
}

export default function PlansTab({ phase, cycleDay }: PlansTabProps) {
  const { currentWeekNumber, currentCycleDay, getCalendarDateForCycleDay } = useCycle();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());

  const customPlan = useMemo(() => getWeeklyPlan(), []);

  // Build all 28 days grouped by phase-week
  const weekData = useMemo(() => {
    return WEEK_PHASES.map((week, weekIdx) => {
      const weekNum = weekIdx + 1;
      const plan = PHASE_MEAL_PLANS[week.phase];
      const days: DayMeals[] = [];

      for (let i = 0; i < 7; i++) {
        const cycleDay = week.startDay + i;
        const planDayIdx = i; // 0-6 within the phase
        const planDay = plan.days[planDayIdx];
        const calendarDate = getCalendarDateForCycleDay(cycleDay);

        if (planDay) {
          const bName = planDay.breakfast.split(" — ")[0];
          const lName = planDay.lunch.split(" — ")[0];
          const dName = planDay.dinner.split(" — ")[0];
          days.push({
            cycleDay,
            calendarDate,
            breakfast: { name: bName, recipe: findRecipeByName(bName) },
            lunch: { name: lName, recipe: findRecipeByName(lName) },
            dinner: { name: dName, recipe: findRecipeByName(dName) },
          });
        } else {
          // Phase has fewer than 7 days of data — repeat last day or leave placeholder
          const lastDay = plan.days[plan.days.length - 1];
          const bName = lastDay.breakfast.split(" — ")[0];
          const lName = lastDay.lunch.split(" — ")[0];
          const dName = lastDay.dinner.split(" — ")[0];
          days.push({
            cycleDay,
            calendarDate,
            breakfast: { name: bName, recipe: findRecipeByName(bName) },
            lunch: { name: lName, recipe: findRecipeByName(lName) },
            dinner: { name: dName, recipe: findRecipeByName(dName) },
          });
        }
      }

      return {
        weekNum,
        phase: week.phase,
        phaseColor: PHASE_HEX[week.phase],
        nutritionFocus: PHASE_NUTRITION_FOCUS[week.phase],
        isCurrentWeek: weekNum === currentWeekNumber,
        days,
      };
    });
  }, [currentWeekNumber, getCalendarDateForCycleDay]);

  const toggleWeek = (weekNum: number) => {
    setCollapsedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const weekday = date.toLocaleDateString("en-NZ", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("en-NZ", { month: "long" });
    return `${weekday} ${day} ${month}`;
  };

  const MealTile = ({ name, recipe, slot, phaseColor }: { name: string; recipe?: Recipe; slot: string; phaseColor: string }) => (
    <button
      onClick={() => {
        haptic("light");
        if (recipe) setSelectedRecipe(recipe);
      }}
      className="touch-card w-full text-left rounded-[16px] bg-card shadow-soft overflow-hidden"
    >
      <RecipeImage recipeName={name} recipeImage={recipe?.image} height={100} variant="card" />
      <div className="p-3">
        <span className="font-body text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: phaseColor }}>
          {slot}
        </span>
        <h3 className="font-display text-xs md:text-sm font-semibold text-foreground leading-tight line-clamp-2 mt-0.5">
          {name}
        </h3>
        {recipe && (
          <span className="font-body text-[10px] text-muted-foreground mt-1 block">{recipe.prepTime}</span>
        )}
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Phase badge — auto-updating */}
      <div>
        <span
          className="inline-block rounded-full px-3 py-1.5 font-body text-sm font-bold"
          style={{ backgroundColor: `${PHASE_HEX[phase]}15`, color: PHASE_HEX[phase] }}
        >
          {PHASE_SHORT[phase].toLowerCase()} · D{currentCycleDay}
        </span>
        <p className="font-body text-sm italic text-muted-foreground mt-2">
          Your 28-day plan updates automatically as your cycle moves.
        </p>
      </div>

      {/* Week sections */}
      {weekData.map((week) => {
        const isCollapsed = collapsedWeeks.has(week.weekNum);
        return (
          <div key={week.weekNum} className="space-y-4">
            {/* Week header */}
            <button
              onClick={() => {
                haptic("light");
                toggleWeek(week.weekNum);
              }}
              className="touch-btn w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: week.phaseColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold" style={{ color: week.phaseColor }}>
                      Week {week.weekNum} — {PHASE_SHORT[week.phase]}
                    </h3>
                    {week.isCurrentWeek && (
                      <span
                        className="rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: week.phaseColor }}
                      >
                        This week
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-muted-foreground italic mt-0.5">
                    {week.nutritionFocus}
                  </p>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </button>

            {/* Day list */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 pl-4">
                    {week.days.map((dm) => {
                      const isExpanded = expandedDay === dm.cycleDay;
                      const isToday = dm.cycleDay === currentCycleDay;
                      return (
                        <div key={dm.cycleDay} className="space-y-3">
                          <button
                            onClick={() => {
                              haptic("light");
                              setExpandedDay(isExpanded ? null : dm.cycleDay);
                            }}
                            className="touch-btn flex items-center gap-3 w-full"
                          >
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center font-body text-sm font-bold flex-shrink-0"
                              style={{
                                backgroundColor: isToday ? week.phaseColor : `${week.phaseColor}20`,
                                color: isToday ? "white" : week.phaseColor,
                              }}
                            >
                              {dm.cycleDay}
                            </span>
                            <div className="flex-1 text-left min-w-0">
                              <span className="font-body text-sm font-bold block" style={{ color: week.phaseColor }}>
                                Day {dm.cycleDay}
                                {isToday && (
                                  <span className="font-body text-[10px] font-bold ml-1.5 uppercase tracking-wider opacity-70">
                                    today
                                  </span>
                                )}
                              </span>
                              <span className="font-body text-xs text-muted-foreground block">
                                {formatDate(dm.calendarDate)}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {/* 3 meal tiles */}
                          <div className="grid grid-cols-3 gap-3 pl-11">
                            <MealTile name={dm.breakfast.name} recipe={dm.breakfast.recipe} slot="Breakfast" phaseColor={week.phaseColor} />
                            <MealTile name={dm.lunch.name} recipe={dm.lunch.recipe} slot="Lunch" phaseColor={week.phaseColor} />
                            <MealTile name={dm.dinner.name} recipe={dm.dinner.recipe} slot="Dinner" phaseColor={week.phaseColor} />
                          </div>

                          {/* Expanded detail */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-11 space-y-3 pt-1">
                                  {[
                                    { slot: "Breakfast", meal: dm.breakfast },
                                    { slot: "Lunch", meal: dm.lunch },
                                    { slot: "Dinner", meal: dm.dinner },
                                  ].map(({ slot, meal }) => (
                                    <div key={slot} className="rounded-[14px] bg-card shadow-soft p-4">
                                      <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: week.phaseColor }}>{slot}</p>
                                      <p className="font-display text-sm font-semibold text-foreground mt-1">{meal.name}</p>
                                      {meal.recipe && (
                                        <div className="mt-2">
                                          <p className="font-body text-xs text-muted-foreground">
                                            {meal.recipe.ingredients.slice(0, 5).join(", ")}
                                            {meal.recipe.ingredients.length > 5 && "..."}
                                          </p>
                                          <p className="font-body text-xs text-muted-foreground mt-1">
                                            {meal.recipe.prepTime} · Serves {meal.recipe.serves}
                                          </p>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Recipe detail bottom sheet */}
      <AnimatePresence>
        {selectedRecipe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSelectedRecipe(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] border-t border-border"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="bottom-sheet-handle" />
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSelectedRecipe(null)} className="touch-btn p-2 rounded-full bg-secondary">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <RecipeImage recipeName={selectedRecipe.name} recipeImage={selectedRecipe.image} height={180} variant="detail" />

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="rounded-full px-2.5 py-1 font-body text-xs font-bold"
                      style={{ backgroundColor: `${PHASE_HEX[selectedRecipe.phase]}15`, color: PHASE_HEX[selectedRecipe.phase] }}
                    >
                      {PHASE_SHORT[selectedRecipe.phase]}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">{selectedRecipe.prepTime}</span>
                    <span className="font-body text-xs text-muted-foreground">Serves {selectedRecipe.serves}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{selectedRecipe.name}</h2>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedRecipe.keyNutrients.map((n) => (
                    <span
                      key={n}
                      className="rounded-full px-2.5 py-0.5 font-body text-xs font-bold uppercase"
                      style={{ backgroundColor: `${PHASE_HEX[selectedRecipe.phase]}15`, color: PHASE_HEX[selectedRecipe.phase] }}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-sm font-semibold" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>Ingredients</p>
                    <RecipeShoppingButton
                      recipeId={selectedRecipe.id}
                      recipeName={selectedRecipe.name}
                      ingredients={selectedRecipe.ingredients}
                    />
                  </div>
                  <IngredientSearchLinks ingredients={selectedRecipe.ingredients} />
                </div>

                <BotanicalSprig width={100} opacity={0.15} />

                <div>
                  <p className="font-body text-sm font-semibold mb-3" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>Method</p>
                  <ol className="space-y-2">
                    {selectedRecipe.method.map((step, j) => (
                      <li key={j} className="font-body text-sm text-muted-foreground leading-relaxed">
                        {j + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="font-display text-sm italic" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>
                  {selectedRecipe.phaseBenefit}
                </p>

                {selectedRecipe.kidAlternative && (
                  <KidAlternativeNote text={selectedRecipe.kidAlternative} phaseColor={PHASE_HEX[selectedRecipe.phase]} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── A version for the little ones ── */
function KidAlternativeNote({ text, phaseColor }: { text: string; phaseColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-secondary/40 border border-border/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="touch-btn w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Baby className="h-3.5 w-3.5" style={{ color: phaseColor }} />
          <span className="font-display text-xs italic" style={{ color: phaseColor }}>
            A version for the little ones
          </span>
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-body text-xs text-muted-foreground leading-relaxed px-4 pb-4">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
