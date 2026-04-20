import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, HelpCircle, Search, Plus, ExternalLink, Layers, Sparkles } from "lucide-react";
import { getLibraryHabitsForCategory, SUPPLEMENT_DISCLAIMER, SUBCATEGORY_LABELS_BY_CATEGORY, type LibraryHabit } from "@/data/habit-library";
import { HABIT_ICONS, CapsuleIcon } from "@/components/HabitIcons";
import { RITUAL_ICONS, SelfCareHandIcon } from "@/components/SelfCareIcons";
import { SELF_CARE_RITUALS, RITUAL_CATEGORIES, addHabit, getHabits, type Habit, type HabitCategory } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";

interface HabitLibraryPickerProps {
  open: boolean;
  category: HabitCategory;
  onClose: () => void;
  onAdded: () => void;
}

const CATEGORY_TITLES: Record<HabitCategory, string> = {
  supplements: "Supplements",
  "self-care": "Self Care",
  nutrition: "Nutrition",
  movement: "Movement",
};

export default function HabitLibraryPicker({ open, category, onClose, onAdded }: HabitLibraryPickerProps) {
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [search, setSearch] = useState("");
  const existingHabits = getHabits();

  // Wellness Stack mode (supplements only) — multi-select to bundle into one habit
  const [stackMode, setStackMode] = useState(false);
  const [stackSelected, setStackSelected] = useState<Set<string>>(new Set());

  const toggleStackPick = (id: string) => {
    haptic("light");
    setStackSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveStack = () => {
    if (stackSelected.size === 0) return;
    haptic("medium");
    const libraryHabits = getLibraryHabitsForCategory(category);
    const picked = libraryHabits.filter(h => stackSelected.has(h.id));
    const names = picked.map(h => h.name);
    // Strip dosage parens for cleaner bracket list (e.g. "Magnesium Glycinate" stays, "Creatine 3–5g" stays)
    const bracketList = names.join(", ");
    const habit: Habit = {
      id: `${category}-stack-${Date.now()}`,
      name: `Take daily supplements (${bracketList})`,
      category,
      createdAt: new Date().toISOString(),
      notes: `Wellness stack: ${names.length} supplement${names.length === 1 ? "" : "s"}.`,
    };
    addHabit(habit);
    setStackSelected(new Set());
    setStackMode(false);
    onAdded();
    onClose();
  };

  const isAlreadyAdded = (name: string) =>
    existingHabits.some(h => h.name === name);

  const isJustAdded = (id: string) => justAdded.has(id);

  const handleInstantAdd = (name: string, id: string, extraData?: Partial<Habit>) => {
    if (isAlreadyAdded(name) || isJustAdded(id)) return;
    haptic("medium");
    const habit: Habit = {
      id: `${category}-${id}-${Date.now()}`,
      name,
      category,
      createdAt: new Date().toISOString(),
      ...extraData,
    };
    addHabit(habit);
    setJustAdded(prev => new Set(prev).add(id));
    onAdded();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    haptic("medium");
    const habit: Habit = {
      id: `${category}-custom-${Date.now()}`,
      name: customName.trim(),
      category,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setCustomName("");
    onAdded();
  };

  if (!open) return null;

  // Self Care uses the existing ritual data with grouped categories
  if (category === "self-care") {
    const filtered = SELF_CARE_RITUALS.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    );
    const grouped = RITUAL_CATEGORIES.map(cat => ({
      category: cat,
      rituals: filtered.filter(r => r.category === cat),
    })).filter(g => g.rituals.length > 0);

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[70] bg-foreground/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="bottom-sheet z-[71]"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          style={{ maxHeight: "85vh" }}
        >
          <div className="bottom-sheet-handle" />
          <div className="px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg italic font-bold text-foreground">Choose a ritual.</h2>
                <p className="font-hand text-sm text-bloom">Or add your own below.</p>
              </div>
              <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rituals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl bg-secondary pl-10 pr-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-bloom"
              />
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "55vh" }}>
            {grouped.map(group => (
              <div key={group.category} className="mt-4">
                <p className="font-hand text-xs font-bold text-muted-foreground mb-2">{group.category}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {group.rituals.map(ritual => {
                    const IconComponent = RITUAL_ICONS[ritual.icon] || SelfCareHandIcon;
                    const added = isAlreadyAdded(ritual.name) || isJustAdded(ritual.id);
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => handleInstantAdd(ritual.name, ritual.id, {
                          duration: ritual.suggestedDuration,
                          timing: ritual.timing,
                          notes: ritual.notesPlaceholder,
                        })}
                        disabled={added}
                        className={`touch-btn flex flex-col items-center gap-1 rounded-card p-2.5 text-center transition-all border-t-2 ${
                          added
                            ? "bg-bloom/10 border-bloom ring-1 ring-bloom/30 shadow-md opacity-70"
                            : "bg-card border-bloom/30 shadow-sm"
                        }`}
                        style={{ minHeight: 90 }}
                      >
                        <IconComponent size={28} color={added ? "#af92b6" : "#7f5b87"} />
                        <span className="font-body text-xs font-semibold text-foreground leading-tight line-clamp-2">
                          {ritual.name}
                        </span>
                        {added && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-hand text-[9px] text-bloom">
                            added
                          </motion.span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom input */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
                  placeholder="Add your own habit..."
                  className="flex-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleCustomAdd}
                  disabled={!customName.trim()}
                  className="touch-btn rounded-full px-4 py-2.5 font-hand text-sm font-bold text-primary-foreground bg-primary active:opacity-90 transition-opacity disabled:opacity-30 whitespace-nowrap"
                >
                  Add →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // All other categories: grouped by subcategory
  const libraryHabits = getLibraryHabitsForCategory(category);
  const filteredHabits = libraryHabits.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  const subcatLabels = SUBCATEGORY_LABELS_BY_CATEGORY[category] || {};
  const subcatKeys = Object.keys(subcatLabels);
  
  // Group by subcategory
  const grouped = subcatKeys
    .map(key => ({
      key,
      label: subcatLabels[key],
      habits: filteredHabits.filter(h => h.subcategory === key),
    }))
    .filter(g => g.habits.length > 0);
  
  // Uncategorized
  const uncategorized = filteredHabits.filter(h => !h.subcategory || !subcatKeys.includes(h.subcategory as string));
  if (uncategorized.length > 0) {
    grouped.push({ key: "other", label: "Other", habits: uncategorized });
  }

  const renderHabitCard = (habit: LibraryHabit) => {
    const IconComponent = HABIT_ICONS[habit.icon] || CapsuleIcon;
    const added = isAlreadyAdded(habit.name) || isJustAdded(habit.id);
    const hasInfo = !!(habit.nzBrands || habit.note || habit.description);
    const isPicked = stackSelected.has(habit.id);
    const inStackMode = stackMode && category === "supplements";

    return (
      <div key={habit.id} className="relative">
        <button
          onClick={() => {
            if (inStackMode) {
              toggleStackPick(habit.id);
              return;
            }
            handleInstantAdd(habit.name, habit.id, {
              duration: habit.frequency,
              notes: habit.description,
            });
          }}
          disabled={!inStackMode && added}
          className={`touch-btn w-full flex flex-col items-center gap-1 rounded-card p-2.5 text-center transition-all border-t-2 ${
            inStackMode
              ? isPicked
                ? "bg-primary/15 border-primary ring-2 ring-primary shadow-md"
                : "bg-card border-primary/30 shadow-sm"
              : added
                ? "bg-bloom/10 border-bloom ring-1 ring-bloom/30 shadow-md opacity-70"
                : "bg-card border-primary/30 shadow-sm"
          }`}
          style={{ minHeight: 90 }}
        >
          <IconComponent size={28} color={(inStackMode && isPicked) ? "#7f5b87" : added ? "#af92b6" : "#7f5b87"} />
          <span className="font-body text-xs font-semibold text-foreground leading-tight line-clamp-2">
            {habit.name}
          </span>
          {!inStackMode && habit.frequencyType && habit.frequencyType !== "daily" && (
            <span className={`font-hand text-[9px] px-1.5 py-0.5 rounded-full ${
              habit.frequencyType === "weekly" ? "bg-accent/20 text-accent-foreground/70" : "bg-secondary text-muted-foreground"
            }`}>
              {habit.frequencyType === "weekly" ? "Weekly" : "Monthly"}
            </span>
          )}
          {!inStackMode && added && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-hand text-[9px] text-bloom">
              added
            </motion.span>
          )}
        </button>

        {/* Stack-mode picked badge */}
        {inStackMode && isPicked && (
          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center z-10 shadow">
            <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
          </div>
        )}

        {/* Info bubble (hidden in stack mode to keep tap target clean) */}
        {!inStackMode && hasInfo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedInfo(expandedInfo === habit.id ? null : habit.id);
            }}
            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-secondary/80 flex items-center justify-center z-10"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] bg-foreground/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bottom-sheet z-[71]"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ maxHeight: "85vh" }}
      >
        <div className="bottom-sheet-handle" />
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg italic font-bold text-foreground">
                {CATEGORY_TITLES[category]} habits.
              </h2>
              <p className="font-hand text-sm text-bloom">
                {stackMode && category === "supplements"
                  ? "Pick everything in your stack."
                  : "Tap to add to your daily list."}
              </p>
            </div>
            <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Build your wellness stack toggle (supplements only) */}
          {category === "supplements" && (
            <button
              onClick={() => {
                haptic("light");
                setStackMode(m => !m);
                setStackSelected(new Set());
              }}
              className={`mt-3 w-full touch-btn rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 transition-all border ${
                stackMode
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-primary border-primary/40"
              }`}
            >
              {stackMode ? <X className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              <span className="font-body text-sm font-semibold">
                {stackMode ? "Cancel stack" : "Build your wellness stack"}
              </span>
              {!stackMode && <Sparkles className="h-3.5 w-3.5 opacity-70" />}
            </button>
          )}

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${CATEGORY_TITLES[category].toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-secondary pl-10 pr-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-bloom"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "55vh" }}>
          {/* Supplement disclaimer */}
          {category === "supplements" && (
            <p className="font-display text-xs italic text-muted-foreground/70 mt-2 mb-1 px-1">
              {SUPPLEMENT_DISCLAIMER}
            </p>
          )}

          {/* Grouped by subcategory */}
          {grouped.map(group => (
            <div key={group.key} className="mt-4">
              <p className="font-hand text-xs font-bold text-primary/80 mb-2 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {group.habits.map(renderHabitCard)}
              </div>
            </div>
          ))}

          {/* Expanded info overlay */}
          <AnimatePresence>
            {expandedInfo && (() => {
              const habit = libraryHabits.find(h => h.id === expandedInfo);
              if (!habit) return null;
              return (
                <motion.div
                  key={expandedInfo}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="rounded-xl bg-secondary/60 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold text-foreground">{habit.name}</p>
                      <button onClick={() => setExpandedInfo(null)} className="touch-btn p-2">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Description with book reference */}
                    <p className="font-display text-[11px] italic text-foreground/70">
                      {habit.description}
                    </p>

                    {habit.note && (
                      <p className="font-display text-[11px] italic text-muted-foreground">{habit.note}</p>
                    )}
                    
                    {/* NZ Brands with link */}
                    {habit.nzBrands && (
                      <div>
                        <p className="font-hand text-[10px] font-bold text-primary mb-0.5">NZ brands</p>
                        {habit.nzBrandUrl ? (
                          <a
                            href={habit.nzBrandUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-[11px] text-primary underline leading-relaxed inline-flex items-center gap-1"
                          >
                            {habit.nzBrands}
                            <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{habit.nzBrands}</p>
                        )}
                      </div>
                    )}

                    {habit.evidenceNote && (
                      <p className="font-display text-[10px] italic text-muted-foreground/60">{habit.evidenceNote}</p>
                    )}

                    {habit.sourceBook && (
                      <p className="font-display text-[9px] text-muted-foreground/50">
                        Source: {habit.sourceBook} — {habit.sourceAuthor}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Custom input — hidden in stack mode */}
          {!(stackMode && category === "supplements") && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCustomAdd()}
                  placeholder="Add your own habit..."
                  className="flex-1 rounded-xl bg-secondary px-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleCustomAdd}
                  disabled={!customName.trim()}
                  className="touch-btn rounded-full px-4 py-2.5 font-hand text-sm font-bold text-primary-foreground bg-primary active:opacity-90 transition-opacity disabled:opacity-30 whitespace-nowrap"
                >
                  Add →
                </button>
              </div>
            </div>
          )}

          {/* Stack mode bottom spacer so save bar doesn't overlap content */}
          {stackMode && category === "supplements" && <div className="h-24" />}
        </div>

        {/* Sticky Save Stack bar */}
        {stackMode && category === "supplements" && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-5 bg-card border-t border-border"
            style={{ boxShadow: "0 -8px 24px -12px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-muted-foreground">
                {stackSelected.size} selected
              </p>
              {stackSelected.size > 0 && (
                <button
                  onClick={() => { haptic("light"); setStackSelected(new Set()); }}
                  className="font-hand text-xs text-muted-foreground underline"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={handleSaveStack}
              disabled={stackSelected.size === 0}
              className="touch-btn w-full rounded-xl py-3 font-body text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-30 active:opacity-90 flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              {stackSelected.size === 0
                ? "Pick supplements to bundle"
                : `Add stack of ${stackSelected.size} as one habit`}
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
