import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Copy, Search, ShoppingCart, ExternalLink, Plus, X, Printer } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

import {
  CATEGORY_META,
  CATEGORY_ORDER,
  toNZName,
  categoriseItem,
  parseQty,
  toBase,
  formatSmartQty,
  AggregatedItem,
} from "@/lib/smart-shopping-core";


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
  const { user } = useAuth();
  const phaseColor = PHASE_HEX[currentPhase];
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(getCheckedState);
  const [customItems, setCustomItems] = useState<AggregatedItem[]>(getCustomItems);
  const [customInput, setCustomInput] = useState("");
  const [hidePantry, setHidePantry] = useState<boolean>(() => {
    try { return localStorage.getItem("shopping_hide_pantry") === "1"; } catch { return false; }
  });
  const supermarket = getSupermarket();
  const pantryStaples = useMemo(() => getPantryStaples(), []);
  const weekKey = getWeekKey();
  const supabaseLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 4C: load from Supabase on mount (falls back to localStorage which is already set)
  useEffect(() => {
    if (!user || supabaseLoaded.current) return;
    supabaseLoaded.current = true;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("shopping_lists")
          .select("checked_items, custom_items")
          .eq("user_id", user.id)
          .eq("week_key", weekKey)
          .maybeSingle();
        if (data) {
          const checked = (data.checked_items as Record<string, boolean>) || {};
          const custom = (data.custom_items as AggregatedItem[]) || [];
          setCheckedItems(checked);
          setCustomItems(custom);
          saveCheckedState(checked);
          saveCustomItems(custom);
        }
      } catch {
        // silent fallback to localStorage
      }
    })();
  }, [user, weekKey]);

  // Phase 4C: debounced save to Supabase (500ms after last change)
  const syncToSupabase = useCallback((checked: Record<string, boolean>, custom: AggregatedItem[]) => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await (supabase as any)
          .from("shopping_lists")
          .upsert({
            user_id: user.id,
            week_key: weekKey,
            checked_items: checked,
            custom_items: custom,
          }, { onConflict: "user_id,week_key" });
      } catch {
        // silent — localStorage is the source of truth
      }
    }, 500);
  }, [user, weekKey]);

  // Persist to localStorage + queue Supabase sync
  useEffect(() => {
    saveCheckedState(checkedItems);
    syncToSupabase(checkedItems, customItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems]);

  useEffect(() => {
    saveCustomItems(customItems);
    syncToSupabase(checkedItems, customItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customItems]);

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
          // Translate to NZ supermarket wording so the list reads kiwi.
          const nzName = toNZName(parsed.name);
          const nzSearch = toNZName(parsed.searchTerm);
          const baseQty = parseQty(parsed.quantity);
          const totalQty = baseQty * servingMultiplier / (meal.serves || 2);
          const mapKey = nzSearch.toLowerCase();
          const cat = categoriseItem(nzName);

          // Normalise into base unit (g | ml | count) so g/ml/tbsp/cup variants
          // for the same ingredient combine into one row.
          const base = toBase(totalQty, parsed.unit, nzName);
          const unitKey = base.unit || "unit";
          const fullKey = `${mapKey}::${unitKey}`;
          if (ingredientMap[fullKey]) {
            ingredientMap[fullKey].totalQty += base.qty;
          } else {
            ingredientMap[fullKey] = {
              name: nzName.charAt(0).toUpperCase() + nzName.slice(1),
              totalQty: base.qty,
              unit: base.unit,
              category: cat,
              searchTerm: nzSearch,
              isPantryStaple: isPantryStaple(nzName),
            };
          }
        });
      });
    });

    // Add seed cycling ingredients for the week
    const firstHalfDays = weekDays.filter(d => d.cycleDay <= 14).length;
    const secondHalfDays = weekDays.filter(d => d.cycleDay > 14).length;
    const seedItems: { name: string; unit: string; qty: number }[] = [];
    if (firstHalfDays > 0) {
      seedItems.push({ name: "Pumpkin seeds", unit: "tbsp", qty: firstHalfDays });
      seedItems.push({ name: "Flaxseeds", unit: "tbsp", qty: firstHalfDays });
    }
    if (secondHalfDays > 0) {
      seedItems.push({ name: "Sunflower seeds", unit: "tbsp", qty: secondHalfDays });
      seedItems.push({ name: "Sesame seeds", unit: "tbsp", qty: secondHalfDays });
    }
    seedItems.forEach(seed => {
      const base = toBase(seed.qty, seed.unit, seed.name);
      const fullKey = `${seed.name.toLowerCase()}::${base.unit}`;
      if (ingredientMap[fullKey]) {
        ingredientMap[fullKey].totalQty += base.qty;
      } else {
        ingredientMap[fullKey] = {
          name: seed.name, totalQty: base.qty, unit: base.unit,
          category: "pantry", searchTerm: seed.name.toLowerCase(),
          isPantryStaple: false,
        };
      }
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
    const nzName = toNZName(parsed.name);
    const nzSearch = toNZName(parsed.searchTerm);
    const newItem: AggregatedItem = {
      name: nzName.charAt(0).toUpperCase() + nzName.slice(1),
      totalQty: parseQty(parsed.quantity) || 1,
      unit: parsed.unit,
      category: categoriseItem(nzName),
      searchTerm: nzSearch,
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
  const categoryOrder = CATEGORY_ORDER;

  const handleCopy = async () => {
    haptic("medium");
    const text = categoryOrder
      .filter(cat => categories[cat]?.length)
      .map(cat => {
        const items = categories[cat];
        return `${CATEGORY_META[cat]}\n${items.map(i => {
          const smart = formatSmartQty(i.totalQty, i.unit, i.name);
          return `  ${smart} ${i.name}${i.isPantryStaple ? " ✓ pantry" : ""}`;
        }).join("\n")}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(`Shopping List — Week ${weekNumber}\n${"—".repeat(30)}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    haptic("medium");
    const catOrder = categoryOrder.filter(cat => categories[cat]?.length);
    const tableHtml = catOrder.map(cat => {
      const items = categories[cat];
      const rows = items.map(i => {
        const smart = formatSmartQty(i.totalQty, i.unit, i.name);
        const checked = checkedItems[`${cat}:${i.name}`] ? "✓" : "☐";
        return `<tr><td style="padding:3px 6px;border-bottom:1px solid #ddd;font-size:11px;width:20px;">${checked}</td><td style="padding:3px 6px;border-bottom:1px solid #ddd;font-size:11px;">${i.name}${i.isPantryStaple ? ' <span style="color:#999;font-size:9px;">(pantry)</span>' : ""}</td><td style="padding:3px 6px;border-bottom:1px solid #ddd;font-size:11px;text-align:right;white-space:nowrap;">${smart}</td></tr>`;
      }).join("");
      return `<div style="break-inside:avoid;margin-bottom:12px;"><table style="width:100%;border-collapse:collapse;"><thead><tr><th colspan="3" style="background:#5B2D72;color:white;padding:5px 8px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.5px;">${CATEGORY_META[cat]}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }).join("");
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><title>Shopping List</title><style>@page{size:A4;margin:12mm}body{font-family:'Montserrat',Arial,sans-serif;color:#1a1a1a;margin:0;padding:16px}h1{font-size:16px;font-weight:700;color:#5B2D72;margin-bottom:2px}.sub{font-size:10px;color:#666;margin-bottom:14px}.grid{column-count:3;column-gap:14px}@media print{.grid{column-count:3}body{padding:0}}</style></head><body><h1>Signal Shopping List</h1><p class="sub">Week ${weekNumber} &middot; ${formatDateShort(monday)} &ndash; ${formatDateShort(sunday)}</p><div class="grid">${tableHtml}</div><p style="margin-top:14px;font-size:8px;color:#aaa;text-align:center">signalnz.lovable.app</p></body></html>`);
    printWin.document.close();
    printWin.print();
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
          <p className="font-display text-sm italic text-foreground">Nothing on the list yet — your plan will fill it</p>
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

      {/* Pantry skip toggle */}
      <button
        onClick={() => {
          haptic("light");
          setHidePantry(v => {
            const next = !v;
            try { localStorage.setItem("shopping_hide_pantry", next ? "1" : "0"); } catch {}
            return next;
          });
        }}
        className="touch-btn w-full flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 min-h-[40px]"
      >
        <span className="font-body text-xs text-foreground">
          Hide pantry staples
          <span className="ml-2 font-body text-[10px] text-muted-foreground">(things you've marked as already at home)</span>
        </span>
        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hidePantry ? "" : "bg-secondary"}`}
          style={hidePantry ? { backgroundColor: weekPhaseColor } : {}}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${hidePantry ? "translate-x-4" : "translate-x-0.5"}`} />
        </span>
      </button>


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
        const items = categories[cat].filter(item => {
          if (hidePantry && item.isPantryStaple) return false;
          return search ? item.name.toLowerCase().includes(search.toLowerCase()) : true;
        });
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
                      const smartDisplay = formatSmartQty(item.totalQty, item.unit, item.name);
                      const parsed: ParsedIngredient = {
                        raw: item.name, quantity: String(item.totalQty), unit: item.unit,
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
                            {smartDisplay}
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
        <button onClick={handlePrint}
          className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-3 min-h-[44px] font-body text-xs font-medium bg-primary/10 text-primary active:bg-primary/20 transition-all">
          <Printer className="h-3.5 w-3.5" />
          Print list
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
