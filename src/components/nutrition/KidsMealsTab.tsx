import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KIDS_RECIPE_BANK, type KidsRecipe, type KidsMealType } from "@/data/kids-recipes";
import { haptic } from "@/hooks/use-mobile";

type DietFilter = "vegan" | "vegetarian" | "dairy-free" | "gluten-free" | "nut-free" | "egg-free";
type ProteinFilter = "chicken" | "beef" | "fish" | "tofu" | "beans" | "eggs" | "cheese" | "pork" | "shrimp" | "lentils" | "none";
type MealFilter = "breakfast" | "lunch" | "dinner";
type PrepFilter = "under-15" | "15-30" | "over-30";

const DIET_OPTIONS: DietFilter[] = ["vegan", "vegetarian", "dairy-free", "gluten-free", "nut-free", "egg-free"];
const PROTEIN_OPTIONS: { value: ProteinFilter; label: string }[] = [
  { value: "chicken", label: "Chicken" },
  { value: "beef", label: "Beef" },
  { value: "fish", label: "Fish" },
  { value: "pork", label: "Pork" },
  { value: "shrimp", label: "Shrimp" },
  { value: "tofu", label: "Tofu" },
  { value: "beans", label: "Beans" },
  { value: "lentils", label: "Lentils" },
  { value: "eggs", label: "Eggs" },
  { value: "cheese", label: "Cheese" },
  { value: "none", label: "Plant-based" },
];
const MEAL_OPTIONS: { value: MealFilter; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];
const PREP_OPTIONS: { value: PrepFilter; label: string }[] = [
  { value: "under-15", label: "Under 15 min" },
  { value: "15-30", label: "15–30 min" },
  { value: "over-30", label: "30+ min" },
];

function parsePrepMinutes(prep: string): number {
  const m = prep.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 30;
}

export default function KidsMealsTab() {
  const [search, setSearch] = useState("");
  const [diet, setDiet] = useState<DietFilter | null>(null);
  const [protein, setProtein] = useState<ProteinFilter | null>(null);
  const [mealType, setMealType] = useState<MealFilter | null>(null);
  const [prep, setPrep] = useState<PrepFilter | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return KIDS_RECIPE_BANK.filter(r => {
      if (q && !r.name.toLowerCase().includes(q) && !r.ingredients.some(i => i.toLowerCase().includes(q))) {
        return false;
      }
      if (diet && !r.tags.includes(diet)) return false;
      if (protein && r.protein !== protein) return false;
      if (mealType && !r.mealType.includes(mealType as KidsMealType)) return false;
      if (prep) {
        const mins = parsePrepMinutes(r.prepTime);
        if (prep === "under-15" && mins >= 15) return false;
        if (prep === "15-30" && (mins < 15 || mins > 30)) return false;
        if (prep === "over-30" && mins <= 30) return false;
      }
      return true;
    });
  }, [search, diet, protein, mealType, prep]);

  const activeCount = [diet, protein, mealType, prep].filter(Boolean).length;

  const clearAll = () => {
    haptic("light");
    setSearch("");
    setDiet(null);
    setProtein(null);
    setMealType(null);
    setPrep(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">Kids Meals Library</h2>
        <p className="font-body text-sm text-muted-foreground mt-1 italic" style={{ fontWeight: 300 }}>
          Browse {KIDS_RECIPE_BANK.length} kid-friendly recipes — filter by diet, protein and prep time.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ingredient…"
          className="w-full rounded-full bg-card pl-9 pr-9 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Meal type filter */}
      <FilterRow label="Meal" value={mealType} onChange={(v) => setMealType(v as MealFilter | null)} options={MEAL_OPTIONS} />

      {/* Protein filter */}
      <FilterRow label="Protein" value={protein} onChange={(v) => setProtein(v as ProteinFilter | null)} options={PROTEIN_OPTIONS} />

      {/* Diet filter */}
      <div className="space-y-1.5">
        <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Dietary</p>
        <div className="flex flex-wrap gap-1.5">
          {DIET_OPTIONS.map(d => {
            const active = diet === d;
            return (
              <button
                key={d}
                onClick={() => { haptic("light"); setDiet(active ? null : d); }}
                className={`touch-btn rounded-full px-3 py-1.5 min-h-[36px] font-body text-[11px] font-medium transition-all ${
                  active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prep time filter */}
      <FilterRow label="Prep time" value={prep} onChange={(v) => setPrep(v as PrepFilter | null)} options={PREP_OPTIONS} />

      {/* Active filters summary */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
          {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? "filter" : "filters"} active`}
        </p>
        {(activeCount > 0 || search) && (
          <button
            onClick={clearAll}
            className="touch-btn font-body text-xs text-primary underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-card p-8 text-center border border-border">
          <p className="font-body text-sm text-muted-foreground">No recipes match these filters.</p>
          <button
            onClick={clearAll}
            className="touch-btn mt-3 font-body text-xs text-primary underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(recipe => (
            <KidsRecipeCard
              key={recipe.id}
              recipe={recipe}
              expanded={expandedId === recipe.id}
              onToggle={() => {
                haptic("light");
                setExpandedId(expandedId === recipe.id ? null : recipe.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
}

function FilterRow({ label, value, onChange, options }: FilterRowProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="scroll-snap-x flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { haptic("light"); onChange(active ? null : opt.value); }}
              className={`touch-btn flex-shrink-0 rounded-full px-3 py-1.5 min-h-[36px] font-body text-[11px] font-medium transition-all ${
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CardProps {
  recipe: KidsRecipe;
  expanded: boolean;
  onToggle: () => void;
}

function KidsRecipeCard({ recipe, expanded, onToggle }: CardProps) {
  const dietaryTags = recipe.tags.filter(
    t => t.endsWith("-free") || t === "vegetarian" || t === "vegan" || t === "keto",
  );

  return (
    <div className="rounded-xl bg-card shadow-soft overflow-hidden">
      <button
        onClick={onToggle}
        className="touch-card w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-bold italic text-foreground">{recipe.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="font-body text-xs text-muted-foreground capitalize">{recipe.protein === "none" ? "plant-based" : recipe.protein}</span>
            <span className="font-body text-xs text-muted-foreground">·</span>
            <span className="font-body text-xs text-muted-foreground">{recipe.prepTime}</span>
            <span className="font-body text-xs text-muted-foreground">·</span>
            <span className="font-body text-xs text-muted-foreground">serves {recipe.serves}</span>
          </div>
          {dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dietaryTags.map(t => (
                <span key={t} className="font-body text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        }
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
              <div>
                <p className="font-body text-xs font-semibold text-foreground mb-1">Ingredients</p>
                <ul className="space-y-0.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="font-body text-xs text-muted-foreground">• {ing}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-body text-xs font-semibold text-foreground mb-1">Method</p>
                <ol className="space-y-1 list-none">
                  {recipe.method.map((step, i) => (
                    <li key={i} className="font-body text-xs text-muted-foreground flex gap-2">
                      <span className="font-semibold text-foreground flex-shrink-0">{i + 1}.</span>
                      <span>{step.replace(/^\d+[\.\)]\s*/, "")}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
