import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, Users, Sparkles, Leaf, Plus } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import RecipeImage from "@/components/nutrition/RecipeImage";
import SeedCyclingCard from "@/components/nutrition/SeedCyclingCard";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { getAIMealPlan, type AIMeal } from "@/lib/weekly-planner";
import { getNutritionTargetForGoal, getLatestBodyMetrics } from "@/lib/fitness-profile";
import { getTodayInsight, SUPPLEMENT_GUIDE } from "@/data/nutrition-insights";
import { usePlantTracker } from "@/hooks/usePlantTracker";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_SNACKS: Record<Phase, { morning: { name: string; benefit: string }; afternoon: { name: string; benefit: string } }> = {
  menstrual: {
    morning: { name: "Warm cacao with oat milk & cinnamon", benefit: "Magnesium-rich cacao eases cramps and lifts mood." },
    afternoon: { name: "Dates stuffed with almond butter", benefit: "Natural iron and sweetness to replenish energy." },
  },
  follicular: {
    morning: { name: "Apple slices with almond butter", benefit: "Fibre and healthy fats fuel rising energy levels." },
    afternoon: { name: "Edamame with sea salt & sesame", benefit: "Phytoestrogens support healthy estrogen metabolism." },
  },
  ovulatory: {
    morning: { name: "Fresh berries with hemp seeds", benefit: "Antioxidants protect egg quality during ovulation." },
    afternoon: { name: "Cucumber & avocado rice paper rolls", benefit: "Light, hydrating, and rich in folate." },
  },
  luteal: {
    morning: { name: "Dark chocolate & walnuts", benefit: "Magnesium and omega-3s reduce PMS symptoms." },
    afternoon: { name: "Banana with tahini & cinnamon", benefit: "B6 from banana supports progesterone production." },
  },
};

// Estimated macros for static snacks per phase
const SNACK_MACROS: Record<Phase, { morning: { cal: number; p: number; c: number; f: number }; afternoon: { cal: number; p: number; c: number; f: number } }> = {
  menstrual: { morning: { cal: 180, p: 3, c: 18, f: 10 }, afternoon: { cal: 210, p: 4, c: 32, f: 8 } },
  follicular: { morning: { cal: 200, p: 5, c: 20, f: 12 }, afternoon: { cal: 140, p: 11, c: 8, f: 7 } },
  ovulatory: { morning: { cal: 150, p: 5, c: 18, f: 7 }, afternoon: { cal: 120, p: 2, c: 10, f: 8 } },
  luteal: { morning: { cal: 190, p: 4, c: 12, f: 14 }, afternoon: { cal: 170, p: 3, c: 28, f: 6 } },
};

function getPlanDayForCycleDay(cycleDay: number) {
  if (cycleDay <= 7) return { phase: "menstrual" as Phase, dayIndex: cycleDay - 1 };
  if (cycleDay <= 14) return { phase: "follicular" as Phase, dayIndex: cycleDay - 8 };
  if (cycleDay <= 21) return { phase: "ovulatory" as Phase, dayIndex: cycleDay - 15 };
  return { phase: "luteal" as Phase, dayIndex: cycleDay - 22 };
}

// Simple macro estimates for static recipes
function estimateMealMacros(recipe?: Recipe, aiMeal?: AIMeal): { cal: number; p: number; c: number; f: number } | null {
  if (aiMeal) {
    const ai = aiMeal as any;
    if (ai.calories || ai.protein) {
      return {
        cal: parseInt(ai.calories) || 400,
        p: parseInt(ai.protein) || 25,
        c: parseInt(ai.carbs) || 45,
        f: parseInt(ai.fat) || 15,
      };
    }
  }
  if (recipe) {
    const n = (recipe as any).nutrition;
    if (n) return { cal: n.calories || 400, p: n.protein || 25, c: n.carbs || 45, f: n.fat || 15 };
    // Estimate from ingredients count
    return { cal: 380, p: 22, c: 42, f: 14 };
  }
  return { cal: 380, p: 22, c: 42, f: 14 };
}

