import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sprout, Utensils, Flower2, ChefHat } from "lucide-react";
import { getSeedsTaken } from "@/lib/cycle-utils";
import { usePlantTracker } from "@/hooks/usePlantTracker";

interface Props {
  phaseColor: string;
}

const SLOTS = ["breakfast", "lunch", "dinner"] as const;

function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export default function WeeklyNourishmentSummary({ phaseColor }: Props) {
  const { count: plantCount } = usePlantTracker();
  const { mealsLogged, seedDays, possibleMeals, daysPrepped, sparkline } = useMemo(() => {
    const dates = last7Dates();
    let meals = 0;
    let seeds = 0;
    let prepped = 0;
    const spark: number[] = [];
    dates.forEach((d) => {
      let mealsToday = 0;
      SLOTS.forEach((s) => {
        if (typeof window !== "undefined" && localStorage.getItem(`eaten:${d}:${s}`) === "true") {
          meals++;
          mealsToday++;
        }
      });
      spark.push(mealsToday);
      if (mealsToday >= 3) prepped++;
      if (getSeedsTaken(d)) seeds++;
    });
    return {
      mealsLogged: meals,
      seedDays: seeds,
      possibleMeals: dates.length * SLOTS.length,
      daysPrepped: prepped,
      sparkline: spark,
    };
  }, []);

  const mealPct = Math.round((mealsLogged / possibleMeals) * 100);
  const maxSpark = Math.max(3, ...sparkline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[18px] bg-card shadow-soft p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-card-title font-bold text-foreground">This week, nourished</h3>
        <span className="font-body text-[10px] text-muted-foreground">Last 7 days</span>
      </div>

      {/* Sparkline of meals/day */}
      <div className="flex items-end gap-1 h-8 mb-3 px-1">
        {sparkline.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(8, (v / maxSpark) * 100)}%`,
              backgroundColor: v > 0 ? phaseColor : `${phaseColor}25`,
              opacity: v > 0 ? 0.5 + (v / maxSpark) * 0.5 : 0.3,
            }}
            title={`${v} of 3 meals`}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <Stat icon={Utensils} value={`${mealsLogged}`} label="meals" sub={`${mealPct}%`} color={phaseColor} />
        <Stat icon={ChefHat} value={`${daysPrepped}`} label="days prepped" sub="of 7" color={phaseColor} />
        <Stat icon={Sprout} value={`${plantCount}`} label="plants" sub="variety" color={phaseColor} />
        <Stat icon={Flower2} value={`${seedDays}`} label="seeds" sub="of 7" color={phaseColor} />
      </div>
    </motion.div>
  );
}

function Stat({
  icon: Icon, value, label, sub, color,
}: { icon: any; value: string; label: string; sub: string; color: string }) {
  return (
    <div className="rounded-[14px] bg-secondary/40 p-2 text-center">
      <Icon className="h-3.5 w-3.5 mx-auto mb-0.5" style={{ color }} />
      <p className="font-display text-base font-bold text-foreground leading-none">{value}</p>
      <p className="font-body text-[9px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
      <p className="font-body text-[9px] mt-0.5" style={{ color }}>{sub}</p>
    </div>
  );
}
