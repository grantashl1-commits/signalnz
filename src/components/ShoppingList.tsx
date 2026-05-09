import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ExternalLink, Copy, Check, Trash2, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import {
  ShoppingItem, MergedShoppingItem, getShoppingList, addRecipeToShoppingList, removeRecipeFromShoppingList,
  toggleMergedItem, clearShoppingList, formatShoppingListText, getWoolworthsSearchUrl, parseIngredient,
  addManualItem, removeMergedItem, mergeShoppingItems,
} from "@/lib/ingredient-parser";
import { haptic } from "@/hooks/use-mobile";
import { getSupermarket } from "@/lib/fitness-profile";

interface RecipeShoppingButtonProps {
  recipeId: string;
  recipeName: string;
  ingredients: string[];
}

export function RecipeShoppingButton({ recipeId, recipeName, ingredients }: RecipeShoppingButtonProps) {
  const [added, setAdded] = useState(() => getShoppingList().some((i) => i.recipeId === recipeId));

  const handleToggle = () => {
    haptic("light");
    if (added) {
      removeRecipeFromShoppingList(recipeId);
      setAdded(false);
    } else {
      addRecipeToShoppingList(recipeId, recipeName, ingredients);
      setAdded(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`touch-btn flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
        added
          ? "bg-primary/20 text-primary"
          : "bg-secondary text-muted-foreground active:bg-secondary/80"
      }`}
    >
      {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {added ? "In list" : "Add to list"}
    </button>
  );
}

interface IngredientSearchLinksProps {
  ingredients: string[];
}

export function IngredientSearchLinks({ ingredients }: IngredientSearchLinksProps) {
  const parsed = ingredients.map(parseIngredient);

  return (
    <div className="space-y-1">
      {parsed.map((ing, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <span className="font-body text-xs text-muted-foreground flex-1">
            • {ing.quantity && <span className="font-body text-[10px]">{ing.quantity} </span>}
            {ing.unit && <span className="font-body text-[10px]">{ing.unit} </span>}
            {ing.name}
          </span>
          <a
            href={getWoolworthsSearchUrl(ing)}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-btn flex-shrink-0 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 min-h-[32px] font-body text-[9px] text-primary active:bg-primary/20 transition-all"
            onClick={() => haptic("light")}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Shop</span>
          </a>
        </div>
      ))}
    </div>
  );
}

// Category classification for display grouping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  produce: ["onion", "garlic", "ginger", "tomato", "spinach", "kale", "broccoli", "capsicum", "pepper", "carrot", "potato", "sweet potato", "kumara", "zucchini", "mushroom", "avocado", "banana", "apple", "berry", "berries", "lemon", "lime", "mango", "kiwi", "cucumber", "asparagus", "bok choy", "pumpkin", "beetroot", "cabbage", "spring onion", "coriander", "parsley", "mint", "basil", "chilli", "pear", "orange", "fruit", "lettuce", "celery"],
  protein: ["chicken", "beef", "lamb", "pork", "fish", "salmon", "tuna", "prawn", "tofu", "tempeh", "egg", "turkey", "lentil", "chickpea", "bean", "edamame"],
  dairy: ["milk", "yoghurt", "yogurt", "cream", "cheese", "butter"],
  pantry: ["coconut milk", "coconut oil", "olive oil", "sesame oil", "tamari", "miso", "mirin", "maple syrup", "honey", "vinegar", "soy", "stock", "tomato paste", "canned", "peanut butter", "almond butter", "tahini", "chocolate", "cacao", "vanilla", "flour", "sugar", "rice", "pasta", "noodle", "oat", "quinoa", "bread"],
  frozen: ["frozen"],
};

function categoriseItem(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return "other";
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  protein: "Protein",
  dairy: "Dairy / Alternatives",
  pantry: "Pantry",
  frozen: "Frozen",
  other: "Other",
};

export function ShoppingListPanel() {
  const [items, setItems] = useState(getShoppingList);
  const [copied, setCopied] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const supermarket = getSupermarket();

  const handleToggleMerged = (indices: number[]) => {
    haptic("light");
    setItems(toggleMergedItem(indices));
  };

  const handleCopy = async () => {
    haptic("medium");
    await navigator.clipboard.writeText(formatShoppingListText(items));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    haptic("medium");
    setItems(clearShoppingList());
  };

  const handleRemoveRecipe = (recipeId: string) => {
    haptic("light");
    setItems(removeRecipeFromShoppingList(recipeId));
  };

  const handleRemoveMerged = (indices: number[]) => {
    haptic("light");
    setItems(removeMergedItem(indices));
  };

  const handleAddManual = () => {
    if (!manualInput.trim()) return;
    haptic("light");
    setItems(addManualItem(manualInput.trim()));
    setManualInput("");
  };

  const toggleCategory = (cat: string) => {
    haptic("light");
    setExpandedCats(prev => ({ ...prev, [cat]: prev[cat] === false ? true : false }));
  };

  // Merge duplicates then group by category
  const merged = useMemo(() => mergeShoppingItems(items), [items]);

  const grouped = useMemo(() => {
    const cats: Record<string, MergedShoppingItem[]> = {};
    merged.forEach(item => {
      const cat = categoriseItem(item.name);
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(item);
    });
    return cats;
  }, [merged]);

  const checkedCount = merged.filter(m => m.checked).length;
  const categoryOrder = ["produce", "protein", "dairy", "pantry", "frozen", "other"];

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="card-warm p-8 text-center space-y-4">
          <div className="flex justify-center gap-3 opacity-60">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-primary">
              <circle cx="20" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M16 22c0 0 2 6 4 6s4-6 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="14" r="2" fill="currentColor" opacity="0.3" />
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-primary">
              <ellipse cx="20" cy="20" rx="10" ry="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M15 16c2-3 6-3 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="22" r="1.5" fill="currentColor" opacity="0.3" />
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-primary">
              <rect x="12" y="10" width="16" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="16" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <line x1="16" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-base font-bold italic text-foreground">Your cycle-synced shopping list</h3>
            <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Tap Generate to build your week's list automatically.
            </p>
          </div>
          <button
            onClick={() => {
              haptic("medium");
              toast("Begin with a plan in 'My Week' first — then your list will follow.");
            }}
            className="touch-btn inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 min-h-[44px] font-body text-sm font-bold transition-all active:scale-[0.97]"
          >
            <ShoppingCart className="h-4 w-4" />
            Generate from my meal plan
          </button>
        </div>

        {/* Manual add */}
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddManual()}
            placeholder="Add item manually..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={handleAddManual}
            className="touch-btn rounded-xl bg-primary px-4 py-2.5 min-h-[44px] font-body text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="font-display text-sm italic text-foreground">Shopping List</span>
          <span className="font-body text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
            {checkedCount}/{merged.length}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="touch-btn flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 min-h-[32px] font-body text-[10px] text-muted-foreground"
        >
          <Trash2 className="h-3 w-3" />
          Clear all
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${merged.length > 0 ? (checkedCount / merged.length) * 100 : 0}%` }}
          />
        </div>
        <span className="font-body text-[10px] text-muted-foreground">{checkedCount}/{merged.length}</span>
      </div>

      {/* Categories */}
      {categoryOrder.filter(cat => grouped[cat]).map(cat => {
        const catItems = grouped[cat];
        const isExpanded = expandedCats[cat] !== false;
        const catChecked = catItems.filter(m => m.checked).length;

        return (
          <div key={cat} className="card-warm overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="touch-card w-full flex items-center justify-between p-3 min-h-[48px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-body text-xs font-bold text-foreground">{CATEGORY_LABELS[cat]}</span>
                <span className="font-body text-[9px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {catChecked}/{catItems.length}
                </span>
              </div>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-1.5">
                    {catItems.map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMerged(item.sourceIndices)}
                          className="touch-btn flex-shrink-0 transition-all"
                        >
                          <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            item.checked ? "bg-primary/30 border-primary/60" : "border-border"
                          }`}>
                            {item.checked && <Check className="h-3 w-3 text-primary" />}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`font-body text-xs ${item.checked ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                            {item.totalQuantity && <span className="font-semibold text-[10px]">{item.totalQuantity} </span>}
                            {item.unit && <span className="text-[10px]">{item.unit} </span>}
                            {item.name}
                          </span>
                          {item.recipes.length > 0 && (
                            <p className="font-body text-[9px] text-muted-foreground/60 mt-0.5">
                              {item.recipes.join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={getWoolworthsSearchUrl({ searchTerm: item.searchTerm } as any)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => haptic("light")}
                            className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-primary/50 active:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() => handleRemoveMerged(item.sourceIndices)}
                            className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-muted-foreground/40 active:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Manual add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddManual()}
          placeholder="Add item manually..."
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          style={{ fontSize: "16px" }}
        />
        <button
          onClick={handleAddManual}
          className="touch-btn rounded-xl bg-primary px-4 py-2.5 min-h-[44px] font-body text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-3 min-h-[44px] font-body text-xs font-medium bg-primary/10 text-primary active:bg-primary/20 transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy list"}
        </button>
      </div>

      {/* Supermarket link */}
      <a
        href={supermarket.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic("medium")}
        className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-primary px-4 py-3 min-h-[44px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-all"
      >
        <ShoppingCart className="h-4 w-4" />
        Shop at {supermarket.name}
        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
      </a>

      {/* Tip */}
      <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
        <WildStar size={14} color="hsl(var(--primary))" />
        <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
          Duplicate ingredients are grouped and quantities combined automatically.
        </p>
      </div>
    </div>
  );
}
