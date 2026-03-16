import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { Meal } from "@/data/meal-plans";
import { findRecipeByName } from "@/lib/recipe-index";
import { RecipeIllustration } from "@/components/MealIllustration";
import KidsDinnerAlt from "@/components/nutrition/KidsDinnerAlt";
import SeedCyclingCard from "@/components/nutrition/SeedCyclingCard";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  "morning snack": "Snack",
  lunch: "Lunch",
  "afternoon snack": "Snack",
  dinner: "Dinner",
};

interface TodayTabProps {
  meals: Meal[];
  phase: Phase;
  cycleDay: number;
}

export default function TodayTab({ meals, phase, cycleDay }: TodayTabProps) {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored: Record<string, boolean> = {};
    meals.forEach((m) => {
      const key = `eaten:${today}:${m.type.toLowerCase().replace(/\s/g, "-")}`;
      if (localStorage.getItem(key) === "true") stored[m.type] = true;
    });
    return stored;
  });

  const mealRecipes = useMemo(() => {
    return meals.map((m) => findRecipeByName(m.name));
  }, [meals]);

  const markEaten = (mealType: string) => {
    haptic("medium");
    const today = new Date().toISOString().split("T")[0];
    const key = `eaten:${today}:${mealType.toLowerCase().replace(/\s/g, "-")}`;
    localStorage.setItem(key, "true");
    setEaten((prev) => ({ ...prev, [mealType]: true }));
  };

  const phaseColor = PHASE_HEX[phase];

  // Filter to main meals only (Breakfast, Lunch, Dinner) + snacks
  const mainMeals = meals.filter((m) => {
    const t = m.type.toLowerCase();
    return t === "breakfast" || t === "lunch" || t === "dinner";
  });
  const snackMeals = meals.filter((m) => {
    const t = m.type.toLowerCase();
    return t.includes("snack");
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold italic text-foreground">
          Today's Nourishment
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {PHASE_SHORT[phase]} phase · Day {cycleDay}
        </p>
      </div>

      {/* Main meal cards */}
      <div className="space-y-4">
        {mainMeals.map((meal, i) => {
          const recipe = mealRecipes[meals.indexOf(meal)];
          const isExpanded = expandedMeal === meal.type;
          const isEaten = eaten[meal.type];
          const isDinner = meal.type.toLowerCase() === "dinner";
          const slotLabel = SLOT_LABELS[meal.type.toLowerCase()] || meal.type;

          return (
            <MealCard
              key={meal.type}
              meal={meal}
              recipe={recipe}
              slotLabel={slotLabel}
              isExpanded={isExpanded}
              isEaten={isEaten}
              isDinner={isDinner}
              phase={phase}
              phaseColor={phaseColor}
              index={i}
              onToggleExpand={() => {
                haptic("light");
                setExpandedMeal(isExpanded ? null : meal.type);
              }}
              onMarkEaten={() => markEaten(meal.type)}
            />
          );
        })}
      </div>

      {/* Snacks section */}
      {snackMeals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-foreground">Snacks</h3>
          {snackMeals.map((meal) => {
            const recipe = mealRecipes[meals.indexOf(meal)];
            const isEaten = eaten[meal.type];
            return (
              <div
                key={meal.type}
                className="rounded-[18px] bg-card p-5 shadow-soft flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                    {meal.type}
                  </p>
                  <p className="font-display text-base font-semibold text-foreground leading-tight">
                    {meal.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                    {meal.phaseBenefit.split(".")[0]}.
                  </p>
                </div>
                <button
                  onClick={() => !isEaten && markEaten(meal.type)}
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
          })}
        </div>
      )}

      {/* Seed cycling */}
      <SeedCyclingCard cycleDay={cycleDay} phase={phase} />
    </div>
  );
}

/* ── Individual Meal Card ── */
interface MealCardProps {
  meal: Meal;
  recipe?: import("@/data/meal-plans").Recipe;
  slotLabel: string;
  isExpanded: boolean;
  isEaten: boolean;
  isDinner: boolean;
  phase: Phase;
  phaseColor: string;
  index: number;
  onToggleExpand: () => void;
  onMarkEaten: () => void;
}

function MealCard({
  meal,
  recipe,
  slotLabel,
  isExpanded,
  isEaten,
  isDinner,
  phase,
  phaseColor,
  index,
  onToggleExpand,
  onMarkEaten,
}: MealCardProps) {
  const [showMethod, setShowMethod] = useState(false);
  const recipeImage = recipe?.image;
  const displayIngredients = recipe ? recipe.ingredients.join(", ") : meal.ingredients;
  const displayMethod = recipe?.method;
  const displayPrepTime = recipe?.prepTime || meal.prepTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.4 }}
      className="rounded-[22px] bg-card shadow-soft overflow-hidden"
    >
      {/* Image */}
      <div className="relative">
        {recipeImage ? (
          <div className="w-full h-[180px] md:h-[220px] flex items-center justify-center bg-secondary/20">
            <img
              src={recipeImage}
              alt={meal.name}
              className="h-[160px] md:h-[200px] w-auto object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-[140px] flex items-center justify-center bg-secondary/10">
            <RecipeIllustration recipeName={meal.name} height={110} />
          </div>
        )}
        {displayPrepTime && (
          <div className="absolute bottom-3 right-4">
            <span className="font-body text-xs bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-muted-foreground font-medium">
              {displayPrepTime}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 md:p-7">
        {/* Slot label */}
        <p className="font-body text-[11px] uppercase tracking-[0.2em] font-medium mb-2" style={{ color: phaseColor }}>
          {slotLabel}
        </p>

        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
          {meal.name}
        </h3>

        <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
          {meal.phaseBenefit.split(".")[0]}.
        </p>

        {isDinner && <KidsDinnerAlt dinnerName={meal.name} phase={phase} />}

        {/* View recipe toggle */}
        <button
          onClick={onToggleExpand}
          className="touch-btn flex items-center gap-1.5 mt-4 font-body text-sm font-medium"
          style={{ color: phaseColor }}
        >
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
                {displayIngredients && (
                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: phaseColor }}>
                      Ingredients
                    </p>
                    {recipe ? (
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="font-body text-sm text-muted-foreground">{ing}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-body text-sm text-muted-foreground">{displayIngredients}</p>
                    )}
                  </div>
                )}

                {/* Method */}
                {displayMethod && (
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
                            {displayMethod.map((step, idx) => (
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

                {/* Phase benefit */}
                <p className="font-display text-sm italic leading-relaxed" style={{ color: phaseColor }}>
                  {recipe?.phaseBenefit || meal.phaseBenefit}
                </p>
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
