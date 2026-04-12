import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera, Heart, ChefHat, Loader2, X, Clock, Users, Zap, Filter } from "lucide-react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { ALL_MEAL_RECIPES } from "@/lib/recipe-index";
import { BAKING_RECIPES } from "@/data/baking-recipes";
import { Recipe } from "@/data/meal-plans";
import { RecipeShoppingButton, IngredientSearchLinks } from "@/components/ShoppingList";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const MEAL_TYPE_FILTERS = ["All", "Lunch/Dinner", "Breakfast", "Baking", "Snacks", "TCM", "Ayurveda"] as const;
const TAG_FILTERS = ["High Protein", "Gut Health", "Anti-Inflammatory", "Vegan", "Iron-Rich", "Magnesium"] as const;

interface AIGeneratedRecipe {
  name: string;
  prepTime: string;
  serves: number;
  ingredients: string[];
  method: string[];
  keyNutrients: string[];
  nutritionalNote: string;
  usedIngredients?: string[];
  addedStaples?: string[];
}

export default function DiscoverTab() {
  const { currentPhase, currentCycleDay } = useCycle();
  const { toggleSave, isSaved } = useSavedRecipes();
  const { guard: guardExpand, canExpand } = useGatedExpand("nutrition_browse");
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<Phase | "all">("all");
  const [mealType, setMealType] = useState<string>("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFridge, setShowFridge] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [aiRecipes, setAiRecipes] = useState<AIGeneratedRecipe[]>([]);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Combine all recipes
  const allRecipes = useMemo(() => {
    const combined = [...ALL_MEAL_RECIPES, ...BAKING_RECIPES];
    // Deduplicate by id
    const seen = new Set<string>();
    return combined.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  }, []);

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

  // Fridge recipe generation
  const generateFromFridge = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;
    setGenerating(true);
    setAiRecipes([]);
    haptic("medium");
    try {
      const prefs = (() => {
        try { return JSON.parse(localStorage.getItem("mindcast-prep-prefs") || "{}"); } catch { return {}; }
      })();
      const { data, error } = await supabase.functions.invoke("fridge-recipe", {
        body: {
          ingredients: text.trim() || undefined,
          imageBase64: imageBase64 || undefined,
          phase: currentPhase,
          dietary: prefs.dietType || "",
          allergies: prefs.allergies || "",
        },
      });
      if (error) throw error;
      if (data?.recipes?.length) {
        setAiRecipes(data.recipes);
        toast.success(`${data.recipes.length} recipes created!`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate recipes");
    } finally {
      setGenerating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Photo too large"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await generateFromFridge("", base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Fridge CTA card */}
      <button
        onClick={() => setShowFridge(!showFridge)}
        className="w-full rounded-2xl border-2 border-dashed border-[#5B2D72]/30 p-5 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #1A0F2E 0%, #261540 100%)" }}
      >
        <div className="w-12 h-12 rounded-xl bg-[#5B2D72]/30 flex items-center justify-center flex-shrink-0 relative">
          <Camera className="h-5 w-5 text-[#5B2D72]" style={{ color: "#B794D0" }} />
          <Zap className="h-3 w-3 absolute -top-1 -right-1" style={{ color: "#B794D0" }} />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-bold italic" style={{ color: "#FAF7F4" }}>What's in your fridge?</p>
          <p className="font-body text-[11px] mt-1 leading-relaxed" style={{ color: "rgba(250,247,244,0.55)" }}>
            Type ingredients or snap a photo — <span style={{ color: PHASE_HEX[currentPhase] }}>we'll create {PHASE_SHORT[currentPhase]}-phase recipes</span>
          </p>
        </div>
      </button>

      {/* Fridge input */}
      <AnimatePresence>
        {showFridge && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                placeholder="chicken, spinach, rice, feta..."
                className="w-full rounded-xl bg-card pl-10 pr-24 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={e => { if (e.key === "Enter") generateFromFridge(ingredientInput); }}
                disabled={generating}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => fileInputRef.current?.click()} disabled={generating} className="touch-btn rounded-lg p-2 bg-secondary text-muted-foreground">
                  <Camera className="h-4 w-4" />
                </button>
                <button onClick={() => generateFromFridge(ingredientInput)} disabled={generating || !ingredientInput.trim()} className="touch-btn rounded-lg p-2 bg-primary text-primary-foreground disabled:opacity-40">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI generated results */}
      {aiRecipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base italic text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> {aiRecipes.length} recipes created
            </h3>
            <button onClick={() => setAiRecipes([])} className="touch-btn p-2 rounded-lg bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          {aiRecipes.map((recipe, i) => (
            <AIRecipeCard key={i} recipe={recipe} phaseColor={PHASE_HEX[currentPhase]} />
          ))}
        </div>
      )}

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
        {/* Phase pills */}
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
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.slice(0, 20).map((recipe, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={isSaved(recipe.id)}
            onToggleSave={() => toggleSave(recipe.id)}
            onSelect={() => setSelectedRecipe(recipe)}
            index={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="font-hand text-sm text-muted-foreground">No recipes found.</p>
        </div>
      )}

      {/* Recipe detail bottom sheet */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailSheet recipe={selectedRecipe} isSaved={isSaved(selectedRecipe.id)} onToggleSave={() => toggleSave(selectedRecipe.id)} onClose={() => setSelectedRecipe(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── AI Recipe Card with expandable details ── */
function AIRecipeCard({ recipe, phaseColor }: { recipe: AIGeneratedRecipe; phaseColor: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-warm overflow-hidden">
      <button onClick={() => { haptic("light"); setExpanded(!expanded); }} className="w-full text-left p-4 space-y-2">
        <h4 className="font-display text-sm italic text-foreground">{recipe.name}</h4>
        <div className="flex gap-2 font-body text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.prepTime}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />Serves {recipe.serves}</span>
        </div>
        <div className="flex flex-wrap gap-1">{recipe.keyNutrients?.slice(0, 3).map(n => (
          <span key={n} className="rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase bg-primary/10 text-primary">{n}</span>
        ))}</div>
        <p className="font-body text-[10px] text-primary font-medium">{expanded ? "Hide details ▲" : "View recipe ▼"}</p>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {recipe.ingredients?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-foreground mb-1" style={{ color: phaseColor }}>Ingredients</p>
                  <ul className="space-y-0.5">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="font-body text-xs text-muted-foreground">• {ing}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recipe.method?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-foreground mb-1" style={{ color: phaseColor }}>Method</p>
                  <ol className="space-y-1">
                    {recipe.method.map((step, idx) => (
                      <li key={idx} className="font-body text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{idx + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {recipe.nutritionalNote && (
                <p className="font-body text-xs italic text-muted-foreground">{recipe.nutritionalNote}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
        </div>
      </motion.div>
    </>
  );
}
