import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CakeSlice } from "lucide-react";
import { RecipeIllustration } from "@/components/MealIllustration";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { Recipe } from "@/data/meal-plans";
import { RecipeShoppingButton, IngredientSearchLinks, ShoppingListPanel } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

interface RecipesGridProps {
  recipes: Recipe[];
  currentPhase: Phase;
  showBakingHeader?: boolean;
}

export default function RecipesGrid({ recipes, currentPhase, showBakingHeader = false }: RecipesGridProps) {
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">(currentPhase);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = phaseFilter === "all" ? recipes : recipes.filter((r) => r.phase === phaseFilter);

  return (
    <div className="space-y-4">
      <ShoppingListPanel />

      {showBakingHeader && (
        <div className="flex items-center gap-2 mb-1">
          <CakeSlice className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="font-display text-lg italic text-foreground">Healthy Baking</p>
        </div>
      )}

      {/* Filter pills */}
      <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
        <button
          onClick={() => setPhaseFilter("all")}
          className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${
            phaseFilter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
          }`}
        >
          All
        </button>
        {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => setPhaseFilter(p)}
            className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${
              phaseFilter === p ? `phase-${p}` : `phase-${p}-light`
            }`}
          >
            {PHASE_SHORT[p]}
          </button>
        ))}
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.25 }}
          >
            <button
              onClick={() => {
                haptic("light");
                setSelectedRecipe(recipe);
              }}
              className="touch-card w-full text-left card-warm overflow-hidden"
            >
              <RecipeIllustration recipeName={recipe.name} height={100} />
              <div className="p-3">
                <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">
                  {recipe.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 font-hand text-[10px] font-bold phase-${recipe.phase}-light`}>
                    {PHASE_SHORT[recipe.phase]}
                  </span>
                  <span className="font-body text-[9px] text-muted-foreground" style={{ fontWeight: 300 }}>
                    {recipe.prepTime}
                  </span>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
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
              <button
                onClick={() => setSelectedRecipe(null)}
                className="touch-btn absolute top-4 right-4 p-2 rounded-full bg-secondary z-10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Large header illustration */}
              <RecipeIllustration recipeName={selectedRecipe.name} height={180} className="rounded-t-[20px]" />

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-1 font-hand text-[11px] font-bold phase-${selectedRecipe.phase}-light`}>
                      {PHASE_SHORT[selectedRecipe.phase]}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{selectedRecipe.prepTime}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">serves {selectedRecipe.serves}</span>
                    {selectedRecipe.category === "baking" && (
                      <span className="rounded-full px-2 py-0.5 font-hand text-[11px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                        <CakeSlice className="h-3 w-3" /> Baking
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold italic text-foreground">{selectedRecipe.name}</h2>
                </div>

                {/* Key nutrients */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecipe.keyNutrients.map((n) => (
                    <span
                      key={n}
                      className="rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${PHASE_HEX[selectedRecipe.phase]}15`,
                        color: PHASE_HEX[selectedRecipe.phase],
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-hand text-sm font-bold" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>
                      Ingredients
                    </p>
                    <RecipeShoppingButton
                      recipeId={selectedRecipe.id}
                      recipeName={selectedRecipe.name}
                      ingredients={selectedRecipe.ingredients}
                    />
                  </div>
                  <IngredientSearchLinks ingredients={selectedRecipe.ingredients} />
                </div>

                <BotanicalSprig width={100} opacity={0.15} />

                {/* Method */}
                <div>
                  <p className="font-hand text-sm font-bold mb-2" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>
                    Method
                  </p>
                  <ol className="space-y-1">
                    {selectedRecipe.method.map((step, j) => (
                      <li key={j} className="font-body text-xs text-muted-foreground">
                        {j + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Phase benefit */}
                <p className="font-display text-sm italic" style={{ color: PHASE_HEX[selectedRecipe.phase] }}>
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
