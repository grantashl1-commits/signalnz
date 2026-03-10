import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Copy, Search } from "lucide-react";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { BotanicalSprig, WildStar } from "@/components/BotanicalElements";
import {
  WeeklyPlan,
  generateShoppingList,
  formatDateShort,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  plan: WeeklyPlan;
  phase: Phase;
}

export default function SmartShoppingList({ plan, phase }: Props) {
  const phaseColor = PHASE_HEX[phase];
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => generateShoppingList(plan), [plan]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    haptic("light");
    setExpandedCats((prev) => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleItem = (catName: string, itemName: string) => {
    haptic("light");
    const key = `${catName}:${itemName}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
    ),
  })).filter((cat) => cat.items.length > 0);

  const handleCopy = async () => {
    haptic("medium");
    const text = categories
      .map((cat) => `${cat.name}\n${cat.items.map((i) => `  ${i.quantity} ${i.unit} ${i.name}`).join("\n")}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">Shopping List</h2>
        <p className="font-hand text-sm mt-1" style={{ color: phaseColor }}>
          {PHASE_SHORT[phase]} Week · {formatDateShort(new Date(plan.dateRange.start))} – {formatDateShort(new Date(plan.dateRange.end))}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 min-h-[44px] font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: "16px" }}
        />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`, backgroundColor: phaseColor }}
          />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{checkedCount}/{totalItems}</span>
      </div>

      {/* Categories */}
      {filteredCategories.map((cat) => {
        const isExpanded = expandedCats[cat.name] !== false;
        const catChecked = cat.items.filter((i) => checkedItems[`${cat.name}:${i.name}`]).length;
        const unchecked = cat.items.filter((i) => !checkedItems[`${cat.name}:${i.name}`]);
        const checked = cat.items.filter((i) => checkedItems[`${cat.name}:${i.name}`]);
        const sortedItems = [...unchecked, ...checked];

        return (
          <div key={cat.name} className="card-warm overflow-hidden">
            <button
              onClick={() => toggleCategory(cat.name)}
              className="touch-card w-full flex items-center justify-between p-3 min-h-[48px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.emoji}</span>
                <span className="font-body text-xs font-bold text-foreground">{cat.name}</span>
                <span className="font-mono text-[9px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                  {catChecked}/{cat.items.length}
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
                    {sortedItems.map((item) => {
                      const isChecked = checkedItems[`${cat.name}:${item.name}`];
                      return (
                        <div key={item.name} className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItem(cat.name, item.name)}
                            className={`touch-btn h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                              isChecked ? "border-transparent" : "border-border"
                            }`}
                            style={isChecked ? { backgroundColor: `${phaseColor}30`, borderColor: `${phaseColor}60` } : {}}
                          >
                            {isChecked && <Check className="h-3 w-3" style={{ color: phaseColor }} />}
                          </button>
                          <span className={`font-body text-xs flex-1 transition-all ${isChecked ? "line-through opacity-50" : "text-foreground"}`}>
                            {item.name}
                          </span>
                          <span className="font-body text-xs font-bold flex-shrink-0" style={{ color: phaseColor }}>
                            {item.quantity} {item.unit}
                          </span>
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

      {/* Woolworths */}
      <a
        href="https://www.woolworths.co.nz"
        target="_blank"
        rel="noopener noreferrer"
        className="block card-warm p-4 text-center transition-all active:opacity-90"
        style={{ borderColor: phaseColor }}
      >
        <p className="font-body text-sm font-bold text-foreground">Shop on Woolworths →</p>
        <p className="font-body text-[10px] text-muted-foreground mt-1">Open Woolworths NZ to start shopping.</p>
      </a>

      {/* Tip */}
      <div className="rounded-[14px] p-4 space-y-2" style={{ backgroundColor: "#F5EDE0" }}>
        <BotanicalSprig width={80} opacity={0.15} />
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Tip.</p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Save this week's cart as a list in Woolworths titled "{PHASE_SHORT[phase]} Week {formatDateShort(new Date(plan.dateRange.start))} – {formatDateShort(new Date(plan.dateRange.end))}."
          You can reload it in future with one tap — no re-searching needed.
        </p>
      </div>

      {/* Copy action only — no save */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-3 min-h-[44px] font-body text-xs font-medium bg-primary/10 text-primary active:bg-primary/20 transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy list"}
        </button>
      </div>
    </div>
  );
}
