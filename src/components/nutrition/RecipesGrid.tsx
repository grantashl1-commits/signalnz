import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CakeSlice, Search, BookOpen } from "lucide-react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { Recipe } from "@/data/meal-plans";
import { RecipeShoppingButton, IngredientSearchLinks, ShoppingListPanel } from "@/components/ShoppingList";
import { useWakeLock } from "@/hooks/useWakeLock";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
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
  const [search, setSearch] = useState("");
  const { isSupported, isActive, toggle } = useWakeLock();

  const filtered = recipes.filter((r) => {
    const matchesPhase = phaseFilter === "all" || r.phase === phaseFilter;
    const matchesSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((ing) => ing.toLowerCase().includes(search.toLowerCase()));
    return matchesPhase && matchesSearch;
  });

  const handleReadMode = async () => {
    haptic("medium");
    await toggle();
    if (!isActive) {
      toast({
        description: "Screen will stay on while you cook.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-4">
      {showBakingHeader && (
        <div className="flex items-center gap-2 mb-1">
          <CakeSlice className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="font-display text-lg italic text-foreground">Healthy Baking</p>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }}
        />
      </div>

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

      {/* Results count */}
      {search && (
        <p className="font-body text-[11px] text-muted-foreground" style={{ fontWeight: 300 }}>
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found.
        </p>
      )}

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
              <RecipeImage recipeName={recipe.name} recipeImage={recipe.image} height={100} variant="card" />
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

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="font-hand text-sm text-muted-foreground">No recipes found.</p>
          <p className="font-body text-xs text-muted-foreground mt-1" style={{ fontWeight: 300 }}>
            Try a different search or filter.
          </p>
        </div>
      )}

      {/* Shopping list - below the grid */}
      <ShoppingListPanel />

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

              {/* Top right controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={handleReadMode}
                    className="touch-btn flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[11px] font-bold transition-all"
                    style={isActive
                      ? { backgroundColor: PHASE_HEX[selectedRecipe.phase], color: "white" }
                      : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }
                    }
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {isActive ? (
                      <>
                        Reading
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-gentle" />
                      </>
                    ) : (
                      "Read mode"
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="touch-btn p-2 rounded-full bg-secondary"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {!isSupported && (
                <div className="mx-5 mt-2 rounded-xl bg-secondary p-2">
                  <p className="font-body text-[10px] text-muted-foreground text-center">
                    To keep your screen on while cooking, go to Settings → Display and set screen timeout to 5 minutes.
                  </p>
                </div>
              )}

              <RecipeImage recipeName={selectedRecipe.name} recipeImage={selectedRecipe.image} height={180} variant="detail" />

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-1 font-hand text-[11px] font-bold phase-${selectedRecipe.phase}-light`}>
                      {PHASE_SHORT[selectedRecipe.phase]}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{selectedRecipe.prepTime}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Serves {selectedRecipe.serves}</span>
                    {selectedRecipe.category === "baking" && (
                      <span className="rounded-full px-2 py-0.5 font-hand text-[11px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                        <CakeSlice className="h-3 w-3" /> Baking
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold italic text-foreground">{selectedRecipe.name}</h2>
                </div>

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
