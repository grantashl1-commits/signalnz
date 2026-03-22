import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, Users, Sparkles } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, MEAT_MEAL_PLANS, type Recipe } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import RecipeImage from "@/components/nutrition/RecipeImage";
import SeedCyclingCard from "@/components/nutrition/SeedCyclingCard";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

/* ── Phase-based snack suggestions ── */
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

/* ── Map cycle day (1-28) to the correct phase plan + day index ── */
function getPlanDayForCycleDay(cycleDay: number) {
  if (cycleDay <= 7) return { phase: "menstrual" as Phase, dayIndex: cycleDay - 1 };
  if (cycleDay <= 14) return { phase: "follicular" as Phase, dayIndex: cycleDay - 8 };
  if (cycleDay <= 21) return { phase: "ovulatory" as Phase, dayIndex: cycleDay - 15 };
  return { phase: "luteal" as Phase, dayIndex: cycleDay - 22 };
}

export default function TodayTab() {
  const { currentCycleDay, currentPhase } = useCycle();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored: Record<string, boolean> = {};
    ["breakfast", "lunch", "dinner", "morning-snack", "afternoon-snack"].forEach((slot) => {
      if (localStorage.getItem(`eaten:${today}:${slot}`) === "true") stored[slot] = true;
    });
    return stored;
  });

  const { phase: planPhase, dayIndex } = getPlanDayForCycleDay(currentCycleDay);
  const plan = PHASE_MEAL_PLANS[planPhase];
  const dayPlan = plan.days[Math.min(dayIndex, plan.days.length - 1)];

  const meals = useMemo(() => {
    if (!dayPlan) return [];
    const slots = [
      { slot: "breakfast", label: "Breakfast", name: dayPlan.breakfast },
      { slot: "lunch", label: "Lunch", name: dayPlan.lunch },
      { slot: "dinner", label: "Dinner", name: dayPlan.dinner },
    ];
    return slots.map((s) => ({
      ...s,
      recipe: findRecipeByName(s.name),
    }));
  }, [dayPlan]);

  const phaseColor = PHASE_HEX[currentPhase];
  const snacks = PHASE_SNACKS[currentPhase];
  const hasPlan = !!dayPlan;

  const markEaten = (slot: string) => {
    haptic("medium");
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`eaten:${today}:${slot}`, "true");
    setEaten((prev) => ({ ...prev, [slot]: true }));
  };

  if (!hasPlan) {
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
      {/* Header — reads from global cycle state */}
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold italic text-foreground">
          Today's Nourishment
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {PHASE_SHORT[currentPhase]} phase · Day {currentCycleDay}
        </p>
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
            isExpanded={expandedMeal === meal.slot}
            isEaten={!!eaten[meal.slot]}
            phaseColor={phaseColor}
            index={i}
            onToggleExpand={() => {
              haptic("light");
              setExpandedMeal(expandedMeal === meal.slot ? null : meal.slot);
            }}
            onMarkEaten={() => markEaten(meal.slot)}
          />
        ))}
      </div>

      {/* Snacks section */}
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-foreground">Snacks</h3>
        <SnackCard
          label="Morning Snack"
          name={snacks.morning.name}
          benefit={snacks.morning.benefit}
          slot="morning-snack"
          isEaten={!!eaten["morning-snack"]}
          phaseColor={phaseColor}
          onMarkEaten={() => markEaten("morning-snack")}
        />
        <SnackCard
          label="Afternoon Snack"
          name={snacks.afternoon.name}
          benefit={snacks.afternoon.benefit}
          slot="afternoon-snack"
          isEaten={!!eaten["afternoon-snack"]}
          phaseColor={phaseColor}
          onMarkEaten={() => markEaten("afternoon-snack")}
        />
      </div>

      {/* Seed cycling */}
      <SeedCyclingCard cycleDay={currentCycleDay} phase={currentPhase} />
    </div>
  );
}

/* ── Snack Card ── */
function SnackCard({ label, name, benefit, slot, isEaten, phaseColor, onMarkEaten }: {
  label: string; name: string; benefit: string; slot: string;
  isEaten: boolean; phaseColor: string; onMarkEaten: () => void;
}) {
  return (
    <div className="rounded-[18px] bg-card p-5 shadow-soft flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
          {label}
        </p>
        <p className="font-display text-base font-semibold text-foreground leading-tight">{name}</p>
        <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">{benefit}</p>
      </div>
      <button
        onClick={() => !isEaten && onMarkEaten()}
        disabled={isEaten}
        className="touch-btn h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          backgroundColor: isEaten ? phaseColor : "transparent",
          border: `2px solid ${isEaten ? phaseColor : "hsl(var(--border))"}`,
        }}
      >
        {isEaten && <WildStar size={14} color="white" />}
      </button>
    </div>
  );
}

