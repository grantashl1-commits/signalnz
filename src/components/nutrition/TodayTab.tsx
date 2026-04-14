import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT, getSeedsTaken, setSeedsTaken } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import KidsDinnerAlt from "@/components/nutrition/KidsDinnerAlt";
import { getAIMealPlan, type AIMeal } from "@/lib/weekly-planner";
import { getNutritionTargetForGoal, getLatestBodyMetrics } from "@/lib/fitness-profile";
import { getTodayInsight } from "@/data/nutrition-insights";
import { usePlantTracker } from "@/hooks/usePlantTracker";
import { extractPlantsFromIngredients } from "@/lib/plant-extractor";
import PlantVine from "@/components/nutrition/PlantVine";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_SNACKS: Record<Phase, { morning: { name: string; benefit: string; image: string; ingredients: string[] }; afternoon: { name: string; benefit: string; image: string; ingredients: string[] } }> = {
  menstrual: {
    morning: { name: "Warm cacao with oat milk & cinnamon", benefit: "Magnesium-rich cacao eases cramps and lifts mood.", image: "/images/recipes/meals/snack-warm-cacao-oatmilk.png", ingredients: ["cacao powder", "oat milk", "cinnamon", "maple syrup"] },
    afternoon: { name: "Dates stuffed with almond butter", benefit: "Natural iron and sweetness to replenish energy.", image: "/images/recipes/meals/snack-dates-almond-butter.png", ingredients: ["medjool dates", "almond butter"] },
  },
  follicular: {
    morning: { name: "Apple slices with almond butter", benefit: "Fibre and healthy fats fuel rising energy levels.", image: "/images/recipes/meals/snack-apple-almond-butter.png", ingredients: ["apple", "almond butter"] },
    afternoon: { name: "Edamame with sea salt & sesame", benefit: "Phytoestrogens support healthy estrogen metabolism.", image: "/images/recipes/meals/snack-edamame-sesame.png", ingredients: ["edamame", "sea salt", "sesame seeds"] },
  },
  ovulatory: {
    morning: { name: "Fresh berries with hemp seeds", benefit: "Antioxidants protect egg quality during ovulation.", image: "/images/recipes/meals/snack-berries-hemp-seeds.png", ingredients: ["blueberries", "raspberries", "strawberries", "hemp seeds"] },
    afternoon: { name: "Cucumber & avocado rice paper rolls", benefit: "Light, hydrating, and rich in folate.", image: "/images/recipes/meals/snack-cucumber-avocado-rolls.png", ingredients: ["cucumber", "avocado", "rice paper", "mint", "coriander"] },
  },
  luteal: {
    morning: { name: "Dark chocolate & walnuts", benefit: "Magnesium and omega-3s reduce PMS symptoms.", image: "/images/recipes/meals/snack-dark-chocolate-walnuts.png", ingredients: ["dark chocolate", "walnuts"] },
    afternoon: { name: "Banana with tahini & cinnamon", benefit: "B6 from banana supports progesterone production.", image: "/images/recipes/meals/snack-banana-tahini-cinnamon.png", ingredients: ["banana", "tahini", "cinnamon"] },
  },
};

const SNACK_MACROS: Record<Phase, { morning: { cal: number; p: number; c: number; f: number }; afternoon: { cal: number; p: number; c: number; f: number } }> = {
  menstrual: { morning: { cal: 180, p: 3, c: 18, f: 10 }, afternoon: { cal: 210, p: 4, c: 32, f: 8 } },
  follicular: { morning: { cal: 200, p: 5, c: 20, f: 12 }, afternoon: { cal: 140, p: 11, c: 8, f: 7 } },
  ovulatory: { morning: { cal: 150, p: 5, c: 18, f: 7 }, afternoon: { cal: 120, p: 2, c: 10, f: 8 } },
  luteal: { morning: { cal: 190, p: 4, c: 12, f: 14 }, afternoon: { cal: 170, p: 3, c: 28, f: 6 } },
};

const SEED_CYCLING_MACROS = { cal: 90, p: 3, c: 3, f: 7 };

function getPlanDayForCycleDay(cycleDay: number) {
  if (cycleDay <= 7) return { phase: "menstrual" as Phase, dayIndex: cycleDay - 1 };
  if (cycleDay <= 14) return { phase: "follicular" as Phase, dayIndex: cycleDay - 8 };
  if (cycleDay <= 21) return { phase: "ovulatory" as Phase, dayIndex: cycleDay - 15 };
  return { phase: "luteal" as Phase, dayIndex: cycleDay - 22 };
}

