import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import type { TrainingPath } from "@/data/signal-training-paths";
import { getSelectedPathId, setSelectedPathId } from "@/lib/training-path-utils";

/**
 * "What's your goal?" → the training path that fits it.
 *
 * The goal slug is the same one Nutrition uses for protein/carb targets
 * (fitness-profile NUTRITION_TARGETS), so choosing a goal here also tunes
 * the meal plan to fuel it.
 */
export const FITNESS_GOALS: { slug: string; label: string; pathId: string; why: string }[] = [
  { slug: "strength_power", label: "Get stronger", pathId: "strength-from-the-ground-up", why: "Three full-body sessions a week, 30–45 min, dumbbells and a band." },
  { slug: "muscle_building", label: "Build muscle", pathId: "the-forge", why: "Four gym sessions a week, upper and lower body twice each, with lighter weeks built in." },
  { slug: "glute_foundation", label: "Glutes & lower body", pathId: "glute-power", why: "Three sessions a week led by one heavy glute lift, with upper body to stay balanced." },
  { slug: "body_recomposition", label: "Tone on the reformer", pathId: "reformer-strength", why: "Three home-reformer sessions a week, building from set-up to heavier springs." },
  { slug: "functional_fitness", label: "Pilates in 30 min", pathId: "mat-pilates", why: "Four 30-minute mat sculpt classes a week, low impact." },
  { slug: "walk_to_run", label: "Start running", pathId: "learn-to-run", why: "Walk–run intervals that build to a continuous run." },
  { slug: "fat_loss_cardio", label: "Fitness & fat loss", pathId: "signal-circuit-progressive", why: "An 8-move circuit that raises fitness week by week." },
  { slug: "nervous_system", label: "Recover & de-stress", pathId: "rest-and-restore-somatic-full", why: "Somatic and restorative sessions for a frayed system." },
];

const GOAL_KEY = "signal_goal_slug";

function readGoal(): string | null {
  try { return localStorage.getItem(GOAL_KEY); } catch { return null; }
}

async function saveGoal(slug: string) {
  try {
    localStorage.setItem(GOAL_KEY, slug);
    // Nutrition's "fuel your workouts" nudge reads body goals.
    if (!localStorage.getItem("signal_body_goals")) localStorage.setItem("signal_body_goals", JSON.stringify([slug]));
  } catch { /* storage disabled */ }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ user_id: user.id, movement_goals: [slug] } as never, { onConflict: "user_id" });
  } catch { /* offline */ }
}

export default function GoalPathPicker({
  paths,
  onOpenPath,
}: {
  paths: TrainingPath[];
  onOpenPath: (path: TrainingPath) => void;
}) {
  const [goal, setGoal] = useState<string | null>(readGoal);
  const [activeId, setActiveId] = useState<string | null>(getSelectedPathId());

  useEffect(() => {
    const onChange = () => setActiveId(getSelectedPathId());
    window.addEventListener("signal:training-path-changed", onChange);
    return () => window.removeEventListener("signal:training-path-changed", onChange);
  }, []);

  const chosen = FITNESS_GOALS.find((g) => g.slug === goal);
  const path = chosen ? paths.find((p) => p.id === chosen.pathId) : undefined;
  const isActive = !!path && activeId === path.id;

  return (
    <section className="rounded-[24px] border border-border/70 bg-card p-5 shadow-soft space-y-4" aria-labelledby="goal-picker-heading">
      <div>
        <h2 id="goal-picker-heading" className="font-display text-lg font-semibold text-foreground">What's your goal?</h2>
        <p className="text-[12px] text-muted-foreground">Pick one — we'll match a plan and tune your meals to fuel it.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Fitness goal">
        {FITNESS_GOALS.map((g) => {
          const on = goal === g.slug;
          return (
            <button
              key={g.slug}
              role="radio"
              aria-checked={on}
              onClick={() => { haptic("light"); setGoal(g.slug); void saveGoal(g.slug); }}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                on ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground/80 hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {chosen && path && (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-secondary/70 p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Best match for “{chosen.label}”</p>
            <p className="display-serif mt-1 text-[1.6rem] leading-tight text-foreground">{path.name}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{chosen.why} {path.weeks.length} weeks.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-2 text-[12px] font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> This is your plan — sessions are on Today
                </span>
              ) : (
                <button
                  onClick={() => {
                    haptic("success");
                    setSelectedPathId(path.id);
                    toast.success(`${path.name} is now your plan. Your first session is on the Today tab.`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[12px] font-semibold text-background"
                >
                  Start this plan <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => { haptic("light"); onOpenPath(path); }}
                className="rounded-full border border-border px-4 py-2 text-[12px] font-medium text-foreground/80"
              >
                See the weeks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