/* ── Meal Card with full recipe expansion ── */
interface MealCardProps {
  slot: string; label: string; name: string; recipe?: Recipe;
  isExpanded: boolean; isEaten: boolean; phaseColor: string;
  index: number; onToggleExpand: () => void; onMarkEaten: () => void;
}

function MealCard({ slot, label, name, recipe, isExpanded, isEaten, phaseColor, index, onToggleExpand, onMarkEaten }: MealCardProps) {
  const [showMethod, setShowMethod] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.4 }}
      className="rounded-[22px] bg-card shadow-soft overflow-hidden"
    >
      {/* Image */}
      <div className="relative">
        {recipe?.image ? (
          <div className="w-full h-[180px] md:h-[220px] flex items-center justify-center bg-secondary/20">
            <img src={recipe.image} alt={name} className="h-[160px] md:h-[200px] w-auto object-contain" loading="lazy" />
          </div>
        ) : (
          <div className="w-full h-[140px] flex items-center justify-center bg-secondary/10">
            <RecipeIllustration recipeName={name} height={110} />
          </div>
        )}
        {/* Prep time + serves badges */}
        <div className="absolute bottom-3 right-4 flex gap-2">
          {recipe?.prepTime && (
            <span className="font-body text-xs bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> {recipe.prepTime}
            </span>
          )}
          {recipe?.serves && (
            <span className="font-body text-xs bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
              <Users className="h-3 w-3" /> Serves {recipe.serves}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-7">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: phaseColor }}>
          {label}
        </p>

        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">{name}</h3>

        {recipe?.phaseBenefit && (
          <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
            {recipe.phaseBenefit.split(".")[0]}.
          </p>
        )}

        {/* View recipe toggle */}
        <button onClick={onToggleExpand} className="touch-btn flex items-center gap-1.5 mt-4 font-body text-sm font-medium" style={{ color: phaseColor }}>
          {isExpanded ? "Hide details" : "View recipe"}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4 border-t border-border mt-4">
                {/* Ingredients */}
                {recipe?.ingredients && recipe.ingredients.length > 0 ? (
                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: phaseColor }}>Ingredients</p>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-muted-foreground/40 mt-1">•</span> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="font-body text-xs text-muted-foreground italic">Full recipe details coming soon.</p>
                )}

                {/* Nutritional note */}
                {recipe?.phaseBenefit && (
                  <p className="font-display text-sm italic leading-relaxed" style={{ color: phaseColor }}>
                    {recipe.phaseBenefit}
                  </p>
                )}

                {/* Method */}
                {recipe?.method && recipe.method.length > 0 && (
                  <>
                    <button
                      onClick={() => { haptic("light"); setShowMethod(!showMethod); }}
                      className="touch-btn flex items-center gap-1.5 font-body text-sm font-medium"
                      style={{ color: phaseColor }}
                    >
                      {showMethod ? "Hide method" : "How to make it"}
                      {showMethod ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <AnimatePresence>
                      {showMethod && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ol className="space-y-2 pt-2">
                            {recipe.method.map((step, idx) => (
                              <li key={idx} className="flex gap-3">
                                <span className="font-mono text-sm font-bold flex-shrink-0 mt-0.5" style={{ color: phaseColor }}>
                                  {idx + 1}.
                                </span>
                                <p className="font-body text-sm text-muted-foreground leading-relaxed">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Key nutrients */}
                {recipe?.keyNutrients && recipe.keyNutrients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recipe.keyNutrients.map((n) => (
                      <span key={n} className="font-body text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mark as eaten */}
        <button
          onClick={() => !isEaten && onMarkEaten()}
          disabled={isEaten}
          className="touch-btn w-full mt-5 rounded-full py-3.5 min-h-[48px] font-body text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: isEaten ? phaseColor : "transparent",
            color: isEaten ? "white" : phaseColor,
            border: `2px solid ${phaseColor}`,
          }}
        >
          {isEaten ? (
            <>Eaten <WildStar size={14} color="white" /></>
          ) : (
            "Mark as eaten"
          )}
        </button>
      </div>
    </motion.div>
  );
}
