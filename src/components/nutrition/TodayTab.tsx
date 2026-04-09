import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, Users, Sparkles, Leaf, Plus, Info } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

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

function getPlanDayForCycleDay(cycleDay: number) {
  if (cycleDay <= 7) return { phase: "menstrual" as Phase, dayIndex: cycleDay - 1 };
  if (cycleDay <= 14) return { phase: "follicular" as Phase, dayIndex: cycleDay - 8 };
  if (cycleDay <= 21) return { phase: "ovulatory" as Phase, dayIndex: cycleDay - 15 };
  return { phase: "luteal" as Phase, dayIndex: cycleDay - 22 };
}

export default function TodayTab() {
  const { currentCycleDay, currentPhase } = useCycle();
  const navigate = useNavigate();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showSupplements, setShowSupplements] = useState(false);
  const [plantInput, setPlantInput] = useState("");
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored: Record<string, boolean> = {};
    ["breakfast", "lunch", "dinner", "morning-snack", "afternoon-snack"].forEach((slot) => {
      if (localStorage.getItem(`eaten:${today}:${slot}`) === "true") stored[slot] = true;
    });
    return stored;
  });

  const { plants, count: plantCount, message: plantMessage, addPlant } = usePlantTracker();

  // Get cycle mode from localStorage/profile
  const cycleMode = useMemo(() => {
    try { return localStorage.getItem("signal_cycle_mode") || "cycling"; } catch { return "cycling"; }
  }, []);

  // Get exercise goal
  const goalSlug = useMemo(() => {
    try { return localStorage.getItem("signal_goal_slug") || ""; } catch { return ""; }
  }, []);

  // Body metrics
  const metrics = useMemo(() => getLatestBodyMetrics(), []);
  const nutritionTarget = useMemo(() => {
    if (!goalSlug) return null;
    return getNutritionTargetForGoal(goalSlug, metrics?.weight || undefined, cycleMode);
  }, [goalSlug, metrics, cycleMode]);

  // Today's insight
  const todayInsight = useMemo(() => getTodayInsight(currentPhase, cycleMode, goalSlug), [currentPhase, cycleMode, goalSlug]);

  // Try AI plan first, fallback to static
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
  const supplements = SUPPLEMENT_GUIDE[cycleMode === "perimenopause" || cycleMode === "post_menopause" ? "perimenopause" : currentPhase] || [];

  const markEaten = (slot: string) => {
    haptic("medium");
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`eaten:${today}:${slot}`, "true");
    setEaten(prev => ({ ...prev, [slot]: true }));
  };

  const handleAddPlant = () => {
    if (plantInput.trim()) {
      addPlant(plantInput.trim());
      setPlantInput("");
      haptic("light");
    }
  };

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
      {nutritionTarget ? (
        <div className="rounded-[18px] bg-card p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Daily Protein Target</p>
              <p className="font-mono text-2xl font-bold text-foreground mt-1">
                {nutritionTarget.dailyProteinMin}–{nutritionTarget.dailyProteinMax}g
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{nutritionTarget.calorieNote}</p>
            </div>
            {/* Simple arc visual */}
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={phaseColor} strokeWidth="4"
                  strokeDasharray={`${28 * 2 * Math.PI * 0.65} ${28 * 2 * Math.PI}`}
                  strokeLinecap="round" transform="rotate(-90 32 32)" className="transition-all" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-foreground">
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
      ) : !metrics ? (
        <button onClick={() => navigate("/movement")} className="w-full rounded-[18px] bg-card p-4 shadow-soft flex items-center gap-3 text-left active:bg-secondary/50">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-body text-xs font-medium text-foreground">Unlock personalised nutrition targets</p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5">Add your measurements in the Body tab →</p>
          </div>
        </button>
      ) : (
        <div className="rounded-[18px] bg-card p-4 shadow-soft">
          <p className="font-body text-xs text-muted-foreground italic">Aim for 25–35g protein per meal</p>
        </div>
      )}

      {/* Daily insight card */}
      <div className="rounded-[18px] p-4 shadow-soft" style={{ backgroundColor: `${phaseColor}08`, borderLeft: `3px solid ${phaseColor}` }}>
        <p className="font-display text-sm italic text-foreground leading-relaxed">"{todayInsight.text}"</p>
        {todayInsight.source && (
          <p className="font-body text-[10px] text-muted-foreground mt-2">— {todayInsight.source}</p>
        )}
      </div>

      {/* Plant diversity tracker */}
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
        {/* Quick add */}
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

      {/* Main meal cards */}
      <div className="space-y-4">
        {meals.map((meal, i) => (
          <MealCard
            key={meal.slot}
            slot={meal.slot}
            label={meal.label}
            name={meal.name}
            recipe={meal.recipe}
            aiMeal={meal.aiMeal}
            isExpanded={expandedMeal === meal.slot}
            isEaten={!!eaten[meal.slot]}
            phaseColor={phaseColor}
            index={i}
            onToggleExpand={() => { haptic("light"); setExpandedMeal(expandedMeal === meal.slot ? null : meal.slot); }}
            onMarkEaten={() => markEaten(meal.slot)}
          />
        ))}
      </div>

      {/* Snacks */}
      <div className="space-y-3">
        <h3 className="font-display text-card-title font-bold text-foreground">Snacks</h3>
        <SnackCard label="Morning Snack" name={snacks.morning.name} benefit={snacks.morning.benefit} slot="morning-snack" isEaten={!!eaten["morning-snack"]} phaseColor={phaseColor} onMarkEaten={() => markEaten("morning-snack")} />
        <SnackCard label="Afternoon Snack" name={snacks.afternoon.name} benefit={snacks.afternoon.benefit} slot="afternoon-snack" isEaten={!!eaten["afternoon-snack"]} phaseColor={phaseColor} onMarkEaten={() => markEaten("afternoon-snack")} />
      </div>

      {/* Seed cycling */}
      <SeedCyclingCard cycleDay={currentCycleDay} phase={currentPhase} />

      {/* Phase supplements */}
      {supplements.length > 0 && (
        <div className="rounded-[18px] bg-card shadow-soft overflow-hidden">
          <button onClick={() => { haptic("light"); setShowSupplements(!showSupplements); }} className="touch-card w-full text-left p-4 flex items-center justify-between">
            <div>
              <p className="font-body text-section-label uppercase font-medium" style={{ color: 'hsl(var(--label-color))' }}>Phase Supports</p>
              <p className="font-body text-xs text-foreground mt-0.5">{supplements.length} suggested supplements</p>
            </div>
            {showSupplements ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showSupplements && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                  {supplements.map(s => (
                    <div key={s.name} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: phaseColor }} />
                      <div>
                        <p className="font-body text-xs font-medium text-foreground">{s.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                  <p className="font-body text-[9px] text-muted-foreground italic mt-3 pt-2 border-t border-border">
                    These are general suggestions. Always speak with your GP or health practitioner before starting supplements.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ── Snack Card ── */
function SnackCard({ label, name, benefit, slot, isEaten, phaseColor, onMarkEaten }: {
  label: string; name: string; benefit: string; slot: string;
  isEaten: boolean; phaseColor: string; onMarkEaten: () => void;
}) {
  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft space-y-3">
      <div className="min-w-0">
        <p className="font-body text-section-label uppercase font-medium mb-1" style={{ color: 'hsl(var(--label-color))' }}>{label}</p>
        <p className="font-display text-card-title font-semibold text-foreground leading-tight">{name}</p>
        <p className="font-body text-body-lg text-muted-foreground mt-1 leading-relaxed">{benefit}</p>
      </div>
      <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
        className="touch-btn rounded-full py-2 px-5 min-h-[36px] font-body text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
        {isEaten ? (<>Logged <WildStar size={12} color="white" /></>) : "Log it"}
      </button>
    </div>
  );
}

/* ── Meal Card ── */
interface MealCardProps {
  slot: string; label: string; name: string; recipe?: Recipe; aiMeal?: AIMeal;
  isExpanded: boolean; isEaten: boolean; phaseColor: string;
  index: number; onToggleExpand: () => void; onMarkEaten: () => void;
}

function MealCard({ slot, label, name, recipe, aiMeal, isExpanded, isEaten, phaseColor, index, onToggleExpand, onMarkEaten }: MealCardProps) {
  const [showMethod, setShowMethod] = useState(false);
  const ingredients = aiMeal?.ingredients || recipe?.ingredients || [];
  const method = aiMeal?.method || recipe?.method || [];
  const benefit = aiMeal?.nutritionalNote || recipe?.phaseBenefit || "";
  const prepTime = aiMeal?.prepTime || recipe?.prepTime;
  const serves = aiMeal?.serves || recipe?.serves;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index, duration: 0.4 }}
      className="rounded-[22px] bg-card shadow-soft overflow-hidden">
      <div className="relative">
        <RecipeImage recipeName={name} recipeImage={recipe?.image} height={180} variant="detail" />
        <div className="absolute bottom-3 right-4 flex gap-2">
          {prepTime && (
            <span className="font-body text-xs bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> {prepTime}
            </span>
          )}
          {serves && (
            <span className="font-body text-xs bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
              <Users className="h-3 w-3" /> Serves {serves}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-7">
        <p className="font-body text-section-label uppercase font-medium mb-2" style={{ color: phaseColor }}>{label}</p>
        <h3 className="font-display text-card-title font-bold text-foreground leading-tight">{name}</h3>

        {/* Macro pills for AI meals */}
        {aiMeal && (aiMeal as any).calories && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {(aiMeal as any).protein && <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">Protein {(aiMeal as any).protein}</span>}
            {(aiMeal as any).calories && <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{(aiMeal as any).calories}</span>}
          </div>
        )}

        {benefit && <p className="font-body text-body-lg text-muted-foreground mt-2 leading-relaxed">{benefit.split(".")[0]}.</p>}

        <button onClick={onToggleExpand} className="touch-btn flex items-center gap-1.5 mt-4 font-body text-sm font-medium" style={{ color: phaseColor }}>
          {isExpanded ? "Hide details" : "View recipe"}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pt-4 space-y-4 border-t border-border mt-4">
                {ingredients.length > 0 ? (
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
                ) : (
                  <p className="font-body text-xs text-muted-foreground italic">Full recipe details coming soon.</p>
                )}

                {method.length > 0 && (
                  <>
                    <button onClick={() => { haptic("light"); setShowMethod(!showMethod); }} className="touch-btn flex items-center gap-1.5 font-body text-sm font-medium" style={{ color: phaseColor }}>
                      {showMethod ? "Hide method" : "How to make it"}
                      {showMethod ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <AnimatePresence>
                      {showMethod && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <ol className="space-y-2 pt-2">
                            {method.map((step, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="font-mono text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: phaseColor }}>{idx + 1}.</span>
                                <p className="font-body text-sm text-muted-foreground leading-relaxed">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {(recipe?.keyNutrients || aiMeal?.keyNutrients) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(aiMeal?.keyNutrients || recipe?.keyNutrients || []).map(n => (
                      <span key={n} className="font-body text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">{n}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => !isEaten && onMarkEaten()} disabled={isEaten}
          className="touch-btn w-full mt-5 rounded-full py-3.5 min-h-[48px] font-body text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: isEaten ? phaseColor : "transparent", color: isEaten ? "white" : phaseColor, border: `2px solid ${phaseColor}` }}>
          {isEaten ? (<>Eaten <WildStar size={14} color="white" /></>) : "Mark as eaten"}
        </button>
      </div>
    </motion.div>
  );
}
