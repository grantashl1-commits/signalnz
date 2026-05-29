import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ChevronDown, X, Baby, Filter as FilterIcon, CalendarPlus, Check } from "lucide-react";
import { toast } from "sonner";
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
import { addRecipeToMyWeek } from "@/lib/add-to-my-week";
import type { MealSlot } from "@/hooks/useCustomMealPlan";

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

const MEAL_TYPE_OPTIONS = ["All", "Breakfast", "Lunch/Dinner", "Snack", "Baking"] as const;
const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Nut-free", "Egg-free"] as const;
const PROTEIN_OPTIONS = ["Chicken", "Beef/Lamb", "Fish", "Tofu/Tempeh", "Eggs", "Legumes", "Plant-based"] as const;

/** Detect dietary tags from a recipe's tags + ingredients heuristically. */
function FilterSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">{title}</p>
        {hint && <p className="font-body text-[10px] text-muted-foreground/70 italic">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => { haptic("light"); onClick(); }}
      className={`touch-btn rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap ${
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function recipeDietaryTags(r: Recipe): Set<string> {
  const tags = new Set<string>();
  const tagSet = new Set((r.tags || []).map(t => t.toLowerCase()));
  if (tagSet.has("vegan")) tags.add("Vegan");
  if (tagSet.has("vegetarian") || tagSet.has("vegan")) tags.add("Vegetarian");
  if (tagSet.has("gluten-free") || tagSet.has("gf")) tags.add("Gluten-free");
  if (tagSet.has("dairy-free") || tagSet.has("df") || tagSet.has("vegan")) tags.add("Dairy-free");
  const ing = r.ingredients.join(" ").toLowerCase();
  if (!/\b(almond|peanut|cashew|hazelnut|walnut|pecan|pistachio|macadamia|brazil nut)\b/.test(ing)) tags.add("Nut-free");
  if (!/\b(eggs?|omelette)\b/.test(ing)) tags.add("Egg-free");
  return tags;
}

/** Detect primary protein source(s) from ingredients. */
function recipeProteinSources(r: Recipe): Set<string> {
  const text = (r.name + " " + r.ingredients.join(" ")).toLowerCase();
  const out = new Set<string>();
  if (/\b(chicken|poultry|turkey)\b/.test(text)) out.add("Chicken");
  if (/\b(beef|mince|steak|lamb)\b/.test(text)) out.add("Beef/Lamb");
  if (/\b(fish|salmon|tuna|sardine|mackerel|cod|prawn|shrimp)\b/.test(text)) out.add("Fish");
  if (/\b(tofu|tempeh|edamame)\b/.test(text)) out.add("Tofu/Tempeh");
  if (/\b(eggs?|omelette)\b/.test(text)) out.add("Eggs");
  if (/\b(lentils?|chickpeas?|black beans?|kidney beans?|cannellini|legumes?|dhal|dal)\b/.test(text)) out.add("Legumes");
  if (out.size === 0 || (r.tags || []).map(t => t.toLowerCase()).includes("vegan")) out.add("Plant-based");
  return out;
}

export default function DiscoverTab() {
  const { currentPhase } = useCycle();
  const { toggleSave, isSaved } = useSavedRecipes();
  const { guard: guardExpand } = useGatedExpand("nutrition_browse");
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [mealType, setMealType] = useState<string>("All");
  const [dietary, setDietary] = useState<Set<string>>(new Set());
  const [protein, setProtein] = useState<Set<string>>(new Set());
  const [kidsMode, setKidsMode] = useState(false);
  const [lunchboxMode, setLunchboxMode] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedKidsRecipe, setSelectedKidsRecipe] = useState<KidsRecipe | null>(null);

  const activeFilterCount =
    (phaseFilter !== "all" ? 1 : 0) +
    (mealType !== "All" ? 1 : 0) +
    dietary.size +
    protein.size +
    (kidsMode ? 1 : 0) +
    (lunchboxMode ? 1 : 0);

  const toggleSetItem = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const clearAllFilters = () => {
    setPhaseFilter("all");
    setMealType("All");
    setDietary(new Set());
    setProtein(new Set());
    setKidsMode(false);
    setLunchboxMode(false);
  };

  // Heuristic: lunchbox-ready or freezer-friendly
  const isLunchboxOrFreezer = (
    text: string,
    tags: string[] = [],
    name = "",
  ): boolean => {
    const tagSet = new Set(tags.map(t => t.toLowerCase()));
    if (
      tagSet.has("lunchbox") ||
      tagSet.has("freezer-friendly") ||
      tagSet.has("freezer") ||
      tagSet.has("make-ahead") ||
      tagSet.has("batch") ||
      tagSet.has("meal-prep") ||
      tagSet.has("portable") ||
      tagSet.has("no-bake")
    ) return true;
    const t = text.toLowerCase();
    const n = name.toLowerCase();
    // Name-based: anything obviously portable / batch-bake / freezable
    if (/\b(bliss ball|energy ball|protein ball|bar\b|bars\b|slice\b|slices\b|muffin|loaf|wrap|sandwich|pinwheel|fritter|patties|patty|fudge|brownie|cookie|biscuit|frittata|quiche|pie\b|tart|nice cream|popsicle|granola|overnight oat|chia pudding|hummus|dip|pesto|sauce|soup|stew|chilli|chili|curry|dahl|dhal|dal|lasagne|lasagna|bolognese|risotto|casserole|bake\b|tray bake|sheet pan|meatball|nuggets|tenders|salad jar)\b/.test(n)) return true;
    // Method/ingredient text-based
    return /\b(lunchbox|pack for lunch|pack into|portable|freezer|freeze\b|freezes? well|freeze for|freeze \d|store in (the )?freezer|store in (the )?fridge|keeps? \d|make[- ]ahead|batch cook|meal prep|no[- ]bake)\b/.test(t);
  };


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
    const list = allRecipes.filter(r => {
      if (phaseFilter !== "all" && r.phase !== phaseFilter) return false;
      if (mealType !== "All") {
        const cat = getEffectiveCategory(r);
        if (mealType === "Breakfast" && cat !== "breakfast") return false;
        if (mealType === "Lunch/Dinner" && cat !== "meal") return false;
        if (mealType === "Snack" && cat !== "snack") return false;
        if (mealType === "Baking" && cat !== "baking") return false;
      }
      if (dietary.size > 0) {
        const recipeDiet = recipeDietaryTags(r);
        for (const want of dietary) if (!recipeDiet.has(want)) return false;
      }
      if (protein.size > 0) {
        const recipeProt = recipeProteinSources(r);
        let any = false;
        for (const want of protein) if (recipeProt.has(want)) { any = true; break; }
        if (!any) return false;
      }
      if (lunchboxMode) {
        const text = r.name + " " + r.method.join(" ") + " " + r.ingredients.join(" ");
        if (!isLunchboxOrFreezer(text, r.tags || [])) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) ||
          r.ingredients.some(i => i.toLowerCase().includes(q)) ||
          r.keyNutrients.some(n => n.toLowerCase().includes(q));
      }
      return true;
    });

    // Default ordering: current phase first (so today's recipes lead),
    // then the remaining phases in cycle order, alphabetical within each phase.
    const phaseOrder: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
    const rotated = [currentPhase, ...phaseOrder.filter(p => p !== currentPhase)];
    const phaseRank = new Map(rotated.map((p, i) => [p, i]));
    return list.sort((a, b) => {
      const pa = phaseRank.get(a.phase) ?? 99;
      const pb = phaseRank.get(b.phase) ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
  }, [allRecipes, phaseFilter, mealType, search, dietary, protein, lunchboxMode, currentPhase]);

  // Pagination — "Load more" reveals another batch.
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [phaseFilter, mealType, search, dietary, protein, kidsMode, lunchboxMode]);

  // Kids recipe filtering — uses the separate KIDS_RECIPE_BANK library when kidsMode is on.
  const filteredKids = useMemo(() => {
    if (!kidsMode) return [];
    return KIDS_RECIPE_BANK.filter(r => {
      if (lunchboxMode) {
        const text = r.name + " " + r.method.join(" ") + " " + r.ingredients.join(" ");
        const includesLunchSlot = r.mealType.includes("lunch");
        if (!isLunchboxOrFreezer(text, r.tags) && !includesLunchSlot) return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q)) ||
        r.protein.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));
    });
  }, [kidsMode, lunchboxMode, search]);

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

      {/* Quick dietary chips — always visible for one-tap filtering */}
      <div className="scroll-snap-x flex gap-1.5 -mx-1 px-1 overflow-x-auto">
        {DIETARY_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => { haptic("light"); toggleSetItem(dietary, d, setDietary); }}
            className={`scroll-snap-item flex-shrink-0 touch-btn rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap ${
              dietary.has(d) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => { haptic("light"); setFiltersOpen(o => !o); }}
          className="touch-btn w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 min-h-[44px] font-body text-sm text-foreground transition-all"
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-body text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
            {/* Quick toggles outside the dropdown for one-tap access */}
            <span
              role="checkbox"
              aria-checked={kidsMode}
              onClick={(e) => { e.stopPropagation(); haptic("light"); setKidsMode(v => !v); }}
              className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-[11px] font-medium transition-all ${kidsMode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
            >
              <Baby className="h-3 w-3" /> Kids
            </span>
            <span
              role="checkbox"
              aria-checked={lunchboxMode}
              onClick={(e) => { e.stopPropagation(); haptic("light"); setLunchboxMode(v => !v); }}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-[11px] font-medium transition-all ${lunchboxMode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
            >
              🥪 Lunchbox & freezer
            </span>
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                {/* Cycle phase */}
                <FilterSection title="Cycle phase">
                  <FilterPill active={phaseFilter === "all"} onClick={() => setPhaseFilter("all")}>All phases</FilterPill>
                  {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map(p => (
                    <button
                      key={p}
                      onClick={() => { haptic("light"); setPhaseFilter(p); }}
                      className={`touch-btn rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap`}
                      style={
                        phaseFilter === p
                          ? { backgroundColor: PHASE_HEX[p], color: "white" }
                          : { backgroundColor: `${PHASE_HEX[p]}15`, color: PHASE_HEX[p] }
                      }
                    >
                      {PHASE_SHORT[p]}
                    </button>
                  ))}
                </FilterSection>

                {/* Meal type */}
                <FilterSection title="Meal type">
                  {MEAL_TYPE_OPTIONS.map(t => (
                    <FilterPill key={t} active={mealType === t} onClick={() => setMealType(t)}>{t}</FilterPill>
                  ))}
                </FilterSection>

                {/* Dietary preferences */}
                <FilterSection title="Dietary preferences" hint="Tap to add — multiple stack">
                  {DIETARY_OPTIONS.map(d => (
                    <FilterPill key={d} active={dietary.has(d)} onClick={() => toggleSetItem(dietary, d, setDietary)}>{d}</FilterPill>
                  ))}
                </FilterSection>

                {/* Protein source */}
                <FilterSection title="Protein source" hint="Tap to add — any match">
                  {PROTEIN_OPTIONS.map(p => (
                    <FilterPill key={p} active={protein.has(p)} onClick={() => toggleSetItem(protein, p, setProtein)}>{p}</FilterPill>
                  ))}
                </FilterSection>

                {/* Kids */}
                <FilterSection title="For the little ones" hint="Switches to the kids recipe library">
                  <FilterPill active={kidsMode} onClick={() => setKidsMode(v => !v)}>
                    <Baby className="inline-block h-3 w-3 mr-1" />
                    Show kids recipes
                  </FilterPill>
                </FilterSection>

                {/* Lunchbox & freezer */}
                <FilterSection title="Lunchbox & freezer" hint="Pack-ahead and freezer-friendly only">
                  <FilterPill active={lunchboxMode} onClick={() => setLunchboxMode(v => !v)}>
                    🥪 Lunchbox & freezer-friendly
                  </FilterPill>
                </FilterSection>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => { haptic("light"); clearAllFilters(); }}
                    disabled={activeFilterCount === 0}
                    className="font-body text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => { haptic("light"); setFiltersOpen(false); }}
                    className="touch-btn rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-body text-xs font-bold"
                  >
                    Show {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      {search && (
        <p className="font-body text-[11px] text-muted-foreground">
          {kidsMode ? filteredKids.length : filtered.length} recipe{(kidsMode ? filteredKids.length : filtered.length) !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Kids recipe grid */}
      {kidsMode && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filteredKids.slice(0, visibleCount).map((recipe, i) => (
              <KidsRecipeCard key={recipe.id} recipe={recipe} onSelect={() => setSelectedKidsRecipe(recipe)} index={i} />
            ))}
          </div>
          {filteredKids.length > visibleCount && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="font-body text-[11px] text-muted-foreground">
                Showing {visibleCount} of {filteredKids.length}
              </p>
              <button
                onClick={() => { haptic("light"); setVisibleCount(c => c + PAGE_SIZE); }}
                className="touch-btn rounded-full bg-primary text-primary-foreground px-5 py-2 font-body text-xs font-bold"
              >
                Load more
              </button>
            </div>
          )}
          {filteredKids.length === 0 && (
            <div className="text-center py-8">
              <p className="font-hand text-sm text-muted-foreground">No kids recipes found.</p>
            </div>
          )}
        </>
      )}

      {/* Adult recipe grid */}
      {!kidsMode && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filtered.slice(0, visibleCount).map((recipe, i) => (
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
          {filtered.length > visibleCount && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="font-body text-[11px] text-muted-foreground">
                Showing {visibleCount} of {filtered.length}
              </p>
              <button
                onClick={() => { haptic("light"); setVisibleCount(c => c + PAGE_SIZE); }}
                className="touch-btn rounded-full bg-primary text-primary-foreground px-5 py-2 font-body text-xs font-bold"
              >
                Load more
              </button>
            </div>
          )}
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
  const { currentCycleDay, getCycleDayForDate } = useCycle();
  const [servings, setServings] = useState(recipe.serves);
  const [showAddToWeek, setShowAddToWeek] = useState(false);
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
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Ingredients</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { haptic("light"); setShowAddToWeek(v => !v); }}
                  className="touch-btn flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium bg-primary/10 text-primary"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Add to my week
                </button>
                <RecipeShoppingButton recipeId={recipe.id} recipeName={recipe.name} ingredients={recipe.ingredients} />
              </div>
            </div>
            <AddToWeekPicker
              recipe={recipe}
              isOpen={showAddToWeek}
              currentCycleDay={currentCycleDay}
              getCycleDayForDate={getCycleDayForDate}
              phaseColor={phaseColor}
              onPicked={() => setShowAddToWeek(false)}
            />
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

/* ── Add to my week — inline day × slot picker ── */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_LABELS: { key: MealSlot; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

function AddToWeekPicker({
  recipe,
  isOpen,
  currentCycleDay,
  getCycleDayForDate,
  phaseColor,
  onPicked,
}: {
  recipe: Recipe;
  isOpen: boolean;
  currentCycleDay: number;
  getCycleDayForDate: (d: Date) => number;
  phaseColor: string;
  onPicked: () => void;
}) {
  // Build the next 7 days (Mon → Sun of current week)
  const days = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d,
        cycleDay: getCycleDayForDate(d),
        label: DAY_LABELS[i],
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  }, [getCycleDayForDate]);

  const [picked, setPicked] = useState<{ cycleDay: number; slot: MealSlot } | null>(null);

  const handlePick = (cycleDay: number, slot: MealSlot) => {
    haptic("medium");
    const result = addRecipeToMyWeek(recipe, cycleDay, slot);
    setPicked({ cycleDay, slot });
    toast.success(
      result.addedToAIPlan
        ? `Held for ${slot} — your plan will reflect it.`
        : `Held for ${slot}.`
    );
    setTimeout(() => {
      setPicked(null);
      onPicked();
    }, 900);
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl bg-secondary/40 p-3 mb-3 space-y-2">
            <p className="font-body text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">
              Choose a day & meal
            </p>
            <div className="space-y-1.5">
              {days.map(d => (
                <div key={d.cycleDay} className="flex items-center gap-2">
                  <div className="w-12 flex-shrink-0">
                    <p className="font-body text-xs font-semibold text-foreground">
                      {d.label}{d.isToday && <span className="ml-1 text-[9px] text-muted-foreground">today</span>}
                    </p>
                    <p className="font-body text-[9px] text-muted-foreground">D{d.cycleDay}</p>
                  </div>
                  <div className="flex gap-1 flex-1">
                    {SLOT_LABELS.map(s => {
                      const isPicked = picked?.cycleDay === d.cycleDay && picked?.slot === s.key;
                      return (
                        <button
                          key={s.key}
                          onClick={() => handlePick(d.cycleDay, s.key)}
                          className="touch-btn flex-1 flex items-center justify-center gap-1 rounded-full bg-card px-2 py-1.5 min-h-[36px] font-body text-[11px] font-medium text-foreground transition-all"
                          style={isPicked ? { backgroundColor: phaseColor, color: "white" } : {}}
                        >
                          {isPicked ? <Check className="h-3 w-3" /> : null}
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
