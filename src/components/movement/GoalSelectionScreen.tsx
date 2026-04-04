import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Target, Zap, Heart, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
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

function IntensityBar({ min, max }: { min: number; max: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1.5 w-4 rounded-full transition-colors",
            n >= min && n <= max ? "bg-primary" : "bg-muted/40"
          )}
        />
      ))}
    </div>
  );
}

const INTENSITY_LABELS: Record<string, string> = {
  "1-2": "Low intensity",
  "1-3": "Low–Moderate",
  "2-3": "Moderate",
  "2-4": "Moderate",
  "3-4": "Moderate–High",
  "3-5": "High",
  "4-5": "High intensity",
};

export default function GoalSelectionScreen({ goals, selectedGoalId, onSelect, variant = "page" }: Props) {
  const [expandedHormonal, setExpandedHormonal] = useState<string | null>(null);

  const isOnboarding = variant === "onboarding";

  return (
    <div className={cn("space-y-4", isOnboarding && "pt-4")}>
      {!isOnboarding && (
        <div className="space-y-2 mb-6">
          <h2 className="font-display text-2xl font-extrabold text-foreground">Choose your training goal</h2>
          <p className="font-body text-sm text-muted-foreground">
            Your goal determines your program, workouts, and intensity. You can change it any time.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {goals.map((goal, i) => {
          const selected = selectedGoalId === goal.id;
          const Icon = GOAL_ICONS[goal.slug] || Target;
          const intensityKey = `${goal.intensity_min}-${goal.intensity_max}`;
          const hormonalExpanded = expandedHormonal === goal.id;

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
                    "h-4.5 w-4.5",
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
                        : selected ? "text-foreground" : "text-foreground"
                    )}>
                      {goal.label}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <IntensityBar min={goal.intensity_min} max={goal.intensity_max} />
                      <span className={cn(
                        "font-mono text-[10px] uppercase tracking-wider",
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
}
