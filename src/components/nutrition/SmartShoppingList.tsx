import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Copy, Search, ShoppingCart, ExternalLink, Plus, X } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { useCycle } from "@/contexts/CycleContext";
import {
  AIMealPlan,
  formatDateShort,
} from "@/lib/weekly-planner";
import { parseIngredient, ParsedIngredient, getWoolworthsSearchUrl } from "@/lib/ingredient-parser";
import { haptic } from "@/hooks/use-mobile";
import { getSupermarket, getPantryStaples } from "@/lib/fitness-profile";
import { getISOWeek } from "@/lib/weekly-planner";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  produce: ["onion", "garlic", "ginger", "tomato", "spinach", "kale", "broccoli", "capsicum", "pepper", "carrot", "potato", "sweet potato", "kumara", "zucchini", "mushroom", "avocado", "banana", "apple", "berry", "berries", "lemon", "lime", "mango", "kiwi", "cucumber", "asparagus", "bok choy", "pumpkin", "beetroot", "cabbage", "spring onion", "coriander", "parsley", "mint", "basil", "chilli", "pear", "orange", "fruit", "lettuce", "celery"],
  protein: ["chicken", "beef", "lamb", "pork", "fish", "salmon", "tuna", "prawn", "tofu", "tempeh", "egg", "turkey", "lentil", "chickpea", "bean", "edamame"],
  dairy: ["milk", "yoghurt", "yogurt", "cream", "cheese", "butter"],
  pantry: ["coconut milk", "coconut oil", "olive oil", "sesame oil", "tamari", "miso", "mirin", "maple syrup", "honey", "vinegar", "soy", "stock", "tomato paste", "canned", "peanut butter", "almond butter", "tahini", "chocolate", "cacao", "vanilla", "flour", "sugar", "rice", "pasta", "noodle", "oat", "quinoa", "bread", "wrap"],
  frozen: ["frozen"],
};

function categoriseItem(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return "other";
}

const CATEGORY_META: Record<string, string> = {
  produce: "Produce",
  protein: "Protein",
  dairy: "Dairy / Alternatives",
  pantry: "Pantry",
  frozen: "Frozen",
  other: "Other",
};

function parseQty(qty: string): number {
  if (!qty) return 1;
  const q = qty.trim();
  if (q.includes("/")) {
    const [a, b] = q.split("/");
    return parseInt(a) / parseInt(b);
  }
  if (q.includes("-")) {
    const [a, b] = q.split("-");
    return (parseFloat(a) + parseFloat(b)) / 2;
  }
  const n = parseFloat(q);
  return isNaN(n) ? 1 : n;
}

interface AggregatedItem {
  name: string;
  totalQty: number;
  unit: string;
  category: string;
  searchTerm: string;
  isPantryStaple?: boolean;
  isCustom?: boolean;
}

// Persistence helpers for checked items & custom items
function getWeekKey(): string {
  return getISOWeek(new Date());
}