export default function TodayTab() {
  const { currentCycleDay, currentPhase } = useCycle();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [plantInput, setPlantInput] = useState("");
  const [portionScale, setPortionScale] = useState<Record<string, number>>({});
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored: Record<string, boolean> = {};
    ["breakfast", "lunch", "dinner", "morning-snack", "afternoon-snack"].forEach((slot) => {
      if (localStorage.getItem(`eaten:${today}:${slot}`) === "true") stored[slot] = true;
    });
    return stored;
  });

  const { plants, count: plantCount, message: plantMessage, addPlant } = usePlantTracker();

  const cycleMode = useMemo(() => {
    try { return localStorage.getItem("signal_cycle_mode") || "cycling"; } catch { return "cycling"; }
  }, []);

  const goalSlug = useMemo(() => {
    try { return localStorage.getItem("signal_goal_slug") || ""; } catch { return ""; }
  }, []);

  const metrics = useMemo(() => getLatestBodyMetrics(), []);
  const nutritionTarget = useMemo(() => {
    if (!goalSlug) return null;
    return getNutritionTargetForGoal(goalSlug, metrics?.weight || undefined, cycleMode);
  }, [goalSlug, metrics, cycleMode]);

  const todayInsight = useMemo(() => getTodayInsight(currentPhase, cycleMode, goalSlug), [currentPhase, cycleMode, goalSlug]);

  const aiPlan = useMemo(() => getAIMealPlan(), []);
  const aiToday = useMemo(() => {
    if (!aiPlan) return null;
    return aiPlan.days.find(d => d.cycleDay === currentCycleDay) || null;
  }, [aiPlan, currentCycleDay]);

  const { phase: planPhase, dayIndex } = getPlanDayForCycleDay(currentCycleDay);
  const plan = PHASE_MEAL_PLANS[planPhase];
  const dayPlan = plan.days[Math.min(dayIndex, plan.days.length - 1)];

  const meals = useMemo(() => {
    if (aiToday) {
      return [
        { slot: "breakfast", label: "Breakfast", name: aiToday.breakfast.name, recipe: findRecipeByName(aiToday.breakfast.name), aiMeal: aiToday.breakfast },
        { slot: "lunch", label: "Lunch", name: aiToday.lunch.name, recipe: findRecipeByName(aiToday.lunch.name), aiMeal: aiToday.lunch },
        { slot: "dinner", label: "Dinner", name: aiToday.dinner.name, recipe: findRecipeByName(aiToday.dinner.name), aiMeal: aiToday.dinner },
      ];
    }
    if (!dayPlan) return [];
    return [
      { slot: "breakfast", label: "Breakfast", name: dayPlan.breakfast },
      { slot: "lunch", label: "Lunch", name: dayPlan.lunch },
      { slot: "dinner", label: "Dinner", name: dayPlan.dinner },
    ].map(s => ({ ...s, recipe: findRecipeByName(s.name), aiMeal: undefined as AIMeal | undefined }));
  }, [dayPlan, aiToday]);

  const phaseColor = PHASE_HEX[currentPhase];
  const snacks = PHASE_SNACKS[currentPhase];
  const snackMacros = SNACK_MACROS[currentPhase];

  const markEaten = (slot: string) => {
    haptic("medium");
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`eaten:${today}:${slot}`, "true");
    setEaten(prev => ({ ...prev, [slot]: true }));
  };

  const getScale = (slot: string) => portionScale[slot] || 1;
  const setScale = (slot: string, val: number) => {
    setPortionScale(prev => ({ ...prev, [slot]: val }));
  };

  const handleAddPlant = () => {
    if (plantInput.trim()) {
      addPlant(plantInput.trim());
      setPlantInput("");
      haptic("light");
    }
  };

  // Calculate daily macro totals from eaten meals
  const dailyMacros = useMemo(() => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    
    meals.forEach(meal => {
      if (eaten[meal.slot]) {
        const macros = estimateMealMacros(meal.recipe, meal.aiMeal);
        const scale = getScale(meal.slot);
        if (macros) {
          totalCal += Math.round(macros.cal * scale);
          totalP += Math.round(macros.p * scale);
          totalC += Math.round(macros.c * scale);
          totalF += Math.round(macros.f * scale);
        }
      }
    });
    
    if (eaten["morning-snack"]) {
      const s = getScale("morning-snack");
      totalCal += Math.round(snackMacros.morning.cal * s);
      totalP += Math.round(snackMacros.morning.p * s);
      totalC += Math.round(snackMacros.morning.c * s);
      totalF += Math.round(snackMacros.morning.f * s);
    }
    if (eaten["afternoon-snack"]) {
      const s = getScale("afternoon-snack");
      totalCal += Math.round(snackMacros.afternoon.cal * s);
      totalP += Math.round(snackMacros.afternoon.p * s);
      totalC += Math.round(snackMacros.afternoon.c * s);
      totalF += Math.round(snackMacros.afternoon.f * s);
    }
    
    return { cal: totalCal, p: totalP, c: totalC, f: totalF };
  }, [eaten, meals, portionScale, snackMacros]);

  // Targets
  const macroTargets = useMemo(() => {
    if (nutritionTarget) {
      const calTarget = nutritionTarget.calorieNote?.match(/\d+/)?.[0];
      const cal = calTarget ? parseInt(calTarget) : 1800;
      return {
        cal,
        p: nutritionTarget.dailyProteinMax || 120,
        c: Math.round(cal * 0.45 / 4),
        f: Math.round(cal * 0.3 / 9),
      };
    }
    return { cal: 1800, p: 100, c: 200, f: 60 };
  }, [nutritionTarget]);

  if (!dayPlan && !aiToday) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center space-y-4 shadow-soft">
        <Sparkles className="h-10 w-10 mx-auto text-primary/40" />
        <h3 className="font-display text-xl font-bold text-foreground">No meal plan yet</h3>
        <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
          Complete your meal plan setup to see today's personalised meals here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-card-title font-bold italic text-foreground">Today's Nourishment</h2>
        <p className="font-body text-body-lg text-muted-foreground mt-1">
          {PHASE_SHORT[currentPhase]} phase · Day {currentCycleDay}
          {aiToday && <span className="text-primary ml-2">· AI plan</span>}
        </p>
      </div>

      {/* Protein ring / nutrition target card */}
      {nutritionTarget && (
        <div className="rounded-[18px] bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Daily Protein Target</p>
              <p className="font-body text-2xl font-bold text-foreground mt-1">
                {nutritionTarget.dailyProteinMin}–{nutritionTarget.dailyProteinMax}g
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{nutritionTarget.calorieNote}</p>
            </div>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={phaseColor} strokeWidth="4"
                  strokeDasharray={`${28 * 2 * Math.PI * 0.65} ${28 * 2 * Math.PI}`}
                  strokeLinecap="round" transform="rotate(-90 32 32)" className="transition-all" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-body text-[10px] font-bold text-foreground">
                {nutritionTarget.proteinMin}g/kg
              </span>
            </div>
          </div>
          {(cycleMode === "perimenopause" || cycleMode === "post_menopause") && (
            <p className="font-body text-[11px] text-primary italic">
              Perimenopause: aim for 30g+ protein per meal to overcome anabolic resistance.
            </p>
          )}
        </div>
      )}

      {/* Daily insight card */}
      <div className="rounded-[18px] p-4 shadow-soft" style={{ backgroundColor: `${phaseColor}08`, borderLeft: `3px solid ${phaseColor}` }}>
        <p className="font-display text-sm italic text-foreground leading-relaxed">"{todayInsight.text}"</p>
        {todayInsight.source && (
          <p className="font-body text-[10px] text-muted-foreground mt-2">— {todayInsight.source}</p>
        )}
      </div>

      {/* 3-column meal cards */}
      <div>
        <h3 className="font-display text-card-title font-bold text-foreground mb-3">Meals</h3>
        <div className="grid grid-cols-3 gap-2">
          {meals.map((meal, i) => (
            <CompactMealCard
              key={meal.slot}
              slot={meal.slot}
              label={meal.label}
              name={meal.name}
              recipe={meal.recipe}
              aiMeal={meal.aiMeal}
              isExpanded={expandedMeal === meal.slot}
              isEaten={!!eaten[meal.slot]}
              phaseColor={phaseColor}
              scale={getScale(meal.slot)}
              onToggleExpand={() => { haptic("light"); setExpandedMeal(expandedMeal === meal.slot ? null : meal.slot); }}
              onMarkEaten={() => markEaten(meal.slot)}
              onScaleChange={(v) => setScale(meal.slot, v)}
            />
          ))}
        </div>
      </div>

      {/* Expanded meal detail */}
      <AnimatePresence>
        {expandedMeal && (
          <ExpandedMealDetail
            meal={meals.find(m => m.slot === expandedMeal)!}
            isEaten={!!eaten[expandedMeal]}
            phaseColor={phaseColor}
            scale={getScale(expandedMeal)}
            onMarkEaten={() => markEaten(expandedMeal)}
            onScaleChange={(v) => setScale(expandedMeal, v)}
            onClose={() => setExpandedMeal(null)}
          />
        )}
      </AnimatePresence>

      {/* Snacks */}
      <div className="space-y-3">
        <h3 className="font-display text-card-title font-bold text-foreground">Snacks</h3>
        <SnackCard label="Morning Snack" name={snacks.morning.name} benefit={snacks.morning.benefit} slot="morning-snack" isEaten={!!eaten["morning-snack"]} phaseColor={phaseColor} macros={snackMacros.morning} scale={getScale("morning-snack")} onMarkEaten={() => markEaten("morning-snack")} onScaleChange={(v) => setScale("morning-snack", v)} />
        <SnackCard label="Afternoon Snack" name={snacks.afternoon.name} benefit={snacks.afternoon.benefit} slot="afternoon-snack" isEaten={!!eaten["afternoon-snack"]} phaseColor={phaseColor} macros={snackMacros.afternoon} scale={getScale("afternoon-snack")} onMarkEaten={() => markEaten("afternoon-snack")} onScaleChange={(v) => setScale("afternoon-snack", v)} />
      </div>

      {/* Seed cycling */}
      <SeedCyclingCard cycleDay={currentCycleDay} phase={currentPhase} />

      {/* Macro summary ring */}
      <MacroRing consumed={dailyMacros} targets={macroTargets} phaseColor={phaseColor} />

      {/* Plant diversity tracker - at bottom */}
      <div className="rounded-[18px] bg-card p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4" style={{ color: "#4CAF50" }} />
            <span className="font-body text-sm font-medium text-foreground">🌱 {plantCount} / 30 plants this week</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (plantCount / 30) * 100)}%`, backgroundColor: "#4CAF50" }} />
        </div>
        <p className="font-body text-[11px] text-muted-foreground italic">{plantMessage}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={plantInput}
            onChange={e => setPlantInput(e.target.value)}
            placeholder="Add a plant..."
            className="flex-1 rounded-lg bg-secondary px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            onKeyDown={e => { if (e.key === "Enter") handleAddPlant(); }}
          />
          <button onClick={handleAddPlant} disabled={!plantInput.trim()} className="touch-btn rounded-lg px-3 py-2 bg-primary/10 text-primary disabled:opacity-40">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {plants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {plants.slice(-8).map(p => (
              <span key={p} className="rounded-full px-2 py-0.5 font-body text-[9px] bg-secondary text-muted-foreground capitalize">{p}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Compact 3-column Meal Card ── */
function CompactMealCard({ slot, label, name, recipe, aiMeal, isExpanded, isEaten, phaseColor, scale, onToggleExpand, onMarkEaten, onScaleChange }: {
  slot: string; label: string; name: string; recipe?: Recipe; aiMeal?: AIMeal;
  isExpanded: boolean; isEaten: boolean; phaseColor: string; scale: number;
  onToggleExpand: () => void; onMarkEaten: () => void; onScaleChange: (v: number) => void;
}) {
  const macros = estimateMealMacros(recipe, aiMeal);

  return (
    <div className="rounded-[14px] bg-card shadow-soft overflow-hidden">
      <RecipeImage recipeName={name} recipeImage={recipe?.image} height={80} variant="card" />
      <div className="p-2 space-y-1.5">
        <p className="font-body text-[9px] uppercase tracking-wider font-medium" style={{ color: phaseColor }}>{label}</p>
        <p className="font-display text-[11px] italic text-foreground leading-tight line-clamp-2">{name}</p>
        
        {macros && (
          <div className="space-y-0.5">
            <p className="font-body text-[8px] text-muted-foreground">{Math.round(macros.cal * scale)} cal</p>
            <p className="font-body text-[8px] text-muted-foreground">P:{Math.round(macros.p * scale)}g C:{Math.round(macros.c * scale)}g F:{Math.round(macros.f * scale)}g</p>
          </div>
        )}

        <button
          onClick={onToggleExpand}
          className="w-full touch-btn rounded-lg py-1.5 font-body text-[10px] font-medium transition-all"
          style={{ backgroundColor: `${phaseColor}10`, color: phaseColor }}
        >
          {isExpanded ? "Close" : "Expand"}
        </button>
      </div>
    </div>
  );
}

/* ── Expanded Meal Detail ── */
function ExpandedMealDetail({ meal, isEaten, phaseColor, scale, onMarkEaten, onScaleChange, onClose }: {
  meal: { slot: string; label: string; name: string; recipe?: Recipe; aiMeal?: AIMeal };
  isEaten: boolean; phaseColor: string; scale: number;
  onMarkEaten: () => void; onScaleChange: (v: number) => void; onClose: () => void;
}) {
  const [showMethod, setShowMethod] = useState(false);
  const ingredients = meal.aiMeal?.ingredients || meal.recipe?.ingredients || [];
  const method = meal.aiMeal?.method || meal.recipe?.method || [];
  const benefit = meal.aiMeal?.nutritionalNote || meal.recipe?.phaseBenefit || "";
  const macros = estimateMealMacros(meal.recipe, meal.aiMeal);

  const SCALES = [0.5, 1, 1.5, 2];

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="rounded-[18px] bg-card shadow-soft p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-section-label uppercase font-medium" style={{ color: phaseColor }}>{meal.label}</p>
            <h3 className="font-display text-lg font-bold text-foreground">{meal.name}</h3>
          </div>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Portion selector */}
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground">Portion:</span>
          {SCALES.map(s => (
            <button key={s} onClick={() => { haptic("light"); onScaleChange(s); }}
              className={`touch-btn rounded-full px-3 py-1.5 font-body text-[10px] font-medium transition-all ${scale === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {s}x
            </button>
          ))}
        </div>

        {/* Macros display */}
        {macros && (
          <div className="flex gap-3">
            {[
              { label: "Cal", value: Math.round(macros.cal * scale) },
              { label: "Protein", value: `${Math.round(macros.p * scale)}g` },
              { label: "Carbs", value: `${Math.round(macros.c * scale)}g` },
              { label: "Fat", value: `${Math.round(macros.f * scale)}g` },
            ].map(m => (
              <div key={m.label} className="flex-1 rounded-lg bg-secondary p-2 text-center">
                <p className="font-body text-[10px] text-muted-foreground">{m.label}</p>
                <p className="font-body text-sm font-bold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {benefit && <p className="font-body text-body-lg text-muted-foreground leading-relaxed">{benefit.split(".")[0]}.</p>}

        {ingredients.length > 0 && (
          <div>
            <p className="font-body text-section-label uppercase font-semibold mb-2" style={{ color: phaseColor }}>Ingredients</p>
            <ul className="space-y-1">
              {ingredients.map((ing, idx) => (
                <li key={idx} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/40 mt-1">•</span> {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {method.length > 0 && (
          <>
            <button onClick={() => { haptic("light"); setShowMethod(!showMethod); }} className="touch-btn flex items-center gap-1.5 font-body text-sm font-medium" style={{ color: phaseColor }}>
              {showMethod ? "Hide method" : "How to make it"}
              {showMethod ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {showMethod && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <ol className="space-y-2 pt-2">
                    {method.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="font-body text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: phaseColor }}>{idx + 1}.</span>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
          className="touch-btn w-full rounded-full py-3 min-h-[44px] font-body text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
          {isEaten ? (<>Eaten <WildStar size={14} color="white" /></>) : "Mark as eaten"}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Snack Card ── */
function SnackCard({ label, name, benefit, slot, isEaten, phaseColor, macros, scale, onMarkEaten, onScaleChange }: {
  label: string; name: string; benefit: string; slot: string;
  isEaten: boolean; phaseColor: string;
  macros: { cal: number; p: number; c: number; f: number };
  scale: number;
  onMarkEaten: () => void;
  onScaleChange: (v: number) => void;
}) {
  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft space-y-3">
      <div className="min-w-0">
        <p className="font-body text-section-label uppercase font-medium mb-1" style={{ color: 'hsl(var(--label-color))' }}>{label}</p>
        <p className="font-display text-card-title font-semibold text-foreground leading-tight">{name}</p>
        <p className="font-body text-body-lg text-muted-foreground mt-1 leading-relaxed">{benefit}</p>
        <div className="flex gap-2 mt-2">
          <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{Math.round(macros.cal * scale)} cal</span>
          <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">P:{Math.round(macros.p * scale)}g</span>
          <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">C:{Math.round(macros.c * scale)}g</span>
          <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">F:{Math.round(macros.f * scale)}g</span>
        </div>
        {/* Portion selector */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="font-body text-[10px] text-muted-foreground">Portion:</span>
          {[0.5, 1, 1.5, 2].map(s => (
            <button key={s} onClick={() => { haptic("light"); onScaleChange(s); }}
              className={`touch-btn rounded-full px-2 py-1 font-body text-[9px] font-medium transition-all ${scale === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
        className="touch-btn rounded-full py-2 px-5 min-h-[36px] font-body text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
        {isEaten ? (<>Logged <WildStar size={12} color="white" /></>) : "Log it"}
      </button>
    </div>
  );
}

/* ── Macro Ring Summary ── */
function MacroRing({ consumed, targets, phaseColor }: {
  consumed: { cal: number; p: number; c: number; f: number };
  targets: { cal: number; p: number; c: number; f: number };
  phaseColor: string;
}) {
  const macros = [
    { label: "Calories", consumed: consumed.cal, target: targets.cal, color: phaseColor, unit: "" },
    { label: "Protein", consumed: consumed.p, target: targets.p, color: "#4CAF50", unit: "g" },
    { label: "Carbs", consumed: consumed.c, target: targets.c, color: "#FF9800", unit: "g" },
    { label: "Fat", consumed: consumed.f, target: targets.f, color: "#2196F3", unit: "g" },
  ];

  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft">
      <h3 className="font-display text-card-title font-bold text-foreground mb-4">Today's Macros</h3>
      <div className="grid grid-cols-4 gap-3">
        {macros.map(m => {
          const pct = Math.min(100, targets.cal > 0 ? (m.consumed / m.target) * 100 : 0);
          const circumference = 2 * Math.PI * 22;
          const dashArray = `${(pct / 100) * circumference} ${circumference}`;
          
          return (
            <div key={m.label} className="flex flex-col items-center">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 52 52" className="w-full h-full">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3.5" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke={m.color} strokeWidth="3.5"
                    strokeDasharray={dashArray}
                    strokeLinecap="round" transform="rotate(-90 26 26)" className="transition-all duration-500" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-body text-[9px] font-bold text-foreground">
                  {Math.round(pct)}%
                </span>
              </div>
              <p className="font-body text-[9px] text-muted-foreground mt-1">{m.label}</p>
              <p className="font-body text-[10px] font-medium text-foreground">{m.consumed}{m.unit}/{m.target}{m.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
