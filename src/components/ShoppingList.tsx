import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ExternalLink, Copy, Check, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import {
  ShoppingItem, getShoppingList, addRecipeToShoppingList, removeRecipeFromShoppingList,
  toggleShoppingItem, clearShoppingList, formatShoppingListText, getWoolworthsSearchUrl, parseIngredient,
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

export function ShoppingListPanel() {
  const [items, setItems] = useState(getShoppingList);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const supermarket = getSupermarket();

  if (items.length === 0) {
    return (
      <div className="card-warm p-4 md:p-5 text-center">
        <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="font-hand text-sm text-muted-foreground">Your shopping list is empty</p>
        <p className="font-body text-xs text-muted-foreground/60 mt-1">
          Tap "Add to list" on any recipe to get started
        </p>
      </div>
    );
  }

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

  // Group by recipe
  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.recipeId]) acc[item.recipeId] = [];
    acc[item.recipeId].push(item);
    return acc;
  }, {});

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="card-warm overflow-hidden">
      <button
        onClick={() => { haptic("light"); setExpanded(!expanded); }}
        className="touch-card w-full flex items-center justify-between p-4 md:p-5 min-h-[56px]"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="font-hand text-sm font-bold text-primary">shopping list</span>
          <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
            {checkedCount}/{items.length}
          </span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
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
            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
              {Object.entries(grouped).map(([recipeId, recipeItems]) => (
                <div key={recipeId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs italic text-foreground">{recipeItems[0].recipeName}</span>
                    <button
                      onClick={() => handleRemoveRecipe(recipeId)}
                      className="touch-btn p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-muted-foreground active:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {recipeItems.map((item) => {
                      const globalIndex = items.indexOf(item);
                      return (
                        <div key={globalIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(globalIndex)}
                            className={`touch-btn h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                              item.checked ? "bg-phase-follicular/30 border-phase-follicular/60" : "border-border"
                            }`}
                          >
                            {item.checked && <Check className="h-3 w-3 text-phase-follicular" />}
                          </button>
                          <span className={`font-body text-xs flex-1 ${item.checked ? "line-through text-muted-foreground/50" : "text-muted-foreground"}`}>
                            {item.quantity && <span className="font-mono text-[10px]">{item.quantity} </span>}
                            {item.unit && <span className="font-mono text-[10px]">{item.unit} </span>}
                            {item.name}
                          </span>
                          <a
                            href={getWoolworthsSearchUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => haptic("light")}
                            className="touch-btn flex-shrink-0 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-phase-follicular/60 active:text-phase-follicular"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={handleCopy}
                  className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-full bg-primary/10 px-3 py-2.5 min-h-[44px] font-body text-xs font-medium text-primary active:bg-primary/20 transition-all"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy list"}
                </button>
                <button
                  onClick={handleClear}
                  className="touch-btn flex items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 min-h-[44px] font-body text-xs font-medium text-muted-foreground active:bg-secondary/80 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>

              {/* Supermarket link */}
              <a
                href={supermarket.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => haptic("medium")}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 min-h-[44px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                Shop at {supermarket.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>

              {/* Woolworths note */}
              <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
                <WildStar size={14} color="hsl(var(--primary))" />
                <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
                  Tap <ExternalLink className="inline h-2.5 w-2.5" /> next to each item to search on{" "}
                  <a href={supermarket.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {supermarket.name}
                  </a>{" "}
                  and add to your cart directly. Change your supermarket in Account settings.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
