import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ChevronDown, X, Baby } from "lucide-react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { ALL_RECIPES } from "@/lib/recipe-index";
import { Recipe } from "@/data/meal-plans";
import { KIDS_RECIPE_BANK, KidsRecipe } from "@/data/kids-recipes";
import { RecipeShoppingButton } from "@/components/ShoppingList";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { useCycle } from "@/contexts/CycleContext";
import { useGatedExpand } from "@/hooks/useGatedExpand";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const PHASE_TINT: Record<Phase, string> = {
  menstrual: "rgba(196, 82, 110, 0.06)",
  follicular: "rgba(92, 74, 158, 0.05)",
  ovulatory: "rgba(210, 170, 100, 0.07)",
  luteal: "rgba(155, 137, 180, 0.06)",
};

const MEAL_TYPE_FILTERS = ["All", "Lunch/Dinner", "Breakfast", "Baking", "Snacks", "TCM", "Ayurveda", "Kids"] as const;
const TAG_FILTERS = ["High Protein", "Gut Health", "Anti-Inflammatory", "Vegan", "Iron-Rich", "Magnesium"] as const;

export default function DiscoverTab() {
  const { currentPhase } = useCycle();
  const { toggleSave, isSaved } = useSavedRecipes();
  const { guard: guardExpand } = useGatedExpand("nutrition_browse");
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [mealType, setMealType] = useState<string>("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedKidsRecipe, setSelectedKidsRecipe] = useState<KidsRecipe | null>(null);

  // Snack-like keywords for auto-tagging
  const SNACK_KEYWORDS = ["bliss ball", "bark", "nice cream", "energy ball", "slice", "mousse", "fudge", "custard", "rocher", "crumble ball"];
  const BREAKFAST_KEYWORDS = ["overnight oat", "smoothie", "pancake", "porridge", "granola", "breakfast", "oatmeal"];
  const BAKING_KEYWORDS = ["cookie", "cake", "brownie", "muffin", "biscuit", "loaf", "pancake", "slice", "fudge"];

  // Derive effective category for a recipe
  const getEffectiveCategory = (r: Recipe): string => {
    if (r.category) return r.category;
    const lower = r.name.toLowerCase();
    if (SNACK_KEYWORDS.some(k => lower.includes(k))) return "snack";
    if (BREAKFAST_KEYWORDS.some(k => lower.includes(k))) return "breakfast";
    if (BAKING_KEYWORDS.some(k => lower.includes(k))) return "baking";
    return "meal";
  };

  // Single canonical source — covers meals, breakfast, baking, snacks
  const allRecipes = ALL_RECIPES;

  // Get saved recipes
  const savedRecipes = useMemo(() => allRecipes.filter(r => isSaved(r.id)), [allRecipes, isSaved]);

  // Filter
  const filtered = useMemo(() => {
    return allRecipes.filter(r => {
      if (phaseFilter !== "all" && r.phase !== phaseFilter) return false;
      if (mealType !== "All") {
        if (mealType === "TCM") {
          if (!r.tags?.includes("TCM")) return false;
        } else if (mealType === "Ayurveda") {
          if (!r.tags?.includes("Ayurveda")) return false;
        } else {
          const cat = getEffectiveCategory(r);
          if (mealType === "Baking" && cat !== "baking") return false;
          if (mealType === "Breakfast" && cat !== "breakfast") return false;
          if (mealType === "Snacks" && cat !== "snack") return false;
          if (mealType === "Lunch/Dinner" && cat !== "meal") return false;
        }
      }
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) ||
          r.ingredients.some(i => i.toLowerCase().includes(q)) ||
          r.keyNutrients.some(n => n.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allRecipes, phaseFilter, mealType, search]);

  // Kids recipe filtering
  const filteredKids = useMemo(() => {
    if (mealType !== "Kids") return [];
    return KIDS_RECIPE_BANK.filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q)) ||
        r.protein.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));
    });
  }, [mealType, search]);

  return (
    <div className="space-y-5">
      {/* Saved recipes section */}
      {savedRecipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-base italic text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary fill-primary" /> Saved Recipes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {savedRecipes.slice(0, 4).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} isSaved={true} onToggleSave={() => toggleSave(recipe.id)} onSelect={() => setSelectedRecipe(recipe)} />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }}
        />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Phase pills — hidden for Kids */}
        {mealType !== "Kids" && (
          <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
            <button onClick={() => { haptic("light"); setPhaseFilter("all"); }}
              className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${phaseFilter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
              All phases
            </button>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map(p => (
              <button key={p} onClick={() => { haptic("light"); setPhaseFilter(p); }}
                className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${phaseFilter === p ? `phase-${p}` : `phase-${p}-light`}`}>
                {PHASE_SHORT[p]}
              </button>
            ))}
          </div>
        )}
        {/* Meal type pills */}
        <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
          {MEAL_TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => { haptic("light"); setMealType(t); }}
              className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${mealType === t ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="font-body text-[11px] text-muted-foreground">
          {mealType === "Kids" ? filteredKids.length : filtered.length} recipe{(mealType === "Kids" ? filteredKids.length : filtered.length) !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Kids recipe grid */}
      {mealType === "Kids" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filteredKids.slice(0, 30).map((recipe, i) => (
              <KidsRecipeCard key={recipe.id} recipe={recipe} onSelect={() => setSelectedKidsRecipe(recipe)} index={i} />
            ))}
          </div>
          {filteredKids.length === 0 && (
            <div className="text-center py-8">
              <p className="font-hand text-sm text-muted-foreground">No kids recipes found.</p>
            </div>
          )}
        </>
      )}

      {/* Adult recipe grid */}
      {mealType !== "Kids" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filtered.slice(0, 20).map((recipe, i) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={isSaved(recipe.id)}
                onToggleSave={() => toggleSave(recipe.id)}
                onSelect={() => { if (guardExpand()) setSelectedRecipe(recipe); }}
                index={i}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="font-hand text-sm text-muted-foreground">No recipes found.</p>
            </div>
          )}
        </>
      )}

      {/* Recipe detail bottom sheets */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailSheet recipe={selectedRecipe} isSaved={isSaved(selectedRecipe.id)} onToggleSave={() => toggleSave(selectedRecipe.id)} onClose={() => setSelectedRecipe(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedKidsRecipe && (
          <KidsRecipeDetailSheet recipe={selectedKidsRecipe} onClose={() => setSelectedKidsRecipe(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Kids Recipe Card ── */
const PROTEIN_COLORS: Record<string, string> = {
  chicken: "#E2A84B", beef: "#B25C3A", fish: "#4A90B8", tofu: "#6BAE75",
  beans: "#8B6B4A", lentils: "#C4894B", eggs: "#E8C84A", cheese: "#D4A843",
  pork: "#D47A6A", shrimp: "#E8866A", none: "#9B89B4",
};

function KidsRecipeCard({ recipe, onSelect, index = 0 }: { recipe: KidsRecipe; onSelect: () => void; index?: number }) {
  const color = PROTEIN_COLORS[recipe.protein] || "#9B89B4";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index, duration: 0.25 }}>
      <button onClick={() => { haptic("light"); onSelect(); }} className="touch-card w-full text-left card-warm overflow-hidden">
        <div className="px-3 py-3 space-y-2">
          <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">{recipe.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full px-2 py-0.5 font-hand text-[10px] font-bold capitalize"
              style={{ backgroundColor: `${color}18`, color }}>
              {recipe.protein === "none" ? "plant-based" : recipe.protein}
            </span>
            <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
          </div>
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 2).map(tag => (
                <span key={tag} className="font-body text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}

/* ── Kids Recipe Detail Sheet ── */
function KidsRecipeDetailSheet({ recipe, onClose }: { recipe: KidsRecipe; onClose: () => void }) {
  const [servings, setServings] = useState(recipe.serves);
  const scale = servings / recipe.serves;
  const color = PROTEIN_COLORS[recipe.protein] || "#9B89B4";

  const scaleIngredient = (ing: string): string => {
    if (scale === 1) return ing;
    const match = ing.match(/^([\d.½⅓⅔¼¾]+)/);
    if (match) {
      const num = parseFloat(match[1]) * scale;
      return ing.replace(match[1], num % 1 === 0 ? String(num) : num.toFixed(1));
    }
    return ing;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
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
        <div className="p-5 pt-10 space-y-4">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="rounded-full px-2.5 py-0.5 font-hand text-[10px] font-bold capitalize"
                style={{ backgroundColor: `${color}18`, color }}>
                {recipe.protein === "none" ? "plant-based" : recipe.protein}
              </span>
              {recipe.tags.map(tag => (
                <span key={tag} className="rounded-full px-2.5 py-0.5 font-body text-[10px] text-muted-foreground bg-secondary">{tag}</span>
              ))}
            </div>
            <h2 className="font-display text-xl font-bold italic text-foreground">{recipe.name}</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">{recipe.prepTime}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-muted-foreground">Serves</span>
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">−</button>
            <span className="font-body text-sm font-bold text-foreground w-6 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">+</button>
          </div>

          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>Ingredients</p>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, j) => (
                <li key={j} className="font-body text-xs text-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/40 mt-1">•</span>{scaleIngredient(ing)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color }}>Method</p>
            <ol className="space-y-1">
              {recipe.method.map((step, j) => (
                <li key={j} className="font-body text-xs text-muted-foreground">{j + 1}. {step}</li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function RecipeCard({ recipe, isSaved, onToggleSave, onSelect, index = 0 }: {
  recipe: Recipe; isSaved: boolean; onToggleSave: () => void; onSelect: () => void; index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index, duration: 0.25 }}>
      <div className="relative">
        <button onClick={onSelect} className="touch-card w-full text-left card-warm overflow-hidden"
          style={{ background: `linear-gradient(to bottom, ${PHASE_TINT[recipe.phase]} 40%, transparent 60%)` }}>
          <RecipeImage recipeName={recipe.name} recipeId={recipe.id} recipeImage={recipe.image} height={75} variant="card" />
          <div className="px-3 pb-3 pt-1.5">
            <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">{recipe.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="rounded-full px-2 py-0.5 font-hand text-[10px] font-bold"
                style={{ backgroundColor: `${PHASE_HEX[recipe.phase]}15`, color: PHASE_HEX[recipe.phase] }}>
                {PHASE_SHORT[recipe.phase]}
              </span>
              <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
            </div>
          </div>
        </button>
        {/* Heart icon */}
        <button
          onClick={(e) => { e.stopPropagation(); haptic("light"); onToggleSave(); }}
          className="absolute top-2 right-2 touch-btn p-1.5 rounded-full bg-card/80 backdrop-blur-sm"
        >
          <Heart className={`h-4 w-4 transition-all ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} style={isSaved ? { color: PHASE_HEX[recipe.phase] } : {}} />
        </button>
      </div>
    </motion.div>
  );
}

function RecipeDetailSheet({ recipe, isSaved, onToggleSave, onClose }: {
  recipe: Recipe; isSaved: boolean; onToggleSave: () => void; onClose: () => void;
}) {
  const [servings, setServings] = useState(recipe.serves);
  const scale = servings / recipe.serves;
  const phaseColor = PHASE_HEX[recipe.phase];

  const scaleIngredient = (ing: string): string => {
    if (scale === 1) return ing;
    const match = ing.match(/^([\d.½⅓⅔¼¾]+)/);
    if (match) {
      const num = parseFloat(match[1]) * scale;
      return ing.replace(match[1], num % 1 === 0 ? String(num) : num.toFixed(1));
    }
    return ing;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] border-t border-border"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button onClick={onToggleSave} className="touch-btn p-2 rounded-full bg-secondary">
            <Heart className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <RecipeImage recipeName={recipe.name} recipeId={recipe.id} recipeImage={recipe.image} height={180} variant="detail" />

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="rounded-full px-2.5 py-1 font-hand text-[11px] font-bold"
                style={{ backgroundColor: `${PHASE_HEX[recipe.phase]}15`, color: PHASE_HEX[recipe.phase] }}>{PHASE_SHORT[recipe.phase]}</span>
              <span className="font-body text-[10px] text-muted-foreground">{recipe.prepTime}</span>
            </div>
            <h2 className="font-display text-xl font-bold italic text-foreground">{recipe.name}</h2>
            
            {/* Nutrition pills */}
            {(recipe as any).nutrition && (
              <div className="flex gap-2 mt-2">
                {["protein", "carbs", "fat"].map(k => (
                  <span key={k} className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {k.charAt(0).toUpperCase() + k.slice(1)} {(recipe as any).nutrition[k]}g
                  </span>
                ))}
                {(recipe as any).nutrition.calories && (
                  <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {(recipe as any).nutrition.calories} cal
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Serves stepper */}
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-muted-foreground">Serves</span>
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">−</button>
            <span className="font-body text-sm font-bold text-foreground w-6 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">+</button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recipe.keyNutrients.map(n => (
              <span key={n} className="rounded-full px-2.5 py-0.5 font-body text-[10px] font-bold uppercase" style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}>{n}</span>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Ingredients</p>
              <RecipeShoppingButton recipeId={recipe.id} recipeName={recipe.name} ingredients={recipe.ingredients} />
            </div>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, j) => (
                <li key={j} className="font-body text-xs text-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/40 mt-1">•</span> {scaleIngredient(ing)}
                </li>
              ))}
            </ul>
          </div>

          <BotanicalSprig width={100} opacity={0.15} />

          <div>
            <p className="font-hand text-sm font-bold mb-2" style={{ color: phaseColor }}>Method</p>
            <ol className="space-y-1">
              {recipe.method.map((step, j) => (
                <li key={j} className="font-body text-xs text-muted-foreground">{j + 1}. {step}</li>
              ))}
            </ol>
          </div>

          <p className="font-display text-sm italic" style={{ color: phaseColor }}>{recipe.phaseBenefit}</p>

          {recipe.kidAlternative && <KidAlternativeNote text={recipe.kidAlternative} phaseColor={phaseColor} />}
        </div>
      </motion.div>
    </>
  );
}

/* ── A version for the little ones ── */
function KidAlternativeNote({ text, phaseColor }: { text: string; phaseColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-secondary/40 border border-border/40 overflow-hidden">
      <button
        onClick={() => { haptic("light"); setOpen(!open); }}
        className="touch-btn w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Baby className="h-3.5 w-3.5" style={{ color: phaseColor }} />
          <span className="font-display text-xs italic" style={{ color: phaseColor }}>
            A version for the little ones
          </span>
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-body text-xs text-muted-foreground leading-relaxed px-4 pb-4">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
