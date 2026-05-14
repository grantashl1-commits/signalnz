import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Sliders } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { haptic } from "@/hooks/use-mobile";
import {
  COMMON_THEMES,
  loadThemeWeights,
  setThemeWeight,
  type ThemeWeights,
} from "@/lib/feed-theme-weights";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Extra themes detected from current posts (added to the common list). */
  extraThemes?: string[];
  onChange?: (weights: ThemeWeights) => void;
}

function formatTheme(t: string) {
  return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TuneFeedSheet({ isOpen, onClose, extraThemes = [], onChange }: Props) {
  const [weights, setWeights] = useState<ThemeWeights>({});

  useEffect(() => {
    if (isOpen) setWeights(loadThemeWeights());
  }, [isOpen]);

  const themes = Array.from(new Set([...COMMON_THEMES, ...extraThemes])).sort();

  const cycle = (theme: string) => {
    haptic("light");
    const cur = weights[theme] || 0;
    const next = cur === 1 ? -1 : cur === -1 ? 0 : 1; // up → down → off → up
    const updated = setThemeWeight(theme, next as any);
    setWeights({ ...updated });
    onChange?.(updated);
  };

  const upCount = Object.values(weights).filter((v) => v === 1).length;
  const downCount = Object.values(weights).filter((v) => v === -1).length;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="px-5 pb-4 pt-1 max-h-[78vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="h-4 w-4 text-primary" />
          <p className="font-display italic text-lg text-foreground">Tune your feed</p>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4 leading-relaxed">
          Tap a theme to ask for more, again for less, again to go quiet. Your wishes are
          held — tomorrow's feed will lean toward what you love.
        </p>

        <div className="flex items-center gap-3 mb-4 text-[11px] font-body text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3 text-primary" /> {upCount} more
          </span>
          <span className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3 text-foreground/40" /> {downCount} less
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {themes.map((t) => {
            const w = weights[t] || 0;
            const base = "min-h-[40px] px-3.5 py-2 rounded-full font-body text-xs flex items-center gap-1.5 border transition-all";
            const cls =
              w === 1
                ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                : w === -1
                ? "bg-muted/40 border-border/40 text-muted-foreground/60 line-through"
                : "bg-card border-border/40 text-foreground/70 hover:border-foreground/20";
            return (
              <button key={t} onClick={() => cycle(t)} className={`${base} ${cls}`}>
                {w === 1 && <ArrowUp className="h-3 w-3" />}
                {w === -1 && <ArrowDown className="h-3 w-3" />}
                {w === 0 && <Minus className="h-3 w-3 opacity-30" />}
                {formatTheme(t)}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full min-h-[44px] rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold"
        >
          Held
        </button>
      </div>
    </BottomSheet>
  );
}
