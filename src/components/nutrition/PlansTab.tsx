import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Phase, PHASE_SHORT, PHASE_DAYS } from "@/lib/cycle-utils";
import { PHASE_MEAL_PLANS, RECIPES, Recipe } from "@/data/meal-plans";
import { PDF_RECIPES } from "@/data/pdf-recipes";
import { RecipeIllustration } from "@/components/MealIllustration";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { RecipeShoppingButton, IngredientSearchLinks } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const ALL_RECIPES: Recipe[] = [...RECIPES, ...PDF_RECIPES];

function findRecipe(mealName: string): Recipe | undefined {
  const lower = mealName.toLowerCase();
  return ALL_RECIPES.find((r) => r.name.toLowerCase() === lower) ||
    ALL_RECIPES.find((r) => lower.includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(lower));
}

interface PlansTabProps {
  phase: Phase;
  cycleDay: number;
}

interface MealTile {
  name: string;
  recipe?: Recipe;
  day: number;
}

export default function PlansTab({ phase, cycleDay }: PlansTabProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const plan = PHASE_MEAL_PLANS[phase];
  const phaseColor = PHASE_HEX[phase];
  const [phaseStart, phaseEnd] = PHASE_DAYS[phase];

  // Collect unique meals per type
  const breakfasts: MealTile[] = [];
  const lunches: MealTile[] = [];
  const dinners: MealTile[] = [];
  const seenB = new Set<string>();
  const seenL = new Set<string>();
  const seenD = new Set<string>();

  plan.days.forEach((day) => {
    const bName = day.breakfast.split(" — ")[0];
    if (!seenB.has(bName.toLowerCase())) {
      seenB.add(bName.toLowerCase());
      breakfasts.push({ name: bName, recipe: findRecipe(bName), day: day.day });
    }
    const lName = day.lunch.split(" — ")[0];
    if (!seenL.has(lName.toLowerCase())) {
      seenL.add(lName.toLowerCase());
      lunches.push({ name: lName, recipe: findRecipe(lName), day: day.day });
    }
    const dName = day.dinner.split(" — ")[0];
    if (!seenD.has(dName.toLowerCase())) {
      seenD.add(dName.toLowerCase());
      dinners.push({ name: dName, recipe: findRecipe(dName), day: day.day });
    }
  });

  const sections = [
    { label: "B", title: "Breakfast", tiles: breakfasts },
    { label: "L", title: "Lunch", tiles: lunches },
    { label: "D", title: "Dinner", tiles: dinners },
  ];

  return (
    <div className="space-y-6">
      {/* Phase header */}
      <div>
        <span className={`inline-block rounded-full px-3 py-1.5 font-hand text-sm font-bold phase-${phase}-light`}>
          Your {PHASE_SHORT[phase].toLowerCase()} plan · days {phaseStart}–{phaseEnd}
        </span>
        <p className="font-body text-xs italic text-muted-foreground mt-2" style={{ fontWeight: 300 }}>
          Plans update automatically as your cycle moves.
        </p>
      </div>

      {/* Theme */}
      <p className="font-display text-sm italic text-foreground">{plan.theme}.</p>

      {/* B / L / D sections */}
      {sections.map((section) => (
        <div key={section.label} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white"
              style={{ backgroundColor: phaseColor }}
            >
              {section.label}
            </span>
            <span className="font-hand text-sm font-bold" style={{ color: phaseColor }}>
              {section.title}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {section.tiles.map((tile, i) => (
              <motion.div
                key={tile.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.25 }}
              >
                <button
                  onClick={() => {
                    haptic("light");
                    if (tile.recipe) setSelectedRecipe(tile.recipe);
                  }}
                  className="touch-card w-full text-left card-warm overflow-hidden"
                >
                  {tile.recipe?.image ? (
                    <div className="w-full h-[80px] flex items-center justify-center bg-secondary/30">
                      <img src={tile.recipe.image} alt={tile.name} className="h-[70px] w-auto object-contain" loading="lazy" />
                    </div>
                  ) : (
                    <RecipeIllustration recipeName={tile.name} height={80} />
                  )}
                  <div className="p-2">
                    <h3 className="font-display text-[11px] italic text-foreground leading-tight line-clamp-2">
                      {tile.name}
                    </h3>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

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
                <div className="w-full h-[180px] flex items-center justify-center bg-secondary/30 rounded-t-[20px]">
                  <img src={selectedRecipe.image} alt={selectedRecipe.name} className="h-[160px] w-auto object-contain" />
                </div>
              ) : (
                <RecipeIllustration recipeName={selectedRecipe.name} height={180} className="rounded-t-[20px]" />
              )}

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-1 font-hand text-[11px] font-bold phase-${selectedRecipe.phase}-light`}>
                      {PHASE_SHORT[selectedRecipe.phase]}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{selectedRecipe.prepTime}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Serves {selectedRecipe.serves}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold italic text-foreground">{selectedRecipe.name}</h2>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedRecipe.keyNutrients.map((n) => (
                    <span
                      key={n}
                      className="rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Ingredients</p>
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
                  <p className="font-hand text-sm font-bold mb-2" style={{ color: phaseColor }}>Method</p>
                  <ol className="space-y-1">
                    {selectedRecipe.method.map((step, j) => (
                      <li key={j} className="font-body text-xs text-muted-foreground">
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
