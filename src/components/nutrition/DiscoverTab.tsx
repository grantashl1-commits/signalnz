import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ChevronDown, X, Baby, Filter as FilterIcon, CalendarPlus, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { Recipe } from "@/data/meal-plans";
import { CATALOG, CATALOG_TAGS, CATALOG_COUNTS } from "@/lib/all-recipes";
import { FILTER_GROUPS, type RecipeTag } from "@/lib/recipe-tags";
import { RecipeShoppingButton } from "@/components/ShoppingList";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { useCycle } from "@/contexts/CycleContext";
import { useGatedExpand } from "@/hooks/useGatedExpand";
import { toLocalDateStr } from "@/lib/local-date";
import { addRecipeToMyWeek } from "@/lib/add-to-my-week";
import { adultFacets } from "@/lib/recipe-catalog";
import type { RecipeFacets } from "@/lib/recipe-facets";
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

/**
 * Kids-bank and cookbook recipes carry no cycle phase, so they are `"any"`.
 * Indexing the phase tables with that yields `undefined`, so every phase lookup
 * goes through these three helpers instead of touching the records directly.
 */
const FALLBACK_HEX = "#9B89B4";
const phaseHex = (p: string): string => PHASE_HEX[p as Phase] ?? FALLBACK_HEX;
const phaseTint = (p: string): string => PHASE_TINT[p as Phase] ?? "rgba(155, 137, 180, 0.05)";
const phaseLabel = (p: string): string => PHASE_SHORT[p as Phase] ?? "Any phase";

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