function estimateMealMacros(recipe?: Recipe, aiMeal?: AIMeal): { cal: number; p: number; c: number; f: number } | null {
  if (aiMeal) {
    const ai = aiMeal as any;
    if (ai.calories || ai.protein) {
      return { cal: parseInt(ai.calories) || 400, p: parseInt(ai.protein) || 25, c: parseInt(ai.carbs) || 45, f: parseInt(ai.fat) || 15 };
    }
  }
  if (recipe) {
    const n = (recipe as any).nutrition;
    if (n) return { cal: n.calories || 400, p: n.protein || 25, c: n.carbs || 45, f: n.fat || 15 };
    return { cal: 380, p: 22, c: 42, f: 14 };
  }
  return { cal: 380, p: 22, c: 42, f: 14 };
}

export default function TodayTab() {
  const { currentCycleDay, currentPhase } = useCycle();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [portionScale, setPortionScale] = useState<Record<string, number>>({});
  const todayStr = new Date().toISOString().split("T")[0];
  const [seedsTaken, setSeedsState] = useState(getSeedsTaken(todayStr));

  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const stored: Record<string, boolean> = {};
    ["breakfast", "lunch", "dinner", "morning-snack", "afternoon-snack", "seed-cycling"].forEach((slot) => {
      if (localStorage.getItem(`eaten:${todayStr}:${slot}`) === "true") stored[slot] = true;
    });
    return stored;
  });

  const { addPlant, count: plantCount, plants } = usePlantTracker();

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
  const isFirstHalf = currentCycleDay <= 14;

  // Auto-add plants when a meal is logged
  const markEaten = useCallback((slot: string) => {
    haptic("medium");
    localStorage.setItem(`eaten:${todayStr}:${slot}`, "true");
    setEaten(prev => ({ ...prev, [slot]: true }));

    // Extract plants from the meal's ingredients
    let ingredients: string[] = [];
    const meal = meals.find(m => m.slot === slot);
    if (meal) {
      ingredients = meal.aiMeal?.ingredients || meal.recipe?.ingredients || [];
    } else if (slot === "morning-snack") {
      ingredients = snacks.morning.ingredients;
    } else if (slot === "afternoon-snack") {
      ingredients = snacks.afternoon.ingredients;
    } else if (slot === "seed-cycling") {
      ingredients = isFirstHalf
        ? ["pumpkin seeds", "flaxseeds"]
        : ["sunflower seeds", "sesame seeds"];
    }

    const plantNames = extractPlantsFromIngredients(ingredients);
    plantNames.forEach(p => addPlant(p));
  }, [todayStr, meals, snacks, isFirstHalf, addPlant]);

  const handleSeedCyclingLog = () => {
    if (seedsTaken) return;
    haptic("medium");
    setSeedsState(true);
    setSeedsTaken(todayStr, true);
    markEaten("seed-cycling");
  };

  const getScale = (slot: string) => portionScale[slot] || 1;
  const setScale = (slot: string, val: number) => {
    setPortionScale(prev => ({ ...prev, [slot]: val }));
  };

  const mealsLoggedToday = useMemo(() => {
    return Object.values(eaten).filter(Boolean).length;
  }, [eaten]);

  const dayOfWeek = new Date().getDay(); // 0=Sun
  const adjustedDow = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0

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
    if (eaten["seed-cycling"]) {
      totalCal += SEED_CYCLING_MACROS.cal;
      totalP += SEED_CYCLING_MACROS.p;
      totalC += SEED_CYCLING_MACROS.c;
      totalF += SEED_CYCLING_MACROS.f;
    }
    
    return { cal: totalCal, p: totalP, c: totalC, f: totalF };
  }, [eaten, meals, portionScale, snackMacros]);

  const macroTargets = useMemo(() => {
    if (nutritionTarget) {
      const calTarget = nutritionTarget.calorieNote?.match(/\d+/)?.[0];
      const cal = calTarget ? parseInt(calTarget) : 1800;
      return { cal, p: nutritionTarget.dailyProteinMax || 120, c: Math.round(cal * 0.45 / 4), f: Math.round(cal * 0.3 / 9) };
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
    <div className="relative">
      {/* Plant vine on right side */}
      <PlantVine mealsLoggedToday={mealsLoggedToday} plantCount={plantCount} dayOfWeek={adjustedDow} plants={plants} />

      <div className="space-y-6 relative z-10">
        {/* Header — no phase/day subtitle */}
        <div>
          <h2 className="font-display text-card-title font-bold italic text-foreground">Today's Nourishment</h2>
          {aiToday && <p className="font-body text-body-lg text-primary mt-1">AI plan</p>}
        </div>

        {/* Protein ring */}
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

        {/* Daily insight */}
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
            {meals.map((meal) => (
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
              phase={currentPhase}
              scale={getScale(expandedMeal)}
              onMarkEaten={() => markEaten(expandedMeal)}
              onScaleChange={(v) => setScale(expandedMeal, v)}
              onClose={() => setExpandedMeal(null)}
            />
          )}
        </AnimatePresence>

        {/* Snacks + Seed Cycling — 3-column row like meals */}
        <div>
          <h3 className="font-display text-card-title font-bold text-foreground mb-3">Snacks</h3>
          <div className="grid grid-cols-3 gap-2">
            <CompactSnackCard
              label="Morning"
              name={snacks.morning.name}
              image={snacks.morning.image}
              isEaten={!!eaten["morning-snack"]}
              phaseColor={phaseColor}
              onToggleExpand={() => { haptic("light"); setExpandedMeal(expandedMeal === "morning-snack" ? null : "morning-snack"); }}
            />
            <CompactSnackCard
              label="Afternoon"
              name={snacks.afternoon.name}
              image={snacks.afternoon.image}
              isEaten={!!eaten["afternoon-snack"]}
              phaseColor={phaseColor}
              onToggleExpand={() => { haptic("light"); setExpandedMeal(expandedMeal === "afternoon-snack" ? null : "afternoon-snack"); }}
            />
            <CompactSnackCard
              label="Seed Cycling"
              name={isFirstHalf ? "Pumpkin + Flax" : "Sunflower + Sesame"}
              image="/images/recipes/meals/snack-seed-cycling.png"
              isEaten={seedsTaken}
              phaseColor={phaseColor}
              onToggleExpand={() => { haptic("light"); setExpandedMeal(expandedMeal === "seed-cycling" ? null : "seed-cycling"); }}
            />
          </div>
        </div>

        {/* Expanded snack detail */}
        <AnimatePresence>
          {expandedMeal === "morning-snack" && (
            <ExpandedSnackDetail
              label="Morning Snack"
              name={snacks.morning.name}
              benefit={snacks.morning.benefit}
              macros={snackMacros.morning}
              isEaten={!!eaten["morning-snack"]}
              phaseColor={phaseColor}
              scale={getScale("morning-snack")}
              onMarkEaten={() => markEaten("morning-snack")}
              onScaleChange={(v) => setScale("morning-snack", v)}
              onClose={() => setExpandedMeal(null)}
            />
          )}
          {expandedMeal === "afternoon-snack" && (
            <ExpandedSnackDetail
              label="Afternoon Snack"
              name={snacks.afternoon.name}
              benefit={snacks.afternoon.benefit}
              macros={snackMacros.afternoon}
              isEaten={!!eaten["afternoon-snack"]}
              phaseColor={phaseColor}
              scale={getScale("afternoon-snack")}
              onMarkEaten={() => markEaten("afternoon-snack")}
              onScaleChange={(v) => setScale("afternoon-snack", v)}
              onClose={() => setExpandedMeal(null)}
            />
          )}
          {expandedMeal === "seed-cycling" && (
            <ExpandedSnackDetail
              label="Seed Cycling"
              name={isFirstHalf ? "Pumpkin seeds · 1 tbsp + Flaxseeds · 1 tbsp" : "Sunflower seeds · 1 tbsp + Sesame · 1 tbsp"}
              benefit={isFirstHalf ? "Pumpkin seeds provide zinc for follicle development. Flaxseeds offer lignans for estrogen metabolism." : "Sunflower seeds provide selenium for liver detox. Sesame supports progesterone production."}
              macros={SEED_CYCLING_MACROS}
              isEaten={seedsTaken}
              phaseColor={phaseColor}
              scale={1}
              onMarkEaten={handleSeedCyclingLog}
              onScaleChange={() => {}}
              onClose={() => setExpandedMeal(null)}
            />
          )}
        </AnimatePresence>

        {/* Macro summary ring */}
        <MacroRing consumed={dailyMacros} targets={macroTargets} phaseColor={phaseColor} />

        {/* Plant vine tracker is rendered as side decoration + summary card at week end */}
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

/* ── Compact Snack Card (same visual as meal cards) ── */
function CompactSnackCard({ label, name, image, isEaten, phaseColor, onToggleExpand, onLog }: {
  label: string; name: string; image: string;
  isEaten: boolean; phaseColor: string; onToggleExpand: () => void; onLog: () => void;
}) {
  return (
    <div className="rounded-[14px] bg-card shadow-soft overflow-hidden" onClick={onToggleExpand}>
      <div
        className="w-full flex items-center justify-center rounded-t-[14px]"
        style={{ height: 64, background: 'linear-gradient(180deg, #F5EFE8 0%, #EDE4DC 100%)' }}
      >
        <img src={image} alt={name} className="h-[52px] w-auto max-w-[52px] object-contain" loading="lazy" />
      </div>
      <div className="p-2 space-y-1">
        <p className="font-body text-[9px] uppercase tracking-wider font-medium" style={{ color: phaseColor }}>{label}</p>
        <p className="font-display text-[10px] italic text-foreground leading-tight line-clamp-2">{name}</p>
        {isEaten ? (
          <div className="flex items-center gap-1">
            <WildStar size={10} color={phaseColor} />
            <span className="font-body text-[8px] font-medium" style={{ color: phaseColor }}>Logged</span>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onLog(); }}
            className="w-full rounded-lg py-1.5 font-body text-[10px] font-medium transition-all"
            style={{ backgroundColor: `${phaseColor}10`, color: phaseColor }}
          >
            Log
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Expanded Meal Detail ── */
function ExpandedMealDetail({ meal, isEaten, phaseColor, phase, scale, onMarkEaten, onScaleChange, onClose }: {
  meal: { slot: string; label: string; name: string; recipe?: Recipe; aiMeal?: AIMeal };
  isEaten: boolean; phaseColor: string; phase: Phase; scale: number;
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

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground">Portion:</span>
          {SCALES.map(s => (
            <button key={s} onClick={() => { haptic("light"); onScaleChange(s); }}
              className={`touch-btn rounded-full px-3 py-1.5 font-body text-[10px] font-medium transition-all ${scale === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {s}x
            </button>
          ))}
        </div>

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

        {/* Kids alternative swap */}
        <KidsDinnerAlt dinnerName={meal.name} phase={phase} />

        <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
          className="touch-btn w-full rounded-full py-3 min-h-[44px] font-body text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
          {isEaten ? (<>Eaten <WildStar size={14} color="white" /></>) : "Mark as eaten"}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Expanded Snack Detail ── */
function ExpandedSnackDetail({ label, name, benefit, macros, isEaten, phaseColor, scale, onMarkEaten, onScaleChange, onClose }: {
  label: string; name: string; benefit: string;
  macros: { cal: number; p: number; c: number; f: number };
  isEaten: boolean; phaseColor: string; scale: number;
  onMarkEaten: () => void; onScaleChange: (v: number) => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="rounded-[18px] bg-card shadow-soft p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-section-label uppercase font-medium" style={{ color: phaseColor }}>{label}</p>
            <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
          </div>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <p className="font-body text-body-lg text-muted-foreground leading-relaxed">{benefit}</p>

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

        {label !== "Seed Cycling" && (
          <div className="flex items-center gap-1.5">
            <span className="font-body text-[10px] text-muted-foreground">Portion:</span>
            {[0.5, 1, 1.5, 2].map(s => (
              <button key={s} onClick={() => { haptic("light"); onScaleChange(s); }}
                className={`touch-btn rounded-full px-2 py-1 font-body text-[9px] font-medium transition-all ${scale === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {s}x
              </button>
            ))}
          </div>
        )}

        <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
          className="touch-btn w-full rounded-full py-3 min-h-[44px] font-body text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
          {isEaten ? (<>Logged <WildStar size={12} color="white" /></>) : "Log it"}
        </button>
      </div>
    </motion.div>
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
          const pct = Math.min(100, m.target > 0 ? (m.consumed / m.target) * 100 : 0);
          const circumference = 2 * Math.PI * 22;
          const dashArray = `${(pct / 100) * circumference} ${circumference}`;
          
          return (
            <div key={m.label} className="flex flex-col items-center">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 52 52" className="w-full h-full">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3.5" />
                  <motion.circle cx="26" cy="26" r="22" fill="none" stroke={m.color} strokeWidth="3.5"
                    strokeLinecap="round" transform="rotate(-90 26 26)"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: dashArray }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
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
