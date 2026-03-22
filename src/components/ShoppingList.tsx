import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ExternalLink, Copy, Check, Trash2, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import {
  ShoppingItem, getShoppingList, addRecipeToShoppingList, removeRecipeFromShoppingList,
  toggleShoppingItem, clearShoppingList, formatShoppingListText, getWoolworthsSearchUrl, parseIngredient,
  addManualItem, removeItem,
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
          ? "bg-phase-follicular/20 text-phase-follicular"
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
            • {ing.quantity && <span className="font-mono text-[10px]">{ing.quantity} </span>}
            {ing.unit && <span className="font-mono text-[10px]">{ing.unit} </span>}
            {ing.name}
          </span>
          <a
            href={getWoolworthsSearchUrl(ing)}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-btn flex-shrink-0 flex items-center gap-1 rounded-full bg-phase-follicular/10 px-2 py-1 min-h-[32px] font-mono text-[9px] text-phase-follicular active:bg-phase-follicular/20 transition-all"
            onClick={() => haptic("light")}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Woolworths</span>
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

  const handleToggle = (index: number) => {
    haptic("light");
    setItems(toggleShoppingItem(index));
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

  const handleRemoveItem = (index: number) => {
    haptic("light");
    setItems(removeItem(index));
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

  // Group items by category
  const grouped = useMemo(() => {
    const cats: Record<string, { items: ShoppingItem[]; indices: number[] }> = {};
    items.forEach((item, index) => {
      const cat = categoriseItem(item.name);
      if (!cats[cat]) cats[cat] = { items: [], indices: [] };
      cats[cat].items.push(item);
      cats[cat].indices.push(index);
    });
    return cats;
  }, [items]);

  const checkedCount = items.filter(i => i.checked).length;
  const categoryOrder = ["produce", "protein", "dairy", "pantry", "frozen", "other"];

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="card-warm p-6 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-display text-sm italic text-foreground">Your shopping list is empty</p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Add ingredients from AI Recipes or type them manually below.
          </p>
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
          <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
            {checkedCount}/{items.length}
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
            style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{checkedCount}/{items.length}</span>
      </div>

      {/* Categories */}
      {categoryOrder.filter(cat => grouped[cat]).map(cat => {
        const { items: catItems, indices } = grouped[cat];
        const isExpanded = expandedCats[cat] !== false;

        return (
          <div key={cat} className="card-warm overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="touch-card w-full flex items-center justify-between p-3 min-h-[48px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-body text-xs font-bold text-foreground">{CATEGORY_LABELS[cat]}</span>
                <span className="font-mono text-[9px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {catItems.filter(i => i.checked).length}/{catItems.length}
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
                    {catItems.map((item, ci) => {
                      const globalIndex = indices[ci];
                      return (
                        <div key={globalIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(globalIndex)}
                            className={`touch-btn h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                              item.checked ? "bg-primary/30 border-primary/60" : "border-border"
                            }`}
                          >
                            {item.checked && <Check className="h-3 w-3 text-primary" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`font-body text-xs ${item.checked ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                              {item.quantity && <span className="font-mono text-[10px]">{item.quantity} </span>}
                              {item.unit && <span className="font-mono text-[10px]">{item.unit} </span>}
                              {item.name}
                            </span>
                            {item.recipeName && item.recipeName !== "Manual" && (
                              <p className="font-body text-[9px] text-muted-foreground/60 mt-0.5">{item.recipeName}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <a
                              href={getWoolworthsSearchUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => haptic("light")}
                              className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-primary/50 active:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <button
                              onClick={() => handleRemoveItem(globalIndex)}
                              className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-muted-foreground/40 active:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
          This list is for individual recipes you've saved. Your weekly meal plan shopping list is in My Week → Shop.
        </p>
      </div>
    </div>
  );
}
