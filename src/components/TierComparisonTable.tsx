import { motion } from "framer-motion";
import { Check, X, Lock, Eye, PenOff } from "lucide-react";
import { useFeatureGate, FEATURE_ACCESS, type FeatureTier, type FeatureAccess } from "@/hooks/useFeatureGate";

const TIER_COLS: { key: FeatureTier; label: string }[] = [
  { key: "free", label: "Free" },
  { key: "rooted", label: "Rooted" },
  { key: "nourished", label: "Nourished" },
  { key: "thriving", label: "Thriving" },
];

interface FeatureRow {
  key: string;
  label: string;
  notes?: Partial<Record<FeatureTier, string>>;
}

interface CategoryGroup {
  category: string;
  features: FeatureRow[];
}

const COMPARISON_DATA: CategoryGroup[] = [
  {
    category: "Rhythm",
    features: [
      { key: "cycle_view", label: "Phase graph & day counter" },
      { key: "cycle_log_period", label: "Log period start" },
      { key: "cycle_full_logging", label: "Log mood, symptoms, energy & weight" },
      { key: "cycle_phase_guidance", label: "Phase guidance" },
      { key: "cycle_ai_insights", label: "Cycle AI insights" },
    ],
  },
  {
    category: "Knowledge Feed",
    features: [
      { key: "feed_access", label: "Daily knowledge feed", notes: { free: "Blurred teasers", rooted: "5 posts/day" } },
      { key: "feed_save", label: "Save to Knowledge Hub" },
    ],
  },
  {
    category: "AI Signal",
    features: [
      { key: "signal_daily", label: "Daily Signal / AMA / Give", notes: { rooted: "30 credits/mo", nourished: "100 credits/mo", thriving: "500 credits/mo" } },
      { key: "stoic_readings", label: "Daily Philosophical Readings" },
    ],
  },
  {
    category: "Nutrition",
    features: [
      { key: "nutrition_browse", label: "Recipe library", notes: { free: "Browse titles", rooted: "Browse titles", nourished: "Full + save" } },
      { key: "nutrition_meal_plans", label: "AI meal plans" },
      { key: "nutrition_shopping", label: "Shopping list" },
      { key: "nutrition_fridge", label: "Fridge-to-recipe" },
      { key: "nutrition_plants", label: "Plant tracker" },
    ],
  },
  {
    category: "Movement",
    features: [
      { key: "movement_browse", label: "Exercise library", notes: { free: "Browse names", rooted: "Browse names", nourished: "Full + GIFs" } },
      { key: "movement_training", label: "AI training plans" },
      { key: "movement_sessions", label: "Workout sessions & timer" },
      { key: "movement_body_vis", label: "Body visualiser" },
    ],
  },
  {
    category: "Journal",
    features: [
      { key: "journal_write", label: "Write entries", notes: { free: "No save", rooted: "No save", nourished: "Full save" } },
      { key: "journal_ai", label: "AI journal insights" },
      { key: "journal_dream", label: "Dream Studio" },
      { key: "journal_vault", label: "Memory Vault" },
    ],
  },
  {
    category: "Breathwork",
    features: [
      { key: "breathwork_browse", label: "Breathwork sessions", notes: { free: "Browse only", rooted: "Browse only" } },
    ],
  },
  {
    category: "Nervous System",
    features: [
      { key: "nervous_browse", label: "Nervous system exercises", notes: { free: "Browse only", rooted: "Browse only" } },
    ],
  },
  {
    category: "Practice",
    features: [
      { key: "practice_browse", label: "Mindfulness exercises", notes: { free: "Browse only", rooted: "Browse only", nourished: "Browse only" } },
      { key: "practice_habits", label: "Habits" },
      { key: "practice_sleep", label: "Sleep tracking" },
    ],
  },
  {
    category: "Community",
    features: [
      { key: "community_browse", label: "Community groups", notes: { free: "View only", rooted: "View only", nourished: "View only", thriving: "Join & chat" } },
      { key: "community_nearby", label: "Nearby" },
    ],
  },
  {
    category: "Recommendations",
    features: [
      { key: "recommendations", label: "Personalised recommendations" },
    ],
  },
];

function AccessIcon({ access, note }: { access: FeatureAccess; note?: string }) {
  if (note) {
    return (
      <span className="font-body text-[10px] leading-tight text-center text-foreground/70 block">
        {note}
      </span>
    );
  }
  switch (access) {
    case "full":
      return <Check className="h-4 w-4 text-primary mx-auto" />;
    case "locked":
      return <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />;
    case "view_only":
      return <Eye className="h-3.5 w-3.5 text-muted-foreground/50 mx-auto" />;
    case "teaser":
      return <Lock className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />;
    case "write_no_save":
      return <PenOff className="h-3.5 w-3.5 text-muted-foreground/50 mx-auto" />;
    default:
      return <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />;
  }
}

export default function TierComparisonTable() {
  const { currentTier } = useFeatureGate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-warm p-4 md:p-6 overflow-x-auto"
    >
      <h3 className="font-display text-lg md:text-xl italic text-foreground mb-4 text-center">
        What's included
      </h3>

      <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr>
            <th className="font-body text-xs text-muted-foreground pb-3 pr-3 w-[40%]" />
            {TIER_COLS.map((col) => (
              <th
                key={col.key}
                className={`font-body text-xs font-semibold text-center pb-3 px-1 ${
                  col.key === currentTier ? "text-primary" : "text-foreground"
                }`}
              >
                {col.label}
                {col.key === currentTier && (
                  <div className="h-0.5 bg-primary rounded-full mt-1 mx-auto w-8" />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_DATA.map((group) => (
            <>
              <tr key={`cat-${group.category}`}>
                <td
                  colSpan={5}
                  className="font-display text-sm italic text-foreground pt-4 pb-2 border-b border-border/30"
                >
                  {group.category}
                </td>
              </tr>
              {group.features.map((feature) => {
                const config = FEATURE_ACCESS[feature.key];
                return (
                  <tr key={feature.key} className="border-b border-border/10">
                    <td className="font-body text-xs text-foreground/80 py-2.5 pr-3">
                      {feature.label}
                    </td>
                    {TIER_COLS.map((col) => {
                      const access = config?.[col.key] ?? "locked";
                      const note = feature.notes?.[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`text-center py-2.5 px-1 ${
                            col.key === currentTier ? "bg-primary/5 rounded" : ""
                          }`}
                        >
                          <AccessIcon access={access} note={note} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/20">
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3 text-primary" />
          <span className="font-body text-[10px] text-muted-foreground">Full access</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-body text-[10px] text-muted-foreground">View only</span>
        </div>
        <div className="flex items-center gap-1.5">
          <X className="h-3 w-3 text-muted-foreground/30" />
          <span className="font-body text-[10px] text-muted-foreground">Locked</span>
        </div>
      </div>
    </motion.div>
  );
}
