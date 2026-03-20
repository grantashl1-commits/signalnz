import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Check, Leaf } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { ALL_MEAL_RECIPES } from "@/lib/recipe-index";
import { RecipeShoppingButton } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface AIRecipesTabProps {
  phase: Phase;
  cycleDay: number;
}

export default function AIRecipesTab({ phase, cycleDay }: AIRecipesTabProps) {
  const [filter, setFilter] = useState<Phase | "all">(phase);

  const recipes = useMemo(() => {
    const pool = ALL_MEAL_RECIPES.filter((r) =>
      filter === "all" ? true : r.phase === filter
    );
    // Shuffle deterministically by cycle day for variety
    return [...pool].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + cycleDay) % 100;
      const hb = (b.id.charCodeAt(0) + cycleDay) % 100;
      return ha - hb;
    });
  }, [filter, cycleDay]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg italic text-foreground">AI Recipes</h2>
        <span className="ml-auto rounded-full px-2.5 py-1 bg-primary/10 text-primary font-body text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Leaf className="h-3 w-3" /> Phase-matched
        </span>
      </div>

      <p className="font-body text-sm text-muted-foreground leading-relaxed">
        Recipes curated for your <span className="font-semibold text-foreground">{PHASE_SHORT[phase]}</span> phase — optimised nutrients for day {cycleDay}.
      </p>

      {/* Phase filter pills */}
      <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
        <button
          onClick={() => { haptic("light"); setFilter("all"); }}
          className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${
            filter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
          }`}
        >
          All phases
        </button>
        {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => { haptic("light"); setFilter(p); }}
            className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${
              filter === p ? `phase-${p}` : `phase-${p}-light`
            }`}
          >
            {PHASE_SHORT[p]}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      <div className="space-y-3">
        {recipes.slice(0, 12).map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.25 }}
            className="card-warm p-4 flex gap-4"
          >
            {/* Left: illustration or color block */}
            {recipe.image ? (
              <img
                src={recipe.image}
                alt={recipe.name}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div
                className="h-20 w-20 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${PHASE_HEX[recipe.phase]}15` }}
              >
                <Sparkles className="h-6 w-6" style={{ color: PHASE_HEX[recipe.phase] }} />
              </div>
            )}

            {/* Right: info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm italic text-foreground leading-tight line-clamp-2 mb-1.5">
                {recipe.name}
              </h3>

              {/* Key nutrients as ingredient chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {recipe.keyNutrients.slice(0, 3).map((n) => (
                  <span
                    key={n}
                    className="rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase"
                    style={{
                      backgroundColor: `${PHASE_HEX[recipe.phase]}12`,
                      color: PHASE_HEX[recipe.phase],
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>

              {/* Phase tag + shopping button */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 font-hand text-[10px] font-bold phase-${recipe.phase}-light`}>
                  {PHASE_SHORT[recipe.phase]}
                </span>
                <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
                <div className="ml-auto">
                  <RecipeShoppingButton
                    recipeId={recipe.id}
                    recipeName={recipe.name}
                    ingredients={recipe.ingredients}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-8">
          <p className="font-hand text-sm text-muted-foreground">No recipes for this filter.</p>
        </div>
      )}
    </div>
  );
}
