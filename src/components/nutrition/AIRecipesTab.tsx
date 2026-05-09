import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Leaf, Search, Camera, ChefHat, Loader2, ShoppingCart, X, Clock, Users, Zap } from "lucide-react";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { ALL_MEAL_RECIPES } from "@/lib/recipe-index";
import { RecipeShoppingButton } from "@/components/ShoppingList";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

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

interface AIRecipesTabProps {
  phase: Phase;
  cycleDay: number;
}

export default function AIRecipesTab({ phase, cycleDay }: AIRecipesTabProps) {
  const { movementGoals: profileGoals } = useProfile();
  const [filter, setFilter] = useState<Phase | "all">(phase);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [aiRecipes, setAiRecipes] = useState<AIGeneratedRecipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [fromPhoto, setFromPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user dietary prefs from localStorage
  const getUserPrefs = () => {
    try {
      const raw = localStorage.getItem("mindcast-prep-prefs");
      if (raw) {
        const prefs = JSON.parse(raw);
        return {
          dietary: prefs.dietType || "",
          allergies: prefs.allergies || "",
          dislikes: prefs.dislikes || "",
          cookingSkill: prefs.cookingSkill || "confident",
          equipment: prefs.equipment || [],
          calorieTarget: prefs.calorieTarget || "",
          bodyGoal: prefs.bodyGoal || "",
        };
      }
    } catch {}
    // Also check body goals — prefer profile (Account), fallback to localStorage
    try {
      const fromProfile = profileGoals && profileGoals.length > 0 ? profileGoals : null;
      const goals = fromProfile ?? JSON.parse(localStorage.getItem("signal_body_goals") || "[]");
      return { dietary: "", allergies: "", dislikes: "", cookingSkill: "confident", equipment: [], calorieTarget: "", bodyGoal: goals[0] || "" };
    } catch {}
    return { dietary: "", allergies: "", dislikes: "", cookingSkill: "confident", equipment: [], calorieTarget: "", bodyGoal: "" };
  };

  const generateFromIngredients = async (ingredientText: string, imageBase64?: string) => {
    if (!ingredientText.trim() && !imageBase64) return;
    setGenerating(true);
    setAiRecipes([]);
    setExpandedRecipe(null);
    haptic("medium");

    try {
      const prefs = getUserPrefs();
      const { data, error } = await supabase.functions.invoke("fridge-recipe", {
        body: {
          ingredients: ingredientText.trim() || undefined,
          imageBase64: imageBase64 || undefined,
          phase,
          ...prefs,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAiRecipes(data.recipes || []);
      setIdentifiedIngredients(data.identifiedIngredients || ingredientText);
      setFromPhoto(!!data.fromPhoto);

      if (data.recipes?.length) {
        toast.success(`${data.recipes.length} recipes created!`);
        haptic("success");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate recipes. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("That photo is a little big — try a smaller one.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setIngredientSearch("Analysing your fridge photo...");
      await generateFromIngredients("", base64);
      setIngredientSearch("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Static recipe filtering (existing behaviour)
  const recipes = useMemo(() => {
    if (aiRecipes.length > 0) return [];
    let pool = ALL_MEAL_RECIPES.filter((r) =>
      filter === "all" ? true : r.phase === filter
    );
    if (ingredientSearch.trim()) {
      const terms = ingredientSearch.toLowerCase().split(",").map(t => t.trim()).filter(Boolean);
      pool = pool.filter(r =>
        terms.some(term =>
          r.ingredients.some(ing => ing.toLowerCase().includes(term)) ||
          r.name.toLowerCase().includes(term) ||
          r.keyNutrients.some(n => n.toLowerCase().includes(term))
        )
      );
    }
    return [...pool].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + cycleDay) % 100;
      const hb = (b.id.charCodeAt(0) + cycleDay) % 100;
      return ha - hb;
    });
  }, [filter, cycleDay, ingredientSearch, aiRecipes.length]);

  const clearAiResults = () => {
    setAiRecipes([]);
    setIdentifiedIngredients("");
    setFromPhoto(false);
    setExpandedRecipe(null);
    setIngredientSearch("");
  };

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
        Type what's in your fridge or <span className="font-semibold text-foreground">snap a photo</span> — we'll create {PHASE_SHORT[phase]}-phase recipes just for you.
      </p>

      {/* Ingredient input + photo button */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={ingredientSearch}
            onChange={e => { setIngredientSearch(e.target.value); if (aiRecipes.length) clearAiResults(); }}
            placeholder="chicken, spinach, rice, feta..."
            className="w-full rounded-xl bg-card pl-10 pr-24 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={e => { if (e.key === "Enter" && ingredientSearch.trim()) generateFromIngredients(ingredientSearch); }}
            disabled={generating}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={generating}
              className="touch-btn rounded-lg p-2 bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Snap your fridge"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              onClick={() => generateFromIngredients(ingredientSearch)}
              disabled={generating || !ingredientSearch.trim()}
              className="touch-btn rounded-lg p-2 bg-primary text-primary-foreground disabled:opacity-40 transition-colors"
              title="Generate recipes"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Photo CTA card */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={generating}
          className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center gap-3 text-left transition-all hover:bg-primary/10 active:scale-[0.99] disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-body text-sm font-medium text-foreground">Snap your fridge</p>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">Take a photo and we'll identify ingredients & create recipes that match your dietary preferences and cycle phase</p>
          </div>
        </button>
      </div>

      {/* Generating state */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card-warm p-6 text-center space-y-3"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="font-display text-sm italic text-foreground">
            {fromPhoto ? "Identifying ingredients from your photo..." : "Creating recipes from your ingredients..."}
          </p>
          <p className="font-body text-[11px] text-muted-foreground">Matching to your {PHASE_SHORT[phase]} phase & dietary preferences</p>
        </motion.div>
      )}

      {/* AI Generated Results */}
      <AnimatePresence>
        {aiRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base italic text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  {aiRecipes.length} recipes created
                </h3>
                {identifiedIngredients && (
                  <p className="font-body text-[11px] text-muted-foreground mt-1">
                    {fromPhoto ? "Spotted: " : "Using: "}
                    <span className="text-foreground">{identifiedIngredients.slice(0, 120)}{identifiedIngredients.length > 120 ? "..." : ""}</span>
                  </p>
                )}
              </div>
              <button onClick={clearAiResults} className="touch-btn p-2 rounded-lg bg-secondary text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* AI recipe cards */}
            {aiRecipes.map((recipe, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="card-warm overflow-hidden"
              >
                <button
                  onClick={() => { haptic("light"); setExpandedRecipe(expandedRecipe === i ? null : i); }}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm italic text-foreground leading-tight line-clamp-2">{recipe.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {recipe.prepTime}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> Serves {recipe.serves}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.keyNutrients?.slice(0, 3).map((n) => (
                          <span key={n} className="rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase bg-primary/10 text-primary">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded view */}
                <AnimatePresence>
                  {expandedRecipe === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                        {/* Nutritional note */}
                        <p className="font-body text-xs text-primary/80 italic bg-primary/5 rounded-lg p-2.5">
                          {recipe.nutritionalNote}
                        </p>

                        {/* Ingredients */}
                        <div>
                          <h5 className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ingredients</h5>
                          <ul className="space-y-1.5">
                            {recipe.ingredients.map((ing, j) => (
                              <li key={j} className="font-body text-xs text-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Method */}
                        <div>
                          <h5 className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Method</h5>
                          <ol className="space-y-2">
                            {recipe.method.map((step, j) => (
                              <li key={j} className="font-body text-xs text-foreground flex gap-2">
                                <span className="font-bold text-primary flex-shrink-0">{j + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* What we used vs added */}
                        {recipe.usedIngredients && (
                          <div className="flex flex-wrap gap-1">
                            {recipe.usedIngredients.map(ing => (
                              <span key={ing} className="rounded-full px-2 py-0.5 font-body text-[9px] bg-accent text-accent-foreground">{ing}</span>
                            ))}
                            {recipe.addedStaples?.map(ing => (
                              <span key={ing} className="rounded-full px-2 py-0.5 font-body text-[9px] bg-secondary text-muted-foreground">+ {ing}</span>
                            ))}
                          </div>
                        )}

                        {/* Add to shopping list */}
                        <RecipeShoppingButton
                          recipeId={`ai-fridge-${i}`}
                          recipeName={recipe.name}
                          ingredients={recipe.ingredients}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase filter pills — only when showing static recipes */}
      {aiRecipes.length === 0 && !generating && (
        <>
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

          {/* Static recipe cards */}
          <div className="space-y-3">
            {recipes.slice(0, 12).map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.25 }}
                className="card-warm p-4 flex gap-4"
              >
                <RecipeImage recipeName={recipe.name} recipeImage={recipe.image} variant="thumb" className="!h-20 !w-20 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm italic text-foreground leading-tight line-clamp-2 mb-1.5">
                    {recipe.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.keyNutrients.slice(0, 3).map((n) => (
                      <span
                        key={n}
                        className="rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase"
                        style={{ backgroundColor: `${PHASE_HEX[recipe.phase]}12`, color: PHASE_HEX[recipe.phase] }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 font-hand text-[10px] font-bold phase-${recipe.phase}-light`}>
                      {PHASE_SHORT[recipe.phase]}
                    </span>
                    <span className="font-body text-[9px] text-muted-foreground">{recipe.prepTime}</span>
                    <div className="ml-auto">
                      <RecipeShoppingButton recipeId={recipe.id} recipeName={recipe.name} ingredients={recipe.ingredients} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {recipes.length === 0 && (
            <div className="text-center py-8">
              <p className="font-body text-sm text-muted-foreground">
                {ingredientSearch.trim()
                  ? `No saved recipes match "${ingredientSearch}". Hit the chef hat button to generate AI recipes!`
                  : "No recipes for this filter."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
