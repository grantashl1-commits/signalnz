import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

const TIER_TOTAL: Record<string, number> = {
  free: 5,
  rooted: 20,
  nourished: 50,
  thriving: 200,
};

export default function CreditsFillBar() {
  const { creditsRemaining, tier, loading } = useAICredits();
  if (loading) return null;
  const total = TIER_TOTAL[tier] ?? Math.max(creditsRemaining, 5);
  const used = Math.max(0, total - creditsRemaining);
  const remainPct = Math.max(0, Math.min(100, (creditsRemaining / total) * 100));

  const tone =
    remainPct > 50 ? "Plenty of room to wonder this month."
    : remainPct > 20 ? "A little left — use it on what matters."
    : remainPct > 0 ? "Almost out — save these for something tender."
    : "Rested for now. Top up when you're ready.";

  return (
    <div className="card-warm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-display text-sm italic text-foreground">{creditsRemaining} of {total} asks left</span>
        </div>
        <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{tier}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${remainPct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
        />
      </div>
      <p className="font-body text-[10px] text-muted-foreground italic">{tone}</p>
    </div>
  );
}
