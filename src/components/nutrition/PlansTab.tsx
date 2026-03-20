import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Phase, PHASE_SHORT, PHASE_DAYS } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, Recipe } from "@/data/meal-plans";
import { findRecipeByName, findRecipeById } from "@/lib/recipe-index";
import { RecipeIllustration } from "@/components/MealIllustration";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { RecipeShoppingButton, IngredientSearchLinks } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";
import { getWeeklyPlan, type WeeklyPlan } from "@/lib/weekly-planner";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface PlansTabProps {
  phase: Phase;
  cycleDay: number;
}

interface DayMeals {
  day: number;
  breakfast: { name: string; recipe?: Recipe };
  lunch: { name: string; recipe?: Recipe };
  dinner: { name: string; recipe?: Recipe };
}

export default function PlansTab({ phase, cycleDay }: PlansTabProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const plan = PHASE_MEAL_PLANS[phase];
  const phaseColor = PHASE_HEX[phase];
  const [phaseStart, phaseEnd] = PHASE_DAYS[phase];

  const dayMeals: DayMeals[] = plan.days.map((day) => {
    const bName = day.breakfast.split(" — ")[0];
    const lName = day.lunch.split(" — ")[0];
    const dName = day.dinner.split(" — ")[0];
    return {
      day: day.day,
      breakfast: { name: bName, recipe: findRecipeByName(bName) },
      lunch: { name: lName, recipe: findRecipeByName(lName) },
      dinner: { name: dName, recipe: findRecipeByName(dName) },
    };
  });

  const MealTile = ({ name, recipe, slot }: { name: string; recipe?: Recipe; slot: string }) => (
    <button
      onClick={() => {
        haptic("light");
        if (recipe) setSelectedRecipe(recipe);
      }}
      className="touch-card w-full text-left rounded-[16px] bg-card shadow-soft overflow-hidden"
    >
      {recipe?.image ? (
        <div className="w-full h-[100px] flex items-center justify-center bg-secondary/20 rounded-t-[16px]">
          <img src={recipe.image} alt={name} className="h-[85px] w-auto object-contain" loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-[100px] flex items-center justify-center bg-secondary/10 rounded-t-[16px]">
          <RecipeIllustration recipeName={name} height={80} />
        </div>
      )}
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
    <div className="space-y-5">
      {/* Phase header */}
      <div>
        <span className={`inline-block rounded-full px-3 py-1.5 font-body text-sm font-bold phase-${phase}-light`}>
          Your {PHASE_SHORT[phase].toLowerCase()} plan · days {phaseStart}–{phaseEnd}
        </span>
        <p className="font-body text-sm italic text-muted-foreground mt-2">
          Plans update automatically as your cycle moves.
        </p>
      </div>

      <p className="font-display text-base italic text-foreground">{plan.theme}.</p>

      {/* Day list */}
      <div className="space-y-5">
        {dayMeals.map((dm) => {
          const isExpanded = expandedDay === dm.day;
          return (
            <div key={dm.day} className="space-y-3">
              <button
                onClick={() => {
                  haptic("light");
                  setExpandedDay(isExpanded ? null : dm.day);
                }}
                className="touch-btn flex items-center gap-3 w-full"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center font-body text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: phaseColor }}
                >
                  {dm.day}
                </span>
                <span className="font-body text-base font-bold flex-1 text-left" style={{ color: phaseColor }}>
                  Day {dm.day}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* 3 tiles */}
              <div className="grid grid-cols-3 gap-3 pl-11">
                <MealTile name={dm.breakfast.name} recipe={dm.breakfast.recipe} slot="Breakfast" />
                <MealTile name={dm.lunch.name} recipe={dm.lunch.recipe} slot="Lunch" />
                <MealTile name={dm.dinner.name} recipe={dm.dinner.recipe} slot="Dinner" />
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
                          <p className="font-body text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: phaseColor }}>{slot}</p>
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

              {selectedRecipe.image ? (
                <div className="w-full h-[180px] flex items-center justify-center bg-secondary/20 rounded-t-[20px]">
                  <img src={selectedRecipe.image} alt={selectedRecipe.name} className="h-[160px] w-auto object-contain" />
                </div>
              ) : (
                <RecipeIllustration recipeName={selectedRecipe.name} height={180} className="rounded-t-[20px]" />
              )}

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-1 font-body text-xs font-bold phase-${selectedRecipe.phase}-light`}>
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
                      style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-sm font-semibold" style={{ color: phaseColor }}>Ingredients</p>
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
                  <p className="font-body text-sm font-semibold mb-3" style={{ color: phaseColor }}>Method</p>
                  <ol className="space-y-2">
                    {selectedRecipe.method.map((step, j) => (
                      <li key={j} className="font-body text-sm text-muted-foreground leading-relaxed">
                        {j + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="font-display text-sm italic" style={{ color: phaseColor }}>
                  {selectedRecipe.phaseBenefit}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
