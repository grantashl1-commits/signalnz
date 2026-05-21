import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link, X, Clock, Users, Star, Trash2, Edit2, ChefHat, Loader2, ExternalLink, BookOpen } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { useMyRecipes, UserRecipe, UserRecipeInput } from "@/hooks/useMyRecipes";
import RecipeImage from "@/components/nutrition/RecipeImage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Baking", "Other"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLOR: Record<Category, string> = {
  Breakfast: "#E2A84B",
  Lunch: "#6BAE75",
  Dinner: "#5C4A9E",
  Snack: "#C4526E",
  Baking: "#C47A8A",
  Other: "#9B89B4",
};

/* ── Empty state ── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-base italic text-foreground">A blank recipe book, waiting</p>
        <p className="font-body text-xs text-muted-foreground">Save the meals you return to — or pull one in from anywhere on the web.</p>
      </div>
      <button
        onClick={() => { haptic("medium"); onAdd(); }}
        className="touch-btn flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-3 font-body text-sm font-medium"
      >
        <Plus className="h-4 w-4" /> Save your first recipe
      </button>
    </div>
  );
}

/* ── Recipe card ── */
function RecipeCard({ recipe, onSelect, index = 0 }: {
  recipe: UserRecipe; onSelect: () => void; index?: number;
}) {
  const color = CATEGORY_COLOR[(recipe.category as Category)] || "#9B89B4";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index, duration: 0.25 }}>
      <button onClick={() => { haptic("light"); onSelect(); }} className="touch-card w-full text-left card-warm overflow-hidden">
        <div className="w-full overflow-hidden">
          <RecipeImage
            recipeName={recipe.title}
            recipeId={recipe.id}
            recipeImage={recipe.image_url || undefined}
            variant="card"
            height={100}
          />
        </div>
        <div className="px-3 pb-3 pt-2 space-y-1.5">
          <h3 className="font-display text-[13px] italic text-foreground leading-tight line-clamp-2">{recipe.title}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full px-2 py-0.5 font-hand text-[10px] font-bold capitalize"
              style={{ backgroundColor: `${color}18`, color }}>
              {recipe.category}
            </span>
            {recipe.estimated_time && (
              <span className="font-body text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />{recipe.estimated_time}m
              </span>
            )}
          </div>
          {recipe.rating && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-2.5 w-2.5 ${i < recipe.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}

/* ── Star rating input ── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => { haptic("light"); onChange(i + 1); }}
          className="touch-btn p-0.5"
        >
          <Star className={`h-5 w-5 transition-colors ${(hover || value) > i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

/* ── Add / Edit modal ── */
type AddMode = "form" | "url";

const BLANK_FORM: UserRecipeInput = {
  title: "", category: "Other", ingredients: [], instructions: [],
  estimated_time: null, rating: null, image_url: null, source_url: null,
};

function recipeToForm(r: UserRecipe): UserRecipeInput & { ingredientsText: string; instructionsText: string } {
  return {
    ...r,
    ingredientsText: r.ingredients.join("\n"),
    instructionsText: r.instructions.join("\n"),
  };
}

interface AddModalProps {
  editing: UserRecipe | null;
  onClose: () => void;
  onSave: (input: UserRecipeInput) => Promise<void>;
}

function AddModal({ editing, onClose, onSave }: AddModalProps) {
  const [mode, setMode] = useState<AddMode>(editing ? "form" : "url");
  const [urlInput, setUrlInput] = useState(editing?.source_url || "");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialForm = editing ? recipeToForm(editing) : { ...BLANK_FORM, ingredientsText: "", instructionsText: "" };
  const [title, setTitle] = useState(initialForm.title);
  const [category, setCategory] = useState<Category>((initialForm.category as Category) || "Other");
  const [estimatedTime, setEstimatedTime] = useState(initialForm.estimated_time ? String(initialForm.estimated_time) : "");
  const [rating, setRating] = useState(initialForm.rating || 0);
  const [imageUrl, setImageUrl] = useState(initialForm.image_url || "");
  const [sourceUrl, setSourceUrl] = useState(initialForm.source_url || "");
  const [ingredientsText, setIngredientsText] = useState(initialForm.ingredientsText || "");
  const [instructionsText, setInstructionsText] = useState(initialForm.instructionsText || "");

  const fillForm = (r: Partial<UserRecipeInput>) => {
    if (r.title) setTitle(r.title);
    if (r.category) setCategory((r.category as Category) || "Other");
    if (r.estimated_time) setEstimatedTime(String(r.estimated_time));
    if (r.image_url) setImageUrl(r.image_url);
    if (r.source_url) setSourceUrl(r.source_url);
    if (r.ingredients) setIngredientsText(r.ingredients.join("\n"));
    if (r.instructions) setInstructionsText(r.instructions.join("\n"));
  };

  const extractImportError = async (response?: Response | null, data?: unknown, error?: unknown) => {
    const dataError = data && typeof data === "object" && "error" in data ? (data as { error?: string }).error : null;
    if (dataError) return dataError;

    if (response) {
      try {
        const payload = await response.clone().json();
        if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
          return payload.error;
        }
      } catch {
        try {
          const text = await response.clone().text();
          if (text) return text;
        } catch {
          // no-op
        }
      }
    }

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      return error.message;
    }

    return null;
  };

  const handleImport = async () => {
    if (!urlInput.trim()) return;
    setImporting(true);
    haptic("medium");
    try {
      const { data, error, response } = await supabase.functions.invoke("recipe-from-url", {
        body: { url: urlInput.trim() },
      });
      const friendlyError = await extractImportError(response, data, error);

      if (friendlyError) {
        toast.error(friendlyError === "No recipe found on this page"
          ? "No recipe found on that page — try a direct link to a single recipe."
          : friendlyError);
        return;
      }
      if (error) throw error;
      if (data?.recipe) {
        fillForm(data.recipe);
        setMode("form");
        toast.success("Held — take a look at the details below.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not import recipe");
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Give your recipe a name first."); return; }
    const ingredients = ingredientsText.split("\n").map(s => s.trim()).filter(Boolean);
    const instructions = instructionsText.split("\n").map(s => s.trim()).filter(Boolean);
    if (ingredients.length === 0) { toast.error("Add at least one ingredient to begin."); return; }
    setSaving(true);
    haptic("medium");
    try {
      await onSave({
        title: title.trim(),
        category,
        ingredients,
        instructions,
        estimated_time: estimatedTime ? parseInt(estimatedTime) : null,
        rating: rating || null,
        image_url: imageUrl.trim() || null,
        source_url: sourceUrl.trim() || null,
      });
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "That didn't land — try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] border-t border-border"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="font-display text-lg italic text-foreground">{editing ? "Edit recipe" : "Add recipe"}</h2>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Mode tabs — only shown when adding (not editing) */}
        {!editing && (
          <div className="flex gap-1 mx-5 mb-4 rounded-full bg-secondary p-1">
            <button onClick={() => setMode("url")}
              className={`flex-1 rounded-full py-2 font-body text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Link className="h-3.5 w-3.5" /> Import from URL
            </button>
            <button onClick={() => setMode("form")}
              className={`flex-1 rounded-full py-2 font-body text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "form" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <ChefHat className="h-3.5 w-3.5" /> Enter manually
            </button>
          </div>
        )}

        <div className="px-5 pb-8 space-y-4">
          {/* URL import panel */}
          {mode === "url" && !editing && (
            <div className="space-y-3">
              <p className="font-body text-xs text-muted-foreground">Paste a recipe URL and we'll extract it automatically.</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/recipe..."
                  className="flex-1 rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ fontSize: "16px" }}
                  onKeyDown={e => { if (e.key === "Enter") handleImport(); }}
                  disabled={importing}
                />
                <button
                  onClick={handleImport}
                  disabled={importing || !urlInput.trim()}
                  className="touch-btn rounded-xl px-4 bg-primary text-primary-foreground disabled:opacity-40 flex items-center gap-1.5 font-body text-sm"
                >
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                  {importing ? "Importing…" : "Import"}
                </button>
              </div>
              <p className="font-body text-[10px] text-muted-foreground">Uses 1 AI credit · Works with most recipe websites</p>
            </div>
          )}

          {/* Form fields — shown in form mode or after successful URL import */}
          {(mode === "form" || editing) && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Recipe name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lemon Herb Salmon"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Category + Time row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-body text-xs font-medium text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Category)}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-body text-xs font-medium text-foreground">Time (mins)</label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={e => setEstimatedTime(e.target.value)}
                    placeholder="30"
                    min="1"
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Ingredients * <span className="text-muted-foreground font-normal">(one per line)</span></label>
                <textarea
                  value={ingredientsText}
                  onChange={e => setIngredientsText(e.target.value)}
                  placeholder={"200g chicken breast\n1 cup brown rice\n2 cloves garlic"}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Instructions <span className="text-muted-foreground font-normal">(one step per line)</span></label>
                <textarea
                  value={instructionsText}
                  onChange={e => setInstructionsText(e.target.value)}
                  placeholder={"Preheat oven to 180°C\nSeason chicken with salt and pepper\nRoast for 25 minutes"}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Image URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ fontSize: "16px" }}
                />
              </div>

              {/* Source URL */}
              <div className="space-y-1.5">
                <label className="font-body text-xs font-medium text-foreground">Source URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{ fontSize: "16px" }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full touch-btn bg-primary text-primary-foreground rounded-xl py-3.5 font-body text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
                {saving ? "Saving…" : editing ? "Save changes" : "Add to my recipes"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ── Recipe detail bottom sheet ── */
function RecipeDetailSheet({ recipe, onClose, onEdit, onDelete, onRate }: {
  recipe: UserRecipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRate: (rating: number) => void;
}) {
  const [servings, setServings] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = CATEGORY_COLOR[(recipe.category as Category)] || "#9B89B4";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[20px] border-t border-border"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button onClick={onEdit} className="touch-btn p-2 rounded-full bg-secondary">
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="touch-btn p-2 rounded-full bg-secondary">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="w-full overflow-hidden">
          <RecipeImage
            recipeName={recipe.title}
            recipeId={recipe.id}
            recipeImage={recipe.image_url || undefined}
            variant="detail"
            height={220}
          />
        </div>

        <div className="p-5 pt-10 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="rounded-full px-2.5 py-0.5 font-hand text-[11px] font-bold"
                style={{ backgroundColor: `${color}15`, color }}>{recipe.category}</span>
              {recipe.estimated_time && (
                <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{recipe.estimated_time} mins
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-bold italic text-foreground">{recipe.title}</h2>

            {/* Rating */}
            <div className="mt-2">
              <StarRating value={recipe.rating || 0} onChange={v => { haptic("light"); onRate(v); }} />
            </div>
          </div>

          {/* Serves stepper */}
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-muted-foreground">Serves</span>
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">−</button>
            <span className="font-body text-sm font-bold text-foreground w-6 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">+</button>
          </div>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="font-hand text-sm font-bold mb-2" style={{ color }}>Ingredients</p>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="font-body text-xs text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/40 mt-1">•</span> {scaleIngredient(ing, servings)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions.length > 0 && (
            <div>
              <p className="font-hand text-sm font-bold mb-2" style={{ color }}>Method</p>
              <ol className="space-y-1.5">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="font-body text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{i + 1}.</span> {step.replace(/^\d+[\.\)]\s*/, "")}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Source link */}
          {recipe.source_url && (
            <a href={recipe.source_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-xs text-primary">
              <ExternalLink className="h-3.5 w-3.5" /> View original recipe
            </a>
          )}
        </div>

        {/* Confirm delete overlay */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/95 rounded-t-[20px] flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Trash2 className="h-8 w-8 text-destructive" />
              <p className="font-display text-base italic text-foreground">Delete this recipe?</p>
              <p className="font-body text-xs text-muted-foreground">This can't be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)}
                  className="touch-btn px-5 py-2.5 rounded-xl bg-secondary font-body text-sm text-foreground">
                  Cancel
                </button>
                <button onClick={onDelete}
                  className="touch-btn px-5 py-2.5 rounded-xl bg-destructive font-body text-sm text-destructive-foreground">
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function scaleIngredient(ing: string, servings: number): string {
  if (servings === 1) return ing;
  const match = ing.match(/^([\d.½⅓⅔¼¾]+)/);
  if (match) {
    const num = parseFloat(match[1]) * servings;
    return ing.replace(match[1], num % 1 === 0 ? String(num) : num.toFixed(1));
  }
  return ing;
}

/* ── Main tab ── */
export default function MyRecipesTab() {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe, setRating } = useMyRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<UserRecipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<UserRecipe | null>(null);

  const handleDelete = async (id: string) => {
    haptic("medium");
    try {
      await deleteRecipe(id);
      setSelectedRecipe(null);
      toast.success("Released.");
    } catch {
      toast.error("That didn't land — try again in a moment.");
    }
  };

  const handleSave = async (input: UserRecipeInput) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, input);
      toast.success("Held.");
    } else {
      await addRecipe(input);
      toast.success("Held.");
    }
    setEditingRecipe(null);
    setShowAdd(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      {recipes.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base italic text-foreground">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5">Your personal collection</p>
          </div>
          <button
            onClick={() => { haptic("medium"); setEditingRecipe(null); setShowAdd(true); }}
            className="touch-btn flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-body text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add recipe
          </button>
        </div>
      )}

      {/* Grid */}
      {recipes.length === 0 ? (
        <EmptyState onAdd={() => { setEditingRecipe(null); setShowAdd(true); }} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => setSelectedRecipe(recipe)} index={i} />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetailSheet
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onEdit={() => { setEditingRecipe(selectedRecipe); setSelectedRecipe(null); setShowAdd(true); }}
            onDelete={() => handleDelete(selectedRecipe.id)}
            onRate={v => setRating(selectedRecipe.id, v)}
          />
        )}
      </AnimatePresence>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {showAdd && (
          <AddModal
            editing={editingRecipe}
            onClose={() => { setShowAdd(false); setEditingRecipe(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
