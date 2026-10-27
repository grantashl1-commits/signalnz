/**
 * Plant-Based Family Cookbook tab.
 *
 * A self-contained collection surface for the 61 NZ-adapted plant-based family
 * recipes. These recipes are category-based (breakfast/lunch/dinner/snack/
 * baking/dessert) rather than cycle-phase based, so they live in their own data
 * module and do not touch ALL_RECIPES / phase-based components.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, ChefHat, Heart } from "lucide-react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { haptic } from "@/hooks/use-mobile";
import {
  PLANT_BASED_FAMILY_RECIPES,
  type FamilyRecipe,
  type FamilyRecipeCategory,
} from "@/data/plant-based-family-recipes";
import { MATTHEW_KIDS_RECIPES } from "@/data/matthew-kids-recipes";
import { NZ_AU_FAMILY_RECIPES } from "@/data/nz-au-family-recipes";
import { MAIN_LIBRARY_RECIPES, KIDS_BANK_RECIPES } from "@/lib/family-recipe-adapters";

/** All cookbook collections surfaced in this tab — one complete catalog. */
const COLLECTIONS = [
  { id: "family", label: "Family Cookbook", recipes: PLANT_BASED_FAMILY_RECIPES },
  { id: "kids", label: "Kids' Favourites", recipes: MATTHEW_KIDS_RECIPES },
  { id: "nzau", label: "NZ & AU Family", recipes: NZ_AU_FAMILY_RECIPES },
  { id: "library", label: "Main Library", recipes: MAIN_LIBRARY_RECIPES },
  { id: "kidsbank", label: "Kids Bank", recipes: KIDS_BANK_RECIPES },
] as const;

const CATEGORIES: ("All" | FamilyRecipeCategory)[] = [
  "All", "breakfast", "lunch", "dinner", "snack", "baking", "dessert",
];

const labelFor = (c: "All" | FamilyRecipeCategory) =>
  c === "All" ? "All" : c.charAt(0).toUpperCase() + c.slice(1);

const CATEGORY_COLOR: Record<FamilyRecipeCategory, string> = {
  breakfast: "hsl(var(--eat))",
  lunch: "hsl(var(--move))",
  dinner: "hsl(var(--primary))",
  snack: "hsl(var(--reflect))",
  baking: "hsl(var(--goals))",
  dessert: "hsl(var(--goals))",
};

function CategoryChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => { haptic("light"); onClick(); }}
      className={`touch-btn flex-shrink-0 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all whitespace-nowrap ${
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function RecipeCard({ recipe, onOpen, index }: { recipe: FamilyRecipe; onOpen: () => void; index: number }) {
  const color = CATEGORY_COLOR[recipe.category] ?? "hsl(var(--primary))";
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.25 }}
      onClick={() => { haptic("light"); onOpen(); }}
      className="text-left card-warm overflow-hidden flex flex-col"
    >
      <div className="w-full bg-secondary/20 flex items-center justify-center" style={{ height: 110 }}>
        <RecipeImage
          recipeName={recipe.name}
          recipeId={recipe.id}
          recipeImage={recipe.image}
          height={130}
          variant="detail"
        />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <span
          className="self-start rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wide mb-1.5"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {recipe.category}
        </span>
        <p className="font-display text-[13px] leading-snug text-foreground flex-1">{recipe.name}</p>
        <div className="flex items-center gap-3 mt-2 text-muted-foreground">
          <span className="flex items-center gap-1 font-body text-[10px]">
            <Users className="h-3 w-3" /> {recipe.serves}
          </span>
          <span className="flex items-center gap-1 font-body text-[10px]">
            <Clock className="h-3 w-3" /> {recipe.prepMinutes + recipe.cookMinutes} min
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function RecipeDetail({ recipe, onClose }: { recipe: FamilyRecipe; onClose: () => void }) {
  const color = CATEGORY_COLOR[recipe.category] ?? "hsl(var(--primary))";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-border/60">
        <span
          className="rounded-full px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {recipe.category}
        </span>
        <button
          onClick={() => { haptic("light"); onClose(); }}
          aria-label="Close"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full flex items-center justify-center bg-secondary/20" style={{ height: 220 }}>
          <RecipeImage
            recipeName={recipe.name}
            recipeId={recipe.id}
            recipeImage={recipe.image}
            height={260}
            variant="detail"
          />
        </div>

        <div className="px-5 py-5 max-w-2xl mx-auto space-y-5">
          <div>
            <h2 className="font-display text-2xl italic text-foreground leading-tight">{recipe.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1.5 font-body text-xs"><Users className="h-3.5 w-3.5" /> Serves {recipe.serves}</span>
              <span className="flex items-center gap-1.5 font-body text-xs"><Clock className="h-3.5 w-3.5" /> {recipe.prepMinutes} + {recipe.cookMinutes} min</span>
            </div>
          </div>

          <div>
            <h3 className="font-body text-xs uppercase tracking-[0.15em] font-semibold mb-2" style={{ color }}>Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-foreground/90">
                  <span className="flex-shrink-0 mt-1.5 h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs uppercase tracking-[0.15em] font-semibold mb-2" style={{ color }}>Method</h3>
            <ol className="space-y-3">
              {recipe.method.map((step, i) => (
                <li key={i} className="flex gap-3 font-body text-sm text-foreground/90 leading-relaxed">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full font-body text-[10px] font-bold" style={{ backgroundColor: `${color}18`, color }}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.kidAlternative && (
            <div className="rounded-2xl p-4 border border-border/60" style={{ backgroundColor: `${color}08` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-3.5 w-3.5" style={{ color }} />
                <p className="font-body text-xs font-semibold" style={{ color }}>My kid won't eat that?</p>
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{recipe.kidAlternative}</p>
            </div>
          )}

          <p className="font-body text-[10px] text-muted-foreground/60 pt-2">
            Editorial draft — not kitchen-tested. Nutrition figures not yet verified.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FamilyRecipesTab() {
  const [collectionId, setCollectionId] = useState<string>(COLLECTIONS[0].id);
  const [category, setCategory] = useState<"All" | FamilyRecipeCategory>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const collection = COLLECTIONS.find((c) => c.id === collectionId) ?? COLLECTIONS[0];

  const filtered = useMemo(
    () => (category === "All"
      ? collection.recipes
      : collection.recipes.filter((r) => r.category === category)),
    [collection, category]
  );

  const openRecipe = openId
    ? collection.recipes.find((r) => r.id === openId) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Cookbook collection switcher */}
      <div className="scroll-snap-x flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => { haptic("light"); setCollectionId(c.id); setCategory("All"); }}
            className={`touch-btn flex-shrink-0 rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-all whitespace-nowrap border ${
              collectionId === c.id
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border/60"
            }`}
          >
            {c.label} · {c.recipes.length}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <ChefHat className="h-4 w-4 text-primary/60" />
        <p className="font-hand text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--label-color))" }}>
          {collection.label} · {collection.recipes.length} recipes
        </p>
      </div>

      <div className="scroll-snap-x flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {labelFor(c)}
          </CategoryChip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((recipe, i) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={i} onOpen={() => setOpenId(recipe.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-body text-sm text-muted-foreground py-8">
          No recipes in this category yet.
        </p>
      )}

      <AnimatePresence>
        {openRecipe && <RecipeDetail recipe={openRecipe} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </div>
  );
}
