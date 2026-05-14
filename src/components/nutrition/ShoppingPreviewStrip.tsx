import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBasket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getShoppingList, mergeShoppingItems } from "@/lib/ingredient-parser";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  phaseColor: string;
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function ShoppingPreviewStrip({ phaseColor }: Props) {
  const { mealPrepDay } = useProfile();
  const { items, total, unchecked } = useMemo(() => {
    const list = getShoppingList();
    const merged = mergeShoppingItems(list);
    const open = merged.filter((m) => !m.checked);
    return { items: open.slice(0, 4), total: merged.length, unchecked: open.length };
  }, []);

  const todayName = DAY_NAMES[new Date().getDay()];
  const isPrepDay = !!mealPrepDay && mealPrepDay.toLowerCase() === todayName;

  if (total === 0) {
    if (!isPrepDay) return null; // hide empty basket on non-prep days to reduce noise
    return (
      <Link
        to="/nutrition?tab=shop"
        className="block rounded-[18px] bg-card shadow-soft p-4 hover:shadow-medium transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${phaseColor}15` }}>
            <ShoppingBasket className="h-5 w-5" style={{ color: phaseColor }} />
          </div>
          <div className="flex-1">
            <p className="font-display text-card-title font-bold text-foreground leading-snug">Prep day — basket is quiet</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Add a recipe and the week's list will gather itself here.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  // On non-prep days with items: show a subtle peek; on prep day: spotlight
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-[18px] bg-card shadow-soft p-4"
      style={isPrepDay ? { borderLeft: `3px solid ${phaseColor}` } : {}}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-4 w-4" style={{ color: phaseColor }} />
          <h3 className="font-display text-card-title font-bold text-foreground">
            {isPrepDay ? "Today is your prep day" : "Your basket"}
          </h3>
        </div>
        <span className="font-body text-[10px] text-muted-foreground">
          {unchecked} to gather
        </span>
      </div>

      {isPrepDay && (
        <p className="font-body text-xs text-muted-foreground mb-3 italic">
          A gentle hour of gathering, and the week is held.
        </p>
      )}

      <ul className="space-y-1.5 mb-3">
        {items.map((m, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: phaseColor }} />
            <span className="font-body text-sm text-foreground/90 truncate flex-1">
              {m.totalQuantity ? `${m.totalQuantity}${m.unit ? " " + m.unit : ""} · ` : ""}{m.name}
            </span>
          </li>
        ))}
        {total > items.length && (
          <li className="font-body text-[11px] text-muted-foreground italic pl-3.5">
            +{total - items.length} more…
          </li>
        )}
      </ul>

      <Link
        to="/nutrition?tab=shop"
        className="touch-btn w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 min-h-[44px] font-body text-xs font-semibold transition-all"
        style={{ backgroundColor: isPrepDay ? phaseColor : `${phaseColor}12`, color: isPrepDay ? "#fff" : phaseColor }}
      >
        {isPrepDay ? "Start shopping" : "Open shopping list"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}