export default function DiscoverTab() {
  const { currentPhase } = useCycle();
  const lists = useSavedRecipes();
  const { guard: guardExpand } = useGatedExpand("nutrition_browse");

  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  /** Meal is single-select — a dish is one slot. Every other group stacks. */
  const [meal, setMeal] = useState<string>("all");
  const [tags, setTags] = useState<Set<RecipeTag>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const activeFilterCount =
    (phaseFilter !== "all" ? 1 : 0) + (meal !== "all" ? 1 : 0) + tags.size;

  const toggleTag = (tag: RecipeTag) => {
    haptic("light");
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearAllFilters = () => {
    setPhaseFilter("all");
    setMeal("all");
    setTags(new Set());
  };

  /** The filters busy people reach for, one tap from the top. */
  const QUICK_CHIPS: { id: RecipeTag; label: string }[] = [
    { id: "vegan", label: "Vegan" },
    { id: "kid-friendly", label: "Kid-friendly" },
    { id: "lunchbox", label: "Lunchbox" },
    { id: "gluten-free", label: "Gluten-free" },
    { id: "quick", label: "Under 20 min" },
    { id: "freezer-friendly", label: "Freezes well" },
    { id: "high-protein", label: "High protein" },
  ];

  /** Curated starting points — each is just a preset of the filters below. */
  const COLLECTIONS: { id: string; title: string; sub: string; image: string; presets: RecipeTag[] }[] = [
    { id: "plant", title: "Plant-based", sub: "Every vegan recipe", image: "/images/recipes/meals/colourful-lentil-salad-bowl.png", presets: ["vegan"] },
    { id: "lunch", title: "School lunches", sub: "Batch on Sunday, pack all week", image: "/images/recipes/meals/hummus-roasted-veg-wrap.png", presets: ["lunchbox"] },
    { id: "kids", title: "Little ones", sub: "Kid-approved favourites", image: "/images/recipes/meals/banana-cinnamon-pancakes.png", presets: ["kid-friendly"] },
    { id: "quick", title: "Under 20 min", sub: "For the busy nights", image: "/images/recipes/meals/ginger-tofu-stir-fry.png", presets: ["quick"] },
    { id: "freezer", title: "Make-ahead", sub: "Freezer & fridge friendly", image: "/images/recipes/meals/date-cacao-coconut-bliss-balls.png", presets: ["freezer-friendly"] },
    { id: "protein", title: "Protein first", sub: "Keep energy steady", image: "/images/recipes/meals/chickpea-spinach-curry.png", presets: ["high-protein"] },
  ];

  const isCollectionActive = (c: { presets: RecipeTag[] }) =>
    meal === "all" && phaseFilter === "all" &&
    tags.size === c.presets.length && c.presets.every((p) => tags.has(p));

  const applyCollection = (c: { presets: RecipeTag[] }) => {
    haptic("light");
    if (isCollectionActive(c)) {
      clearAllFilters();
      return;
    }
    setPhaseFilter("all");
    setMeal("all");
    setTags(new Set(c.presets));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const wanted = [...tags];

    const matched = CATALOG.filter((entry) => {
      const r = entry.recipe;
      // A phase-agnostic recipe ("any") suits every phase, so it must survive a
      // phase filter rather than disappearing from it.
      if (phaseFilter !== "all" && r.phase !== phaseFilter && r.phase !== "any") return false;

      const recipeTags = CATALOG_TAGS.get(r.id) ?? [];
      if (meal !== "all" && !recipeTags.includes(meal as RecipeTag)) return false;
      for (const want of wanted) if (!recipeTags.includes(want)) return false;

      if (q) {
        return (
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          (r.keyNutrients ?? []).some((n) => n.toLowerCase().includes(q))
        );
      }
      return true;
    }).map((entry) => entry.recipe);

    // With no phase filter the list is simply alphabetical. With one, today's
    // phase leads (so the member's own cycle is front and centre) and the rest
    // follow in cycle order.
    if (phaseFilter === "all") {
      return matched.sort((a, b) => a.name.localeCompare(b.name));
    }
    const phaseOrder: Phase[] = ["menstrual", "follicular", "ovulatory", "luteal"];
    const rotated = [currentPhase, ...phaseOrder.filter((p) => p !== currentPhase)];
    const phaseRank = new Map<string, number>(rotated.map((p, i) => [p, i]));
    return matched.sort((a, b) => {
      const pa = phaseRank.get(a.phase) ?? 99;
      const pb = phaseRank.get(b.phase) ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
  }, [phaseFilter, meal, tags, search, currentPhase]);

  // Pagination — "Load more" reveals another batch.
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [phaseFilter, meal, tags, search]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search all ${CATALOG_COUNTS.total} recipes or ingredients...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }}
        />
      </div>

      {/* Collections — curated starting points */}
      <div className="-mx-5 px-5 md:mx-0 md:px-0">
        <div className="scroll-snap-x flex gap-3 pb-1">
          {COLLECTIONS.map((c) => {
            const active = isCollectionActive(c);
            return (
              <button
                key={c.id}
                onClick={() => applyCollection(c)}
                aria-pressed={active}
                className={`scroll-snap-item group relative w-[150px] flex-none overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-300 ${
                  active
                    ? "border-foreground bg-foreground text-background shadow-medium"
                    : "border-border/70 bg-card text-foreground shadow-soft hover:-translate-y-0.5"
                }`}
              >
                <img src={c.image} alt="" loading="lazy" className="mb-2 h-16 w-16 object-contain drop-shadow-sm" />
                <p className="display-serif text-[1.35rem] leading-none">{c.title}</p>
                <p className={`mt-1.5 text-[11px] leading-snug ${active ? "text-background/70" : "text-muted-foreground"}`}>
                  {c.sub}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick chips — the filters busy people actually use */}
      <div className="scroll-snap-x flex gap-1.5 -mx-1 px-1">
        {QUICK_CHIPS.map((chip) => {
          const on = tags.has(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleTag(chip.id)}
              aria-pressed={on}
              className={`scroll-snap-item flex-none rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground/75 hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            haptic("light");
            setFiltersOpen((o) => !o);
          }}
          className="touch-btn w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 min-h-[44px] font-body text-sm text-foreground transition-all"
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <span>More filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-body text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
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
                <FilterSection title="Cycle phase" hint="Every recipe is still shown">
                  <FilterPill active={phaseFilter === "all"} onClick={() => setPhaseFilter("all")}>
                    All phases
                  </FilterPill>
                  {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        haptic("light");
                        setPhaseFilter(p);
                      }}
                      className="touch-btn rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap"
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

                {/* The full taxonomy */}
                {FILTER_GROUPS.map((group) => {
                  const single = group.id === "meal";
                  return (
                    <FilterSection
                      key={group.id}
                      title={group.label}
                      hint={single ? undefined : "Tap to add — multiple stack"}
                    >
                      {group.options.map((option) => {
                        if (single) {
                          return (
                            <FilterPill
                              key={option.id}
                              active={meal === option.id}
                              onClick={() => setMeal(option.id)}
                            >
                              {option.label}
                            </FilterPill>
                          );
                        }
                        const tag = option.id as RecipeTag;
                        return (
                          <FilterPill
                            key={option.id}
                            active={tags.has(tag)}
                            onClick={() => toggleTag(tag)}
                          >
                            {option.label}
                          </FilterPill>
                        );
                      })}
                    </FilterSection>
                  );
                })}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      haptic("light");
                      clearAllFilters();
                    }}
                    disabled={activeFilterCount === 0}
                    className="font-body text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => {
                      haptic("light");
                      setFiltersOpen(false);
                    }}
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
      <p className="font-body text-[11px] text-muted-foreground">
        {filtered.length} of {CATALOG_COUNTS.total} recipes
      </p>

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.slice(0, visibleCount).map((recipe, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={lists.has("saved", recipe.id)}
            onToggleSave={() => lists.toggleSaved(recipe.id)}
            onSelect={() => {
              if (guardExpand()) setSelectedRecipe(recipe);
            }}
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
            onClick={() => {
              haptic("light");
              setVisibleCount((c) => c + PAGE_SIZE);
            }}
            className="touch-btn rounded-full bg-primary text-primary-foreground px-5 py-2 font-body text-xs font-bold"
          >
            Load more
          </button>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="font-hand text-sm text-muted-foreground">No recipes match those filters.</p>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                haptic("light");
                clearAllFilters();
              }}
              className="mt-2 font-body text-xs text-primary underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Recipe detail bottom sheet */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailSheet
            recipe={selectedRecipe}
            isSaved={lists.has("saved", selectedRecipe.id)}
            onToggleSave={() => lists.toggleSaved(selectedRecipe.id)}
            isFavourite={lists.has("favourite", selectedRecipe.id)}
            onToggleFavourite={() => lists.toggleFavourite(selectedRecipe.id)}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Facet badges — what a busy parent scans for ── */
function FacetBadges({ facets, max = 3 }: { facets: RecipeFacets; max?: number }) {
  const badges: { label: string; tone: string }[] = [];
  if (facets.vegan) badges.push({ label: "Vegan", tone: "hsl(var(--eat))" });
  if (facets.schoolLunch) badges.push({ label: "Lunchbox", tone: "hsl(var(--goals))" });
  else if (facets.freezer) badges.push({ label: "Freezes", tone: "hsl(var(--reflect))" });
  if (!facets.nutFree) badges.push({ label: "Contains nuts", tone: "hsl(var(--muted-foreground))" });
  if (badges.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {badges.slice(0, max).map(b => (
        <span key={b.label} className="rounded-full border px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider"
          style={{ color: b.tone, borderColor: `color-mix(in srgb, ${b.tone} 35%, transparent)` }}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function RecipeCard({ recipe, isSaved, onToggleSave, onSelect, index = 0, favourite = false }: {
  recipe: Recipe; isSaved: boolean; onToggleSave: () => void; onSelect: () => void; index?: number;
  /** In Favourites the corner button is the heart that takes it off that list. */
  favourite?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index, duration: 0.25 }}>
      <div className="relative">
        <button onClick={onSelect} className="touch-card w-full text-left card-warm overflow-hidden"
          style={{ background: `linear-gradient(to bottom, ${phaseTint(recipe.phase)} 40%, transparent 60%)` }}>
          <RecipeImage recipeName={recipe.name} recipeId={recipe.id} recipeImage={recipe.image} height={75} variant="card" />
          <div className="px-3 pb-3 pt-1.5">
            <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">{recipe.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="rounded-full px-2 py-0.5 font-hand text-[10px] font-bold"
                style={{ backgroundColor: `${phaseHex(recipe.phase)}15`, color: phaseHex(recipe.phase) }}>
                {phaseLabel(recipe.phase)}
              </span>
              <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
            </div>
            <FacetBadges facets={adultFacets(recipe)} max={2} />
          </div>
        </button>
        {/* + keeps it in Saved; a tick once it's there */}
        <button
          onClick={(e) => { e.stopPropagation(); haptic("light"); onToggleSave(); }}
          aria-label={favourite ? `Remove ${recipe.name} from Favourites` : isSaved ? `Remove ${recipe.name} from Saved` : `Save ${recipe.name}`}
          aria-pressed={favourite || isSaved}
          className="absolute top-2 right-2 touch-btn p-1.5 rounded-full bg-card/80 backdrop-blur-sm"
        >
          {favourite
            ? <Heart className="h-4 w-4" style={{ color: phaseHex(recipe.phase), fill: phaseHex(recipe.phase) }} />
            : isSaved
              ? <Check className="h-4 w-4" style={{ color: phaseHex(recipe.phase) }} />
              : <Plus className="h-4 w-4 text-muted-foreground" />}
        </button>
      </div>
    </motion.div>
  );
}

export function RecipeDetailSheet({ recipe, isSaved, onToggleSave, isFavourite, onToggleFavourite, onClose }: {
  recipe: Recipe; isSaved: boolean; onToggleSave: () => void;
  isFavourite: boolean; onToggleFavourite: () => void; onClose: () => void;
}) {
  const { currentCycleDay, getCycleDayForDate } = useCycle();
  const [servings, setServings] = useState(recipe.serves);
  const [showAddToWeek, setShowAddToWeek] = useState(false);
  const scale = servings / recipe.serves;
  const phaseColor = phaseHex(recipe.phase);

  const scaleIngredient = (ing: string): string => {
    if (scale === 1) return ing;
    const match = ing.match(/^([\d.½⅓⅔¼¾]+)/);
    if (match) {
      const num = parseFloat(match[1]) * scale;
      return ing.replace(match[1], num % 1 === 0 ? String(num) : num.toFixed(1));
    }
    return ing;
  };

  // On <body>, so the sheet and its buttons sit above the app's top bar, not under it.
  return createPortal(
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
          <button
            onClick={() => { haptic("light"); onToggleSave(); }}
            aria-label={isSaved ? "Remove from Saved" : "Save"}
            aria-pressed={isSaved}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            {isSaved ? <Check className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
          </button>
          {/* Heart: cooked it, loved it. Keeps it in Favourites. */}
          <button
            onClick={() => { haptic("light"); onToggleFavourite(); }}
            aria-label={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
            aria-pressed={isFavourite}
            className="touch-btn p-2 rounded-full bg-secondary"
          >
            <Heart className={`h-4 w-4 ${isFavourite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
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
                style={{ backgroundColor: `${phaseHex(recipe.phase)}15`, color: phaseHex(recipe.phase) }}>{phaseLabel(recipe.phase)}</span>
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
    </>,
    document.body,
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

  const handlePick = (cycleDay: number, slot: MealSlot, date: Date) => {
    haptic("medium");
    const result = addRecipeToMyWeek(recipe, cycleDay, slot, toLocalDateStr(date));
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
                          onClick={() => handlePick(d.cycleDay, s.key, d.date)}
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
