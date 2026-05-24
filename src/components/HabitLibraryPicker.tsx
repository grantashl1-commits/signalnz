import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, HelpCircle, Search, Plus, ExternalLink, Sparkles, Sun, Moon } from "lucide-react";
import { getLibraryHabitsForCategory, SUPPLEMENT_DISCLAIMER, SUBCATEGORY_LABELS_BY_CATEGORY, type LibraryHabit } from "@/data/habit-library";
import { HABIT_ICONS, CapsuleIcon } from "@/components/HabitIcons";
import { RITUAL_ICONS, SelfCareHandIcon } from "@/components/SelfCareIcons";
import { SELF_CARE_RITUALS, RITUAL_CATEGORIES, addHabit, getHabits, type Habit, type HabitCategory } from "@/data/self-care-rituals";
import { RITUAL20_ITEMS, RITUAL20_GROUPS, type Ritual20Group } from "@/data/ritual20";
import { haptic } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface HabitLibraryPickerProps {
  open: boolean;
  category: HabitCategory;
  onClose: () => void;
  onAdded: () => void;
  currentPhase?: "menstrual" | "follicular" | "ovulatory" | "luteal";
}

const CATEGORY_TITLES: Record<HabitCategory, string> = {
  supplements: "Supplements",
  "self-care": "Self Care",
  nutrition: "Nutrition",
  movement: "Movement",
  ritual20: "RITUAL20",
};

