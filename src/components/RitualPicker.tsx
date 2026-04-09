import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sun, Snowflake, Hand, Bath, Sparkles, Heart, Gem } from "lucide-react";
import { SELF_CARE_RITUALS, RITUAL_CATEGORIES, addHabit, type Habit } from "@/data/self-care-rituals";
import { RITUAL_ICONS, SelfCareHandIcon } from "@/components/SelfCareIcons";
import { haptic } from "@/hooks/use-mobile";

const CATEGORY_ICONS: Record<string, typeof Sun> = {
  "Light & Energy Therapy": Sun,
  "Cold Therapy": Snowflake,
  "Bodywork & Recovery": Hand,
  "Bathing & Soaking": Bath,
  "Facial & Skin": Sparkles,
  "Mindful Movement & Restoration": Heart,
  "Wellness Experiences": Gem,
};

interface RitualPickerProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function RitualPicker({ open, onClose, onAdded }: RitualPickerProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = SELF_CARE_RITUALS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = RITUAL_CATEGORIES.map(cat => ({
    category: cat,
    rituals: filtered.filter(r => r.category === cat),
  })).filter(g => g.rituals.length > 0);

  const toggleSelect = (id: string) => {
    haptic("light");
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    haptic("medium");
    selected.forEach(id => {
      const ritual = SELF_CARE_RITUALS.find(r => r.id === id);
      if (ritual) {
        const habit: Habit = {
          id: `selfcare-${ritual.id}-${Date.now()}`,
          name: ritual.name,
          category: "self-care",
          duration: ritual.suggestedDuration,
          timing: ritual.timing,
          notes: ritual.notesPlaceholder,
          createdAt: new Date().toISOString(),
        };
        addHabit(habit);
      }
    });
    setSelected(new Set());
    onAdded();
    onClose();
  };

  const handleCustom = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] bg-foreground/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bottom-sheet z-[71]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
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

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rituals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-secondary pl-10 pr-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-bloom"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "55vh" }}>
          {grouped.map(group => {
            const CatIcon = CATEGORY_ICONS[group.category] || Sparkles;
            return (
              <div key={group.category} className="mt-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <CatIcon className="h-4 w-4 text-primary/50" strokeWidth={1.5} />
                  <p className="font-hand text-[13px] font-bold text-muted-foreground">{group.category}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {group.rituals.map(ritual => {
                    const IconComponent = RITUAL_ICONS[ritual.icon] || SelfCareHandIcon;
                    const isSelected = selected.has(ritual.id);
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => toggleSelect(ritual.id)}
                        className={`touch-btn flex flex-col items-center justify-center gap-1.5 rounded-card p-2.5 text-center transition-all h-[96px] ${
                          isSelected
                            ? "bg-primary/15 border border-primary/40 shadow-md"
                            : "bg-card border border-transparent border-t-2 border-t-bloom/30 shadow-sm"
                        }`}
                      >
                        <IconComponent size={28} color={isSelected ? "hsl(var(--primary))" : "#8B6F5E"} />
                        <span className="font-hand text-[13px] font-bold text-foreground leading-tight line-clamp-2">
                          {ritual.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Custom option */}
          <div className="mt-4">
            <button
              onClick={handleCustom}
              className="touch-btn w-full flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-muted-foreground/30 p-4 text-center"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="font-hand text-sm text-muted-foreground">Something else...</span>
            </button>
          </div>
        </div>

        {/* Add selected */}
        {selected.size > 0 && (
          <div className="sticky bottom-0 px-5 py-4 bg-card border-t border-border pb-safe">
            <button
              onClick={handleAdd}
              className="touch-btn w-full rounded-card py-3 min-h-[52px] font-body text-sm font-bold text-card bg-bloom active:opacity-90 transition-opacity"
            >
              Add {selected.size} ritual{selected.size > 1 ? "s" : ""} →
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
