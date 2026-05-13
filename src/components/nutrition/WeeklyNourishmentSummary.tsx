import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sprout, Utensils, Flower2 } from "lucide-react";
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
  const { mealsLogged, seedDays, possibleMeals } = useMemo(() => {
    const dates = last7Dates();
    let meals = 0;
    let seeds = 0;
    dates.forEach((d) => {
      SLOTS.forEach((s) => {
        if (typeof window !== "undefined" && localStorage.getItem(`eaten:${d}:${s}`) === "true") meals++;
      });
      if (getSeedsTaken(d)) seeds++;
    });
    return { mealsLogged: meals, seedDays: seeds, possibleMeals: dates.length * SLOTS.length };
  }, []);

  const mealPct = Math.round((mealsLogged / possibleMeals) * 100);

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
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Utensils} value={`${mealsLogged}`} label={`of ${possibleMeals} meals`} sub={`${mealPct}%`} color={phaseColor} />
        <Stat icon={Sprout} value={`${plantCount}`} label="plants this week" sub="variety" color={phaseColor} />
        <Stat icon={Flower2} value={`${seedDays}`} label="seed-cycling days" sub="of 7" color={phaseColor} />
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