export default function HabitLibraryPicker({ open, category, onClose, onAdded, currentPhase }: HabitLibraryPickerProps) {
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const existingHabits = getHabits();

  const wellnessStackIds: string[] = category === "supplements" ? (() => {
    try {
      const stored = localStorage.getItem("signal_wellness_stack");
      return stored ? JSON.parse(stored) as string[] : [];
    } catch { return []; }
  })() : [];

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

  // RITUAL20 — curated BYRÉ morning + evening ritual challenge
  if (category === "ritual20") {
    const filtered = RITUAL20_ITEMS.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    const grouped = RITUAL20_GROUPS.map(g => ({
      ...g,
      items: filtered.filter(r => r.group === g.key),
    })).filter(g => g.items.length > 0);

    const handleAddAll = (groupKey: Ritual20Group) => {
      const items = RITUAL20_ITEMS.filter(r => r.group === groupKey);
      haptic("medium");
      items.forEach(item => {
        if (isAlreadyAdded(item.name) || isJustAdded(item.id)) return;
        const habit: Habit = {
          id: `ritual20-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name,
          category: "ritual20",
          duration: item.duration,
          timing: item.timing,
          notes: item.notes,
          createdAt: new Date().toISOString(),
        };
        addHabit(habit);
        setJustAdded(prev => new Set(prev).add(item.id));
      });
      onAdded();
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
          style={{ maxHeight: "88vh" }}
        >
          <div className="bottom-sheet-handle" />
          <div className="px-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-bloom mb-1">20-day challenge</p>
                <h2 className="font-display text-lg italic font-bold text-foreground">RITUAL20.</h2>
                <p className="font-hand text-sm text-bloom">The woman you want to become has rituals.</p>
              </div>
              <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search RITUAL20..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl bg-secondary pl-10 pr-4 py-2.5 font-body text-[16px] text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-bloom"
              />
            </div>
          </div>

          <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "62vh" }}>
            {grouped.map(group => {
              const isMorning = group.key.startsWith("morning");
              const GroupIcon = isMorning ? Sun : Moon;
              return (
                <div key={group.key} className="mt-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <GroupIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: isMorning ? "#c4845a" : "#7f5b87" }} strokeWidth={1.5} />
                      <div className="min-w-0">
                        <p className="font-hand text-[12px] font-bold text-foreground uppercase tracking-wider leading-tight">{group.label}</p>
                        <p className="font-display text-[11px] italic text-muted-foreground leading-snug mt-0.5">{group.tagline}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddAll(group.key)}
                      className="touch-btn flex-shrink-0 rounded-full px-3 py-1 font-hand text-[11px] font-bold text-bloom bg-bloom/10 border border-bloom/30 active:bg-bloom/20"
                    >
                      + Add all
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map(item => {
                      const added = isAlreadyAdded(item.name) || isJustAdded(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleInstantAdd(item.name, item.id, {
                            duration: item.duration,
                            timing: item.timing,
                            notes: item.notes,
                          })}
                          disabled={added}
                          className={`touch-btn w-full text-left rounded-card px-3.5 py-3 flex items-center gap-3 border transition-all ${
                            added
                              ? "bg-bloom/10 border-bloom/40 opacity-70"
                              : "bg-card border-border hover:border-bloom/40 shadow-sm"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-semibold text-foreground leading-snug">
                              {item.name}
                            </p>
                            <p className="font-body text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                              {item.notes}
                            </p>
                            <p className="font-hand text-[10px] text-bloom mt-1">{item.duration} • {item.timing}</p>
                          </div>
                          <span className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                            added ? "bg-bloom text-card" : "bg-bloom/15 text-bloom"
                          }`}>
                            {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // All other categories: grouped by subcategory
  const libraryHabits = getLibraryHabitsForCategory(category);
  const wellnessStackHabits = libraryHabits.filter(h => wellnessStackIds.includes(h.id));
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

    return (
      <div key={habit.id} className="relative">
        <button
          onClick={() => handleInstantAdd(habit.name, habit.id, {
            duration: habit.frequency,
            notes: habit.rdi ? `${habit.rdi.amount} — ${habit.rdi.timing}` : habit.description,
          })}
          disabled={added}
          className={`touch-btn w-full flex flex-col items-center gap-1 rounded-card p-2.5 text-center transition-all border-t-2 ${
            added
              ? "bg-bloom/10 border-bloom ring-1 ring-bloom/30 shadow-md opacity-70"
              : "bg-card border-primary/30 shadow-sm"
          }`}
          style={{ minHeight: 90 }}
        >
          <IconComponent size={28} color={added ? "#af92b6" : "#7f5b87"} />
          <span className="font-body text-xs font-semibold text-foreground leading-tight line-clamp-2">
            {habit.name}
          </span>
          {habit.frequencyType && habit.frequencyType !== "daily" && (
            <span className={`font-hand text-[9px] px-1.5 py-0.5 rounded-full ${
              habit.frequencyType === "weekly" ? "bg-accent/20 text-accent-foreground/70" : "bg-secondary text-muted-foreground"
            }`}>
              {habit.frequencyType === "weekly" ? "Weekly" : "Monthly"}
            </span>
          )}
          {added && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-hand text-[9px] text-bloom">
              added
            </motion.span>
          )}
        </button>

        {/* Info bubble */}
        {hasInfo && (
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
              <p className="font-hand text-sm text-bloom">Tap to add to your daily list.</p>
            </div>
            <button onClick={onClose} className="touch-btn p-2 rounded-full bg-secondary">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
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

          {/* Recommended for your phase — top 3 from library tagged for current phase */}
          {currentPhase && (() => {
            const phaseHabits = libraryHabits
              .filter(h => h.rdi?.phaseNotes?.[currentPhase])
              .slice(0, 3);
            if (phaseHabits.length === 0) return null;
            return (
              <div className="mt-3">
                <p className="font-hand text-xs font-bold text-bloom mb-2 uppercase tracking-wider">
                  Recommended for your {currentPhase} phase
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {phaseHabits.map(renderHabitCard)}
                </div>
              </div>
            );
          })()}

          {/* Your wellness stack — quick-add items built in /nutrition */}
          {category === "supplements" && wellnessStackHabits.length > 0 && (
            <div className="mt-3">
              <p className="font-hand text-xs font-bold text-primary/80 mb-2 uppercase tracking-wider">Your wellness stack</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {wellnessStackHabits.map(renderHabitCard)}
              </div>
            </div>
          )}

          {/* CTA to build/update wellness stack */}
          {category === "supplements" && (
            <button
              onClick={() => { onClose(); navigate("/nutrition?tab=supplements"); }}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-[14px] py-2.5 min-h-[44px] font-body text-xs font-medium bg-primary/8 text-primary active:bg-primary/15 transition-all border border-primary/20"
            >
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
              {wellnessStackHabits.length > 0 ? "Update your personalised stack" : "Build your personalised stack"}
            </button>
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

                    {habit.rdi && (
                      <div className="rounded-[10px] bg-primary/8 px-3 py-2">
                        <p className="font-hand text-[10px] font-bold text-primary mb-0.5">Recommended dose</p>
                        <p className="font-body text-[11px] text-foreground font-medium">{habit.rdi.amount} {habit.rdi.unit}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{habit.rdi.timing}</p>
                      </div>
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
