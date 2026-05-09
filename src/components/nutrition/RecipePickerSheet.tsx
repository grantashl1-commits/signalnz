import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { Recipe } from "@/data/meal-plans";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  /** Pre-filter to recipes for this phase. Pass `null` to show every phase. */
  phase: Phase | null;
  /** Optional category filter. If undefined, shows everything. */
  category?: Recipe["category"];
  /** Title shown at the top of the sheet (e.g. "Pick breakfast for Day 4"). */
  title: string;
  onPick: (recipe: Recipe) => void;
  onClose: () => void;
}

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

export default function RecipePickerSheet({ phase, category, title, onPick, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">(phase ?? "all");

  const filtered = useMemo(() => {
    return ALL_RECIPES.filter(r => {
      if (phaseFilter !== "all" && r.phase !== phaseFilter) return false;
      if (category && r.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some(i => i.toLowerCase().includes(q)) ||
          r.keyNutrients.some(n => n.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [phaseFilter, category, search]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
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
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pt-10 pb-6 space-y-4">
          <div>
            <h2 className="font-display text-lg italic text-foreground">{title}</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Choose a recipe from the nourish library. The ingredients will be added to your shopping list.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes or ingredients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus={false}
              className="w-full rounded-xl border border-border bg-secondary pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Phase pills */}
          <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
            <button
              onClick={() => { haptic("light"); setPhaseFilter("all"); }}
              className={`touch-btn scroll-snap-item rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap ${
                phaseFilter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
              }`}
            >
              All phases
            </button>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map(p => (
              <button
                key={p}
                onClick={() => { haptic("light"); setPhaseFilter(p); }}
                className={`touch-btn scroll-snap-item rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap`}
                style={
                  phaseFilter === p
                    ? { backgroundColor: PHASE_HEX[p], color: "white" }
                    : { backgroundColor: `${PHASE_HEX[p]}15`, color: PHASE_HEX[p] }
                }
              >
                {PHASE_SHORT[p]}
              </button>
            ))}
          </div>

          <p className="font-body text-[11px] text-muted-foreground">
            {filtered.length} recipe{filtered.length === 1 ? "" : "s"}
          </p>

          {/* Recipe grid */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.slice(0, 80).map((recipe, i) => (
                <motion.button
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.2 }}
                  onClick={() => { haptic("light"); onPick(recipe); }}
                  className="touch-card text-left card-warm overflow-hidden"
                >
                  <RecipeImage recipeName={recipe.name} recipeId={recipe.id} recipeImage={recipe.image} height={75} variant="card" />
                  <div className="px-3 pb-3 pt-1.5">
                    <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">{recipe.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className="rounded-full px-2 py-0.5 font-hand text-[10px] font-bold"
                        style={{ backgroundColor: `${PHASE_HEX[recipe.phase]}15`, color: PHASE_HEX[recipe.phase] }}
                      >
                        {PHASE_SHORT[recipe.phase]}
                      </span>
                      <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="font-hand text-sm text-muted-foreground">No recipes match.</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
