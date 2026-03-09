import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus } from "lucide-react";
import { SELF_CARE_RITUALS, RITUAL_CATEGORIES, addHabit, type Habit } from "@/data/self-care-rituals";
import { RITUAL_ICONS, SelfCareHandIcon } from "@/components/SelfCareIcons";
import { haptic } from "@/hooks/use-mobile";

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
    // Parent handles opening the custom form with self-care pre-selected
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
          {grouped.map(group => (
            <div key={group.category} className="mt-4">
              <p className="font-hand text-xs font-bold text-muted-foreground mb-2">{group.category}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {group.rituals.map(ritual => {
                  const IconComponent = RITUAL_ICONS[ritual.icon] || SelfCareHandIcon;
                  const isSelected = selected.has(ritual.id);
                  return (
                    <button
                      key={ritual.id}
                      onClick={() => toggleSelect(ritual.id)}
                      className={`touch-btn flex flex-col items-center gap-1 rounded-[14px] p-2.5 text-center transition-all border-t-2 ${
                        isSelected
                          ? "bg-bloom/10 border-bloom ring-1 ring-bloom/30 shadow-md"
                          : "bg-card border-bloom/30 shadow-sm"
                      }`}
                      style={{ minHeight: 90 }}
                    >
                      <IconComponent size={28} color={isSelected ? "#F2A7C3" : "#8B6F5E"} />
                      <span className="font-hand text-[11px] font-bold text-foreground leading-tight line-clamp-2">
                        {ritual.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom option */}
          <div className="mt-4">
            <button
              onClick={handleCustom}
              className="touch-btn w-full flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-muted-foreground/30 p-4 text-center"
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
              className="touch-btn w-full rounded-[14px] py-3 min-h-[52px] font-body text-sm font-bold text-card bg-bloom active:opacity-90 transition-opacity"
            >
              Add {selected.size} ritual{selected.size > 1 ? "s" : ""} →
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
