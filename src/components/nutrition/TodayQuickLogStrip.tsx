/**
 * Three-pill quick-log row that lets you mark today's meals eaten without
 * leaving the My Week tab. Mirrors the eaten:* localStorage keys used by
 * TodayTab so the two tabs stay in sync.
 */
import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Props {
  dateStr: string;
  phaseColor: string;
}

const SLOTS: { key: string; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

function readEaten(dateStr: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (typeof window === "undefined") return out;
  SLOTS.forEach(({ key }) => {
    out[key] = localStorage.getItem(`eaten:${dateStr}:${key}`) === "true";
  });
  return out;
}

export default function TodayQuickLogStrip({ dateStr, phaseColor }: Props) {
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => readEaten(dateStr));

  const toggle = useCallback((slot: string) => {
    haptic("light");
    setEaten((prev) => {
      const next = { ...prev, [slot]: !prev[slot] };
      try {
        if (next[slot]) {
          localStorage.setItem(`eaten:${dateStr}:${slot}`, "true");
          toast.success("Held.");
        } else {
          localStorage.removeItem(`eaten:${dateStr}:${slot}`);
        }
      } catch { /* silent */ }
      return next;
    });
  }, [dateStr]);

  return (
    <div className="flex gap-1.5 mt-3">
      {SLOTS.map(({ key, label }) => {
        const active = eaten[key];
        return (
          <button
            key={key}
            onClick={(e) => { e.stopPropagation(); toggle(key); }}
            className="touch-btn flex-1 flex items-center justify-center gap-1 rounded-full px-2 py-1.5 min-h-[36px] font-body text-[11px] font-medium transition-all"
            style={active
              ? { backgroundColor: phaseColor, color: "white" }
              : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
          >
            {active && <Check className="h-3 w-3" />}
            {label.slice(0, 1)}
          </button>
        );
      })}
    </div>
  );
}
