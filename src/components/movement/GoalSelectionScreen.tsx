import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Target, Zap, Heart, Flame, TrendingUp, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import type { GoalCategory } from "@/hooks/useTrainingProgram";

interface Props {
  goals: GoalCategory[];
  selectedGoalId: string | null;
  onSelect: (goalId: string) => void;
  variant?: "onboarding" | "page";
}

const GOAL_ICONS: Record<string, typeof Target> = {
  nervous_system: Heart,
  gentle_movement: Heart,
  walk_to_run: TrendingUp,
  functional_fitness: Zap,
  fat_loss_cardio: Flame,
  hiit_performance: Zap,
  body_recomposition: Target,
  glute_foundation: Target,
  muscle_building: TrendingUp,
  strength_power: Zap,
  hormonal_support: Heart,
};

const TIERS: { label: string; description: string; slugs: string[] }[] = [
  {
    label: "Start here",
    description: "Lower intensity · Restorative & foundational",
    slugs: ["nervous_system", "gentle_movement", "walk_to_run", "hormonal_support"],
  },
  {
    label: "Build",
    description: "Moderate intensity · Strength & conditioning",
    slugs: ["functional_fitness", "fat_loss_cardio", "body_recomposition", "glute_foundation"],
  },
  {
    label: "Push",
    description: "Higher intensity · Performance & hypertrophy",
    slugs: ["hiit_performance", "muscle_building", "strength_power"],
  },
];

interface ProgramSummary {
  goal_category_id: string;
  duration_weeks: number;
  sessions_per_week: number;
  who_its_for: string | null;
}

function IntensityBar({ min, max }: { min: number; max: number }) {
  const maxBars = Math.max(max, 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, n) => n + 1).map((n) => {
        const scaled = Math.round((n / 5) * maxBars);
        const active = scaled >= min && scaled <= max;
        return (
          <div
            key={n}
            className={cn(
              "h-1.5 w-4 rounded-full transition-colors",
              active ? "bg-primary" : "bg-muted/40"
            )}
          />
        );
      })}
    </div>
  );
}

const INTENSITY_LABELS: Record<string, string> = {
  "1-3": "Low",
  "2-4": "Low–Moderate",
  "2-6": "Variable",
  "3-5": "Moderate",
  "4-6": "Moderate",
  "4-7": "Moderate–High",
  "5-7": "High",
  "6-8": "High",
  "7-9": "Very High",
};

