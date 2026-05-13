/**
 * Brings the Today-tab "this week, nourished" feel into My Week, but bounded
 * to the *visible* week (so when the user scrolls back/forward, the numbers
 * follow). Also surfaces the held / your-picks counts so the planner state
 * is visible at a glance.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Utensils, Sprout, Flower2, Bookmark, ShoppingBasket, ClipboardList } from "lucide-react";
import { getSeedsTaken } from "@/lib/cycle-utils";
import { usePlantTracker } from "@/hooks/usePlantTracker";

interface DayLite {
  dateStr: string;
  cycleDay: number;
  isToday: boolean;
}

interface Props {
  days: DayLite[];
  phaseColor: string;
  /** Number of locked meals across the *full* plan (not just this week). */
  heldCount?: number;
  /** Custom-pick count for this week's cycle days. */
  pickedCount?: number;
  onOpenShopping: () => void;
  onOpenPrepGuide?: () => void;
}

const SLOTS = ["breakfast", "lunch", "dinner"] as const;

export default function WeekAtAGlance({
  days, phaseColor, heldCount = 0, pickedCount = 0, onOpenShopping, onOpenPrepGuide,
}: Props) {
  const { count: plantCount } = usePlantTracker();

  const { mealsLogged, possible, seedDays, daysReturned } = useMemo(() => {
    let meals = 0, seeds = 0, returned = 0;
    days.forEach((d) => {
      let dayHadAny = false;
      SLOTS.forEach((s) => {
        if (typeof window !== "undefined" && localStorage.getItem(`eaten:${d.dateStr}:${s}`) === "true") {
          meals++;
          dayHadAny = true;
        }
      });
      if (getSeedsTaken(d.dateStr)) { seeds++; dayHadAny = true; }
      if (dayHadAny) returned++;
    });
    return { mealsLogged: meals, possible: days.length * SLOTS.length, seedDays: seeds, daysReturned: returned };
  }, [days]);

  const mealPct = possible ? Math.round((mealsLogged / possible) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-[18px] bg-card shadow-soft p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-card-title font-bold text-foreground">This week, at a glance</h3>
        <span className="font-body text-[10px] text-muted-foreground">
          {daysReturned} {daysReturned === 1 ? "day" : "days"} you returned
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Utensils} value={`${mealsLogged}`} label={`of ${possible} meals`} sub={`${mealPct}%`} color={phaseColor} />
        <Stat icon={Sprout} value={`${plantCount}`} label="plants this week" sub="variety" color={phaseColor} />
        <Stat icon={Flower2} value={`${seedDays}`} label="seed-cycling days" sub={`of ${days.length}`} color={phaseColor} />
      </div>

      {(heldCount > 0 || pickedCount > 0) && (
        <div className="flex items-center justify-center gap-3 pt-1">
          {heldCount > 0 && (
            <span className="flex items-center gap-1 font-body text-[11px] text-muted-foreground">
              <Bookmark className="h-3 w-3" style={{ color: phaseColor }} />
              {heldCount} held
            </span>
          )}
          {pickedCount > 0 && (
            <span className="flex items-center gap-1 font-body text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: phaseColor }} />
              {pickedCount} your pick{pickedCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onOpenShopping}
          className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 min-h-[44px] font-body text-xs font-medium text-foreground bg-secondary/60 active:bg-secondary"
        >
          <ShoppingBasket className="h-3.5 w-3.5" style={{ color: phaseColor }} />
          Shopping list
        </button>
        {onOpenPrepGuide && (
          <button
            onClick={onOpenPrepGuide}
            className="touch-btn flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 min-h-[44px] font-body text-xs font-medium text-foreground bg-secondary/60 active:bg-secondary"
          >
            <ClipboardList className="h-3.5 w-3.5" style={{ color: phaseColor }} />
            Prep guide
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon, value, label, sub, color,
}: { icon: any; value: string; label: string; sub: string; color: string }) {
  return (
    <div className="rounded-[14px] bg-secondary/40 p-3 text-center">
      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
      <p className="font-display text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="font-body text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
      <p className="font-body text-[9px] mt-0.5" style={{ color }}>{sub}</p>
    </div>
  );
}
