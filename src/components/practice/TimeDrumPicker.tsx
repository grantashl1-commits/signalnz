import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

const ITEM_H = 44;
const VISIBLE = 5;
const CENTER = Math.floor(VISIBLE / 2);

interface Props {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
  open: boolean;
  onClose: () => void;
  label: string;
  accentColor: string;
}

function DrumColumn({
  items,
  selected,
  onSelect,
  accentColor,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  const selectedIdx = items.indexOf(selected);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = selectedIdx * ITEM_H;
    }
  }, [selectedIdx]);

  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      onSelect(items[clamped]);
    }, 80);
  }, [items, onSelect]);

  return (
    <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
      {/* Center highlight */}
      <div
        className="absolute left-0 right-0 rounded-xl pointer-events-none z-10"
        style={{
          top: CENTER * ITEM_H,
          height: ITEM_H,
          background: `${accentColor}18`,
          border: `1.5px solid ${accentColor}40`,
        }}
      />
      {/* Fade edges */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent z-20 pointer-events-none" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-none snap-y snap-mandatory"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: CENTER * ITEM_H,
          paddingBottom: CENTER * ITEM_H,
        }}
      >
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <div
              key={item}
              className="flex items-center justify-center snap-center cursor-pointer"
              style={{ height: ITEM_H }}
              onClick={() => {
                onSelect(item);
                if (ref.current) {
                  const idx = items.indexOf(item);
                  ref.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
                }
              }}
            >
              <span
                className={`font-display text-2xl transition-all duration-200 ${
                  isSelected
                    ? "font-bold scale-110"
                    : "font-medium text-muted-foreground/50 scale-90"
                }`}
                style={isSelected ? { color: accentColor } : undefined}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeDrumPicker({ value, onChange, open, onClose, label, accentColor }: Props) {
  const [h, m] = value.split(":");
  const [hour, setHour] = useState(h || "22");
  const [minute, setMinute] = useState(m || "00");

  // Snap minute to nearest 5
  useEffect(() => {
    const roundedM = (Math.round(parseInt(m || "0") / 5) * 5).toString().padStart(2, "0");
    setHour(h || "22");
    setMinute(roundedM === "60" ? "00" : roundedM);
  }, [value, h, m]);

  const confirm = () => {
    onChange(`${hour}:${minute}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[71] bg-card rounded-t-[24px] shadow-xl pb-safe"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3">
              <button onClick={onClose} className="p-2 rounded-full bg-secondary">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="font-display text-base font-bold text-foreground">{label}</span>
              <button onClick={confirm} className="p-2 rounded-full" style={{ backgroundColor: `${accentColor}20` }}>
                <Check className="h-4 w-4" style={{ color: accentColor }} />
              </button>
            </div>

            {/* Drums */}
            <div className="flex items-center justify-center gap-0 px-8 pb-6">
              <div className="flex-1 max-w-[100px]">
                <DrumColumn items={HOURS} selected={hour} onSelect={setHour} accentColor={accentColor} />
              </div>
              <span className="font-display text-3xl font-bold text-foreground px-2 z-30">:</span>
              <div className="flex-1 max-w-[100px]">
                <DrumColumn items={MINUTES} selected={minute} onSelect={setMinute} accentColor={accentColor} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