export default function GoalSelectionScreen({ goals, selectedGoalId, onSelect, variant = "page" }: Props) {
  const [expandedHormonal, setExpandedHormonal] = useState<string | null>(null);
  const [programSummaries, setProgramSummaries] = useState<ProgramSummary[]>([]);
  const isOnboarding = variant === "onboarding";

  useEffect(() => {
    supabase
      .from("training_programs")
      .select("goal_category_id, duration_weeks, sessions_per_week, who_its_for")
      .then(({ data }) => {
        if (data) setProgramSummaries(data as ProgramSummary[]);
      });
  }, []);

  const goalsBySlug = new Map(goals.map((g) => [g.slug, g]));

  return (
    <div className={cn("space-y-6", isOnboarding && "pt-4")}>
      {!isOnboarding && (
        <div className="space-y-2 mb-2">
          <h2 className="font-display text-2xl font-extrabold text-foreground">Choose your training goal</h2>
          <p className="font-body text-sm text-muted-foreground">
            Your goal determines your program, workouts, and intensity. You can change it any time.
          </p>
        </div>
      )}

      {TIERS.map((tier) => {
        const tierGoals = tier.slugs.map((s) => goalsBySlug.get(s)).filter(Boolean) as GoalCategory[];
        if (tierGoals.length === 0) return null;

        return (
          <div key={tier.label} className="space-y-2.5">
            <div>
              <h3 className={cn(
                "font-display text-sm font-bold uppercase tracking-wider",
                isOnboarding ? "text-white/60" : "text-muted-foreground"
              )}>
                {tier.label}
              </h3>
              <p className={cn(
                "font-body text-xs mt-0.5",
                isOnboarding ? "text-white/30" : "text-muted-foreground/60"
              )}>
                {tier.description}
              </p>
            </div>

            <div className="grid gap-2.5">
              {tierGoals.map((goal, i) => {
                const selected = selectedGoalId === goal.id;
                const Icon = GOAL_ICONS[goal.slug] || Target;
                const intensityKey = `${goal.intensity_min}-${goal.intensity_max}`;
                const hormonalExpanded = expandedHormonal === goal.id;
                const progSummary = programSummaries.find((p) => p.goal_category_id === goal.id);

                return (
                  <motion.button
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    onClick={() => {
                      haptic("light");
                      onSelect(goal.id);
                    }}
                    className={cn(
                      "w-full rounded-2xl p-4 text-left transition-all border",
                      isOnboarding
                        ? selected
                          ? "bg-white text-primary border-white shadow-lg"
                          : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                        : selected
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                          : "bg-card border-border hover:bg-card/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                        isOnboarding
                          ? selected ? "bg-primary/10" : "bg-white/10"
                          : selected ? "bg-primary/10" : "bg-muted/30"
                      )}>
                        <Icon className={cn(
                          "h-[1.125rem] w-[1.125rem]",
                          isOnboarding
                            ? selected ? "text-primary" : "text-white/70"
                            : selected ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={cn(
                            "font-display text-base font-bold leading-snug",
                            isOnboarding
                              ? selected ? "text-primary" : "text-white"
                              : "text-foreground"
                          )}>
                            {goal.label}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <IntensityBar min={goal.intensity_min} max={goal.intensity_max} />
                            <span className={cn(
                              "font-body text-[10px] uppercase tracking-wider",
                              isOnboarding
                                ? selected ? "text-primary/60" : "text-white/40"
                                : "text-muted-foreground"
                            )}>
                              {INTENSITY_LABELS[intensityKey] || "Moderate"}
                            </span>
                          </div>
                        </div>

                        {goal.description && (
                          <p className={cn(
                            "font-body text-sm mt-1 leading-relaxed",
                            isOnboarding
                              ? selected ? "text-primary/70" : "text-white/50"
                              : "text-muted-foreground"
                          )}>
                            {goal.description}
                          </p>
                        )}

                        {/* Program stats */}
                        {progSummary && (
                          <div className={cn(
                            "flex flex-wrap gap-3 mt-2",
                            isOnboarding
                              ? selected ? "text-primary/50" : "text-white/30"
                              : "text-muted-foreground/70"
                          )}>
                            <span className="inline-flex items-center gap-1 font-body text-xs">
                              <Calendar className="h-3 w-3" />
                              {progSummary.duration_weeks} weeks
                            </span>
                            <span className="inline-flex items-center gap-1 font-body text-xs">
                              <Clock className="h-3 w-3" />
                              {progSummary.sessions_per_week} days/week
                            </span>
                          </div>
                        )}

                        {/* Who it's for */}
                        {progSummary?.who_its_for && (
                          <p className={cn(
                            "font-body text-xs mt-1.5 italic",
                            isOnboarding
                              ? selected ? "text-primary/50" : "text-white/30"
                              : "text-muted-foreground/60"
                          )}>
                            {progSummary.who_its_for}
                          </p>
                        )}

                        {/* Hormonal note toggle */}
                        {goal.hormonal_notes && (
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptic("light");
                                setExpandedHormonal(hormonalExpanded ? null : goal.id);
                              }}
                              className={cn(
                                "inline-flex items-center gap-1 font-body text-xs font-medium",
                                isOnboarding
                                  ? "text-white/40 hover:text-white/60"
                                  : "text-primary/50 hover:text-primary/70"
                              )}
                            >
                              <Heart className="h-3 w-3" />
                              Cycle note
                              {hormonalExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            <AnimatePresence>
                              {hormonalExpanded && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={cn(
                                    "font-body text-xs leading-relaxed mt-1.5 overflow-hidden",
                                    isOnboarding ? "text-white/50" : "text-muted-foreground"
                                  )}
                                >
                                  {goal.hormonal_notes}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