function getCheckedState(): Record<string, boolean> {
  try {
    const key = `shopping_checked_${getWeekKey()}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch { return {}; }
}

function saveCheckedState(state: Record<string, boolean>) {
  const key = `shopping_checked_${getWeekKey()}`;
  localStorage.setItem(key, JSON.stringify(state));
  // Auto-clear old weeks (anything older than 8 days)
  try {
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith("shopping_checked_"));
    const now = Date.now();
    allKeys.forEach(k => {
      if (k === key) return;
      // Simple age check - just remove non-current week keys
      const weekStr = k.replace("shopping_checked_", "");
      if (weekStr !== getWeekKey()) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}

function getCustomItems(): AggregatedItem[] {
  try {
    const key = `shopping_custom_${getWeekKey()}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

function saveCustomItems(items: AggregatedItem[]) {
  const key = `shopping_custom_${getWeekKey()}`;
  localStorage.setItem(key, JSON.stringify(items));
}

interface Props {
  plan: AIMealPlan;
  weekNumber: number;
}

export default function SmartShoppingList({ plan, weekNumber }: Props) {
  const { currentPhase } = useCycle();
  const phaseColor = PHASE_HEX[currentPhase];
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(getCheckedState);
  const [customItems, setCustomItems] = useState<AggregatedItem[]>(getCustomItems);
  const [customInput, setCustomInput] = useState("");
  const supermarket = getSupermarket();
  const pantryStaples = useMemo(() => getPantryStaples(), []);

  // Persist checked state
  useEffect(() => { saveCheckedState(checkedItems); }, [checkedItems]);
  useEffect(() => { saveCustomItems(customItems); }, [customItems]);

  const monday = useMemo(() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    d.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const sunday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 6);
    return d;
  }, [monday]);

  // Check if an item is a pantry staple
  const isPantryStaple = (name: string): boolean => {
    const lower = name.toLowerCase();
    return pantryStaples.some(s => lower.includes(s.toLowerCase()));
  };

  const categories = useMemo(() => {
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = weekNumber * 7;
    const weekDays = plan.days.filter(d => d.cycleDay >= startDay && d.cycleDay <= endDay);
    
    const ingredientMap: Record<string, AggregatedItem> = {};
    const servingMultiplier = plan.prepPreferences.adults + plan.prepPreferences.kids * 0.6;

    weekDays.forEach(day => {
      const meals = [day.breakfast, day.lunch, day.dinner];
      if (day.morningSnack?.ingredients?.length) meals.push(day.morningSnack);
      if (day.afternoonSnack?.ingredients?.length) meals.push(day.afternoonSnack);

      meals.forEach(meal => {
        if (!meal || meal.isLeftover) return;
        (meal.ingredients || []).forEach(ingStr => {
          const parsed = parseIngredient(ingStr);
          const baseQty = parseQty(parsed.quantity);
          const totalQty = baseQty * servingMultiplier / (meal.serves || 2);
          const mapKey = parsed.searchTerm.toLowerCase();
          const cat = categoriseItem(parsed.name);

          if (ingredientMap[mapKey]) {
            ingredientMap[mapKey].totalQty += totalQty;
          } else {
            ingredientMap[mapKey] = {
              name: parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1),
              totalQty,
              unit: parsed.unit,
              category: cat,
              searchTerm: parsed.searchTerm,
              isPantryStaple: isPantryStaple(parsed.name),
            };
          }
        });
      });
    });

    // Add custom items
    customItems.forEach(item => {
      const cat = item.category || categoriseItem(item.name);
      const mapKey = `custom:${item.name.toLowerCase()}`;
      ingredientMap[mapKey] = { ...item, category: cat, isCustom: true };
    });

    // Group by category
    const groups: Record<string, AggregatedItem[]> = {};
    Object.values(ingredientMap).forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    return groups;
  }, [plan, weekNumber, customItems, pantryStaples]);

  const toggleCategory = (catName: string) => {
    haptic("light");
    setExpandedCats(prev => ({ ...prev, [catName]: prev[catName] === false ? true : false }));
  };

  const toggleItem = (key: string) => {
    haptic("light");
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    haptic("light");
    const parsed = parseIngredient(customInput.trim());
    const newItem: AggregatedItem = {
      name: parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1),
      totalQty: parseQty(parsed.quantity) || 1,
      unit: parsed.unit,
      category: categoriseItem(parsed.name),
      searchTerm: parsed.searchTerm,
      isCustom: true,
    };
    setCustomItems(prev => [...prev, newItem]);
    setCustomInput("");
  };

  const removeCustomItem = (name: string) => {
    haptic("light");
    setCustomItems(prev => prev.filter(i => i.name !== name));
  };

  const allItems = Object.values(categories).flat();
  const totalItems = allItems.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const categoryOrder = ["produce", "protein", "dairy", "pantry", "frozen", "other"];

  const handleCopy = async () => {
    haptic("medium");
    const text = categoryOrder
      .filter(cat => categories[cat]?.length)
      .map(cat => {
        const items = categories[cat];
        return `${CATEGORY_META[cat]}\n${items.map(i => {
          const qty = i.totalQty < 1 ? `${Math.round(i.totalQty * 10) / 10}` :
            i.totalQty > 10 ? `${Math.round(i.totalQty)}` :
              `${Math.round(i.totalQty * 10) / 10}`;
          return `  ${qty} ${i.unit} ${i.name}${i.isPantryStaple ? " ✓ pantry" : ""}`;
        }).join("\n")}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(`Shopping List — Week ${weekNumber}\n${"—".repeat(30)}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startDay = (weekNumber - 1) * 7 + 1;
  const weekDays = plan.days.filter(d => d.cycleDay >= startDay && d.cycleDay <= startDay + 6);
  const dominantPhase = weekDays.length > 0 ? weekDays[Math.floor(weekDays.length / 2)].phase : currentPhase;
  const weekPhaseColor = PHASE_HEX[dominantPhase as Phase] || phaseColor;

  if (totalItems === 0) {
    return (
      <div className="space-y-4">
        <div className="card-warm p-6 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-display text-sm italic text-foreground">Nothing here yet</p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Add ingredients from AI Recipes or type something in.
          </p>
        </div>
        <div className="flex gap-2">
          <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddCustom()}
            placeholder="Add item manually..." style={{ fontSize: "16px" }}
            className="flex-1 rounded-xl border border-border bg-card pl-4 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleAddCustom} className="touch-btn rounded-xl bg-primary px-4 py-3 min-h-[44px] text-primary-foreground">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="rounded-[14px] p-3 bg-secondary/50">
        <p className="font-body text-xs text-foreground">
          Based on your plan for <span className="font-semibold">{formatDateShort(monday)} – {formatDateShort(sunday)}</span>,{" "}
          <span className="font-semibold" style={{ color: weekPhaseColor }}>
            {(dominantPhase as string).charAt(0).toUpperCase() + (dominantPhase as string).slice(1)} week
          </span>.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search ingredients..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }} />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`, backgroundColor: weekPhaseColor }} />
        </div>
        <span className="font-body text-[10px] text-muted-foreground">{checkedCount}/{totalItems}</span>
      </div>

      {/* Categories */}
      {categoryOrder.filter(cat => categories[cat]?.length).map(cat => {
        const items = categories[cat].filter(item =>
          search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
        );
        if (items.length === 0) return null;
        const isExpanded = expandedCats[cat] !== false;
        const catChecked = items.filter(i => checkedItems[`${cat}:${i.name}`]).length;

        return (
          <div key={cat} className="card-warm overflow-hidden">
            <button onClick={() => toggleCategory(cat)}
              className="touch-card w-full flex items-center justify-between p-3 min-h-[48px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: weekPhaseColor }} />
                <span className="font-body text-xs font-bold text-foreground">{CATEGORY_META[cat]}</span>
                <span className="font-body text-[9px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {catChecked}/{items.length}
                </span>
              </div>
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-3 pb-3 space-y-1.5">
                    {items.map(item => {
                      const key = `${cat}:${item.name}`;
                      const isChecked = checkedItems[key];
                      const displayQty = item.totalQty < 1 ? `${Math.round(item.totalQty * 10) / 10}` :
                        item.totalQty > 10 ? `${Math.round(item.totalQty)}` :
                          `${Math.round(item.totalQty * 10) / 10}`;
                      const parsed: ParsedIngredient = {
                        raw: item.name, quantity: displayQty, unit: item.unit,
                        name: item.name, searchTerm: item.searchTerm,
                      };

                      return (
                        <div key={item.name} className="flex items-center gap-2">
                          <button onClick={() => toggleItem(key)}
                            className="touch-btn flex-shrink-0 transition-all">
                            <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isChecked ? "border-transparent" : "border-border"
                            }`}
                            style={isChecked ? { backgroundColor: `${weekPhaseColor}30`, borderColor: `${weekPhaseColor}60` } : {}}>
                              {isChecked && <Check className="h-3 w-3" style={{ color: weekPhaseColor }} />}
                            </span>
                          </button>
                          <span className={`font-body text-xs flex-1 transition-all ${isChecked ? "line-through opacity-50" : "text-foreground"}`}>
                            {item.name}
                            {item.isPantryStaple && (
                              <span className="ml-1 text-[9px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">✓ pantry</span>
                            )}
                            {item.isCustom && (
                              <span className="ml-1 text-[9px] text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">custom</span>
                            )}
                          </span>
                          <span className="font-body text-xs font-bold flex-shrink-0" style={{ color: weekPhaseColor }}>
                            {displayQty} {item.unit}
                          </span>
                          {item.isCustom && (
                            <button onClick={() => removeCustomItem(item.name)}
                              className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-muted-foreground/40 active:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          <a href={getWoolworthsSearchUrl(parsed)} target="_blank" rel="noopener noreferrer"
                            onClick={() => haptic("light")}
                            className="touch-btn p-1 min-h-[28px] min-w-[28px] flex items-center justify-center text-muted-foreground/50 active:text-primary">
                            <ExternalLink className="h-3 w-3" />
                          </a>
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

      {/* Add custom item */}
      <div className="flex gap-2">
        <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddCustom()}
          placeholder="+ Add item to list..." style={{ fontSize: "16px" }}
          className="flex-1 rounded-xl border border-border bg-card pl-4 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={handleAddCustom} disabled={!customInput.trim()}
          className="touch-btn rounded-xl bg-primary px-4 py-3 min-h-[44px] text-primary-foreground disabled:opacity-40">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleCopy}
          className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-3 min-h-[44px] font-body text-xs font-medium bg-primary/10 text-primary active:bg-primary/20 transition-all">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy list"}
        </button>
      </div>

      {/* Supermarket link */}
      <a href={supermarket.url} target="_blank" rel="noopener noreferrer" onClick={() => haptic("medium")}
        className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-primary px-4 py-3 min-h-[44px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-all">
        <ShoppingCart className="h-4 w-4" />
        Shop at {supermarket.name}
        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
      </a>

      {/* Tip */}
      <div className="rounded-[14px] p-4 bg-secondary/30">
        <BotanicalSprig width={80} opacity={0.15} />
        <p className="font-body text-[10px] text-muted-foreground leading-relaxed mt-1">
          Duplicates are combined automatically. Pantry staples you've marked are tagged — skip buying what you already have.
        </p>
      </div>
    </div>
  );
}
