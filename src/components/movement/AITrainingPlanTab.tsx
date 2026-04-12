import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, Trash2, Sparkles, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCycle } from "@/contexts/CycleContext";
import { useProfile } from "@/hooks/useProfile";

import goalStrongerIcon from "@/assets/icons/goal-stronger.png";
import goalLeanIcon from "@/assets/icons/goal-lean.png";
import goalWeightLossIcon from "@/assets/icons/goal-weight-loss.png";
import equipHomeNoneIcon from "@/assets/icons/equip-home-none.png";
import equipHomeSomeIcon from "@/assets/icons/equip-home-some.png";
import equipGymIcon from "@/assets/icons/equip-gym.png";

type Step = "height" | "weight" | "age" | "goal" | "weight-target" | "days" | "last-workout" | "equipment" | "generating";

interface PlanAnswers {
  height: number;
  heightUnit: "cm" | "ft";
  weight: number;
  age: number;
  goal: "stronger" | "lean" | "lose-weight";
  goalWeight?: number;
  weeksPlan?: number;
  daysPerWeek: number;
  lastWorkout: string;
  equipment: "home-none" | "home-some" | "gym";
}

const STEPS_ORDER: Step[] = ["height", "weight", "age", "goal", "weight-target", "days", "last-workout", "equipment", "generating"];

const GOAL_OPTIONS = [
  { id: "stronger" as const, label: "Get Stronger", desc: "Looking to gain strength", icon: goalStrongerIcon },
  { id: "lean" as const, label: "Get Lean", desc: "Looking to get lean & cut", icon: goalLeanIcon },
  { id: "lose-weight" as const, label: "Lose Weight", desc: "Looking to lose weight & be strong", icon: goalWeightLossIcon },
];

const DAYS_OPTIONS = [
  { value: 3, label: "3 days", desc: "/ week" },
  { value: 4, label: "4 days", desc: "/ week" },
  { value: 5, label: "5 days", desc: "/ week" },
  { value: 6, label: "6+ days", desc: "/ week" },
];

const LAST_WORKOUT_OPTIONS = [
  { id: "this-week", label: "This Week", desc: "I've worked out in the last 7 days." },
  { id: "this-month", label: "This Month", desc: "I've worked out in the last 30 days." },
  { id: "six-months", label: "This Six Months", desc: "It's been awhile, but excited to be back." },
  { id: "never", label: "Never Been", desc: "Never been to a gym, but starting now." },
];

const EQUIPMENT_OPTIONS = [
  { id: "home-none" as const, label: "At Home — No Equipment", desc: "Bodyweight workouts only", icon: equipHomeNoneIcon },
  { id: "home-some" as const, label: "At Home — Some Equipment", desc: "Dumbbells, bands, kettlebells", icon: equipHomeSomeIcon },
  { id: "gym" as const, label: "Gym", desc: "Full gym access", icon: equipGymIcon },
];

export default function AITrainingPlanTab() {
  const { currentPhase } = useCycle();
  const { profile } = useProfile();
  const [existingPlan, setExistingPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("height");
  const [answers, setAnswers] = useState<PlanAnswers>({
    height: profile?.height_cm || 165,
    heightUnit: "cm",
    weight: profile?.weight_kg || 70,
    age: 30,
    goal: "stronger",
    daysPerWeek: 4,
    lastWorkout: "this-month",
    equipment: "home-some",
  });

  // Load existing AI plan
  useEffect(() => {
    loadExistingPlan();
  }, []);

  async function loadExistingPlan() {
    setLoadingPlan(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Check localStorage fallback
      const local = localStorage.getItem("signal_ai_workout_plan");
      if (local) setExistingPlan(JSON.parse(local));
      setLoadingPlan(false);
      return;
    }

    const { data } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_type", "ai_training")
      .order("generated_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setExistingPlan(data[0].plan_data);
      setLastGeneratedAt(data[0].generated_at);

      // Check if generated this month
      const genDate = new Date(data[0].generated_at);
      const now = new Date();
      const sameMonth = genDate.getMonth() === now.getMonth() && genDate.getFullYear() === now.getFullYear();
      setCanGenerate(!sameMonth);
    }
    setLoadingPlan(false);
  }

  const currentStepIndex = STEPS_ORDER.indexOf(step);
  const totalSteps = STEPS_ORDER.length - 1; // Don't count "generating"

  function getVisibleSteps(): Step[] {
    if (answers.goal !== "lose-weight") {
      return STEPS_ORDER.filter(s => s !== "weight-target");
    }
    return STEPS_ORDER;
  }

  const visibleSteps = getVisibleSteps();
  const visibleIndex = visibleSteps.indexOf(step);
  const visibleTotal = visibleSteps.length - 1;

  function goNext() {
    haptic("medium");
    const idx = visibleSteps.indexOf(step);
    if (idx < visibleSteps.length - 1) {
      setStep(visibleSteps[idx + 1]);
    }
  }

  function goBack() {
    haptic("light");
    const idx = visibleSteps.indexOf(step);
    if (idx > 0) {
      setStep(visibleSteps[idx - 1]);
    }
  }

  const weightDiff = useMemo(() => {
    if (answers.goal !== "lose-weight" || !answers.goalWeight) return 0;
    return answers.weight - answers.goalWeight;
  }, [answers.weight, answers.goalWeight, answers.goal]);

  const weeksForTarget = answers.weeksPlan || 8;
  const kgPerWeek = weightDiff > 0 ? (weightDiff / weeksForTarget).toFixed(1) : "0";

  async function handleGenerate() {
    setStep("generating");
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to generate a plan");
        setGenerating(false);
        setStep("equipment");
        return;
      }

      const resp = await supabase.functions.invoke("generate-plan", {
        body: {
          planType: "ai_training",
          userId: user.id,
          cyclePhase: currentPhase,
          answers: {
            height: answers.height,
            weight: answers.weight,
            age: answers.age,
            goal: answers.goal,
            goalWeight: answers.goalWeight,
            weeksPlan: answers.weeksPlan,
            daysPerWeek: answers.daysPerWeek,
            lastWorkout: answers.lastWorkout,
            equipment: answers.equipment,
          },
        },
      });

      if (resp.error) throw resp.error;

      const plan = resp.data?.plan || resp.data;
      setExistingPlan(plan);
      localStorage.setItem("signal_ai_workout_plan", JSON.stringify(plan));
      setCanGenerate(false);
      setLastGeneratedAt(new Date().toISOString());
      toast.success("Your AI training plan is ready!");
    } catch (err: any) {
      console.error("Plan generation failed:", err);
      toast.error("Failed to generate plan. Please try again.");
      setStep("equipment");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRemovePlan() {
    haptic("medium");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_plans")
        .delete()
        .eq("user_id", user.id)
        .eq("plan_type", "ai_training");
    }
    localStorage.removeItem("signal_ai_workout_plan");
    setExistingPlan(null);
    setStep("height");
    toast.success("Plan removed");
  }

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show existing plan
  if (existingPlan && !generating) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold text-foreground">Your AI Training Plan</h2>
          </div>

          {existingPlan.title && (
            <h3 className="font-display text-lg font-bold text-foreground">{existingPlan.title}</h3>
          )}
          {existingPlan.overview && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{existingPlan.overview}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {existingPlan.duration_weeks && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-body text-sm text-foreground">{existingPlan.duration_weeks} weeks</span>
              </div>
            )}
            {existingPlan.days_per_week && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-body text-sm text-foreground">{existingPlan.days_per_week} days/week</span>
              </div>
            )}
          </div>
        </div>

        {/* Weekly breakdown */}
        {existingPlan.weeks?.map((week: any, wIdx: number) => (
          <div key={wIdx} className="space-y-2">
            <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Week {wIdx + 1} {week.theme && `— ${week.theme}`}
            </h4>
            <div className="grid gap-2">
              {week.days?.map((day: any, dIdx: number) => (
                <div key={dIdx} className="rounded-xl bg-card border border-border p-3">
                  <p className="font-body text-[10px] text-primary uppercase tracking-[0.15em]">
                    Day {day.day}
                  </p>
                  <h5 className="font-display text-sm font-bold text-foreground mt-0.5">
                    {day.title || day.name || "Session"}
                  </h5>
                  {day.exercises && (
                    <div className="mt-2 space-y-1">
                      {day.exercises.map((ex: any, eIdx: number) => (
                        <p key={eIdx} className="font-body text-xs text-muted-foreground">
                          • {ex.name} — {ex.sets}×{ex.reps_or_duration}
                          {ex.form_cue && <span className="italic text-muted-foreground/60"> ({ex.form_cue})</span>}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Remove plan */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleRemovePlan}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-destructive/30 text-destructive py-3 font-body text-sm font-medium hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Remove plan
          </button>
          {lastGeneratedAt && (
            <p className="text-center font-body text-[10px] text-muted-foreground">
              Generated {new Date(lastGeneratedAt).toLocaleDateString()} · 1 free plan per month
            </p>
          )}
        </div>
      </div>
    );
  }

  // Onboarding flow
  return (
    <div className="relative min-h-[60vh]">
      {/* Progress ring */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative h-12 w-12 shrink-0">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${(visibleIndex / visibleTotal) * 113} 113`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-foreground">
            {visibleIndex + 1}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* HEIGHT */}
        {step === "height" && (
          <StepWrapper key="height">
            <StepTitle main="WHAT'S YOUR CURRENT" accent="HEIGHT?" />
            <div className="flex justify-center mt-8">
              <div className="rounded-2xl border-2 border-primary bg-card px-10 py-6">
                <input
                  type="number"
                  value={answers.height}
                  onChange={e => setAnswers(p => ({ ...p, height: Number(e.target.value) }))}
                  className="w-24 text-center font-display text-4xl font-extrabold text-primary bg-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="inline-flex rounded-full bg-muted/30 p-1">
                {(["ft", "cm"] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setAnswers(p => ({ ...p, heightUnit: u }))}
                    className={cn(
                      "px-4 py-1.5 rounded-full font-body text-sm font-medium transition-all",
                      answers.heightUnit === u ? "bg-foreground text-background" : "text-muted-foreground"
                    )}
                  >{u}</button>
                ))}
              </div>
            </div>
            <NavButtons onBack={undefined} onNext={goNext} />
          </StepWrapper>
        )}

        {/* WEIGHT */}
        {step === "weight" && (
          <StepWrapper key="weight">
            <StepTitle main="WHAT'S YOUR CURRENT" accent="WEIGHT?" />
            <div className="flex justify-center mt-8">
              <div className="rounded-2xl border-2 border-primary bg-card px-10 py-6">
                <input
                  type="number"
                  value={answers.weight}
                  onChange={e => setAnswers(p => ({ ...p, weight: Number(e.target.value) }))}
                  className="w-24 text-center font-display text-4xl font-extrabold text-primary bg-transparent outline-none"
                />
              </div>
            </div>
            <p className="text-center font-body text-xs text-muted-foreground mt-2">kg</p>
            <NavButtons onBack={goBack} onNext={goNext} />
          </StepWrapper>
        )}

        {/* AGE */}
        {step === "age" && (
          <StepWrapper key="age">
            <StepTitle main="WHAT'S YOUR CURRENT" accent="AGE?" />
            <div className="flex justify-center mt-8">
              <div className="rounded-2xl border-2 border-primary bg-card px-10 py-6">
                <input
                  type="number"
                  value={answers.age}
                  onChange={e => setAnswers(p => ({ ...p, age: Number(e.target.value) }))}
                  className="w-24 text-center font-display text-4xl font-extrabold text-primary bg-transparent outline-none"
                />
              </div>
            </div>
            <NavButtons onBack={goBack} onNext={goNext} />
          </StepWrapper>
        )}

        {/* GOAL */}
        {step === "goal" && (
          <StepWrapper key="goal">
            <StepTitle main="WHAT'S YOUR FITNESS" accent="GOAL?" />
            <div className="space-y-3 mt-6">
              {GOAL_OPTIONS.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    haptic("light");
                    setAnswers(p => ({ ...p, goal: g.id }));
                    goNext();
                  }}
                  className={cn(
                    "w-full rounded-2xl bg-card border p-4 text-left flex items-center gap-4 transition-all active:scale-[0.98]",
                    answers.goal === g.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <img src={g.icon} alt="" className="h-12 w-12 object-contain" loading="lazy" />
                  <div>
                    <h3 className="font-display text-base font-bold text-primary">{g.label}</h3>
                    <p className="font-body text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center font-body text-xs text-muted-foreground mt-3">You can always adjust later</p>
            <NavButtons onBack={goBack} onNext={undefined} />
          </StepWrapper>
        )}

        {/* WEIGHT TARGET (only for lose-weight) */}
        {step === "weight-target" && (
          <StepWrapper key="weight-target">
            <StepTitle main="HOW FAST DO YOU WANT TO LOSE" accent={`${weightDiff > 0 ? weightDiff.toFixed(1) : "?"} KG?`} />
            <div className="rounded-2xl bg-card border border-border p-5 mt-6 space-y-4">
              <div>
                <label className="font-body text-xs text-muted-foreground">Goal weight (kg)</label>
                <input
                  type="number"
                  value={answers.goalWeight || answers.weight - 10}
                  onChange={e => setAnswers(p => ({ ...p, goalWeight: Number(e.target.value) }))}
                  className="w-full mt-1 rounded-xl border border-border bg-background px-3 py-2 font-display text-lg font-bold text-primary outline-none"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-body text-foreground">TODAY → <span className="text-primary font-bold">{new Date(Date.now() + (weeksForTarget * 7 * 86400000)).toLocaleDateString("en-NZ", { month: "short", day: "numeric" })}</span></span>
              </div>
              {Number(kgPerWeek) > 1.5 && (
                <p className="font-body text-xs text-amber-500 text-center">
                  This is an aggressive target. We recommend about 0.5–1 kg per week.
                </p>
              )}
              <div className="flex items-center justify-center gap-3">
                <span className="rounded-full bg-primary px-3 py-1 font-body text-xs font-bold text-primary-foreground">
                  {kgPerWeek} KG / WEEK
                </span>
                <span className="rounded-full bg-muted px-3 py-1 font-body text-xs font-bold text-foreground">
                  {weeksForTarget} WEEKS
                </span>
              </div>
              <div className="space-y-1">
                <label className="font-body text-xs text-muted-foreground">Timeline (weeks)</label>
                <input
                  type="range"
                  min={4}
                  max={24}
                  step={1}
                  value={answers.weeksPlan || 8}
                  onChange={e => setAnswers(p => ({ ...p, weeksPlan: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-body text-[10px] text-muted-foreground">
                  <span>4</span>
                  <span>8</span>
                  <span>12</span>
                  <span>16</span>
                  <span>20</span>
                  <span>24</span>
                </div>
              </div>
            </div>
            <NavButtons onBack={goBack} onNext={goNext} />
          </StepWrapper>
        )}

        {/* DAYS PER WEEK */}
        {step === "days" && (
          <StepWrapper key="days">
            <StepTitle main="HOW MANY" accent="DAYS PER WEEK" suffix="DO YOU WORKOUT?" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {DAYS_OPTIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => {
                    haptic("light");
                    setAnswers(p => ({ ...p, daysPerWeek: d.value }));
                    goNext();
                  }}
                  className={cn(
                    "rounded-2xl bg-card border p-5 text-center transition-all active:scale-[0.98]",
                    answers.daysPerWeek === d.value ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <p className="font-display text-lg font-bold text-primary">{d.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{d.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-center font-body text-xs text-muted-foreground mt-3">You can always adjust later</p>
            <NavButtons onBack={goBack} onNext={undefined} />
          </StepWrapper>
        )}

        {/* LAST WORKOUT */}
        {step === "last-workout" && (
          <StepWrapper key="last-workout">
            <StepTitle accent="WHEN" main="WAS YOUR LAST" suffix="WORKOUT?" />
            <div className="space-y-3 mt-6">
              {LAST_WORKOUT_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    haptic("light");
                    setAnswers(p => ({ ...p, lastWorkout: o.id }));
                    goNext();
                  }}
                  className={cn(
                    "w-full rounded-2xl bg-card border p-4 text-left transition-all active:scale-[0.98]",
                    answers.lastWorkout === o.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <h3 className="font-display text-base font-bold text-primary">{o.label}</h3>
                  <p className="font-body text-xs text-muted-foreground">{o.desc}</p>
                </button>
              ))}
            </div>
            <NavButtons onBack={goBack} onNext={undefined} />
          </StepWrapper>
        )}

        {/* EQUIPMENT */}
        {step === "equipment" && (
          <StepWrapper key="equipment">
            <StepTitle main="WHERE DO YOU" accent="WORKOUT?" />
            <div className="space-y-3 mt-6">
              {EQUIPMENT_OPTIONS.map(e => (
                <button
                  key={e.id}
                  onClick={() => {
                    haptic("light");
                    setAnswers(p => ({ ...p, equipment: e.id }));
                  }}
                  className={cn(
                    "w-full rounded-2xl bg-card border p-4 text-left flex items-center gap-4 transition-all active:scale-[0.98]",
                    answers.equipment === e.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <img src={e.icon} alt="" className="h-12 w-12 object-contain" loading="lazy" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-primary">{e.label}</h3>
                    <p className="font-body text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {!canGenerate && (
                <p className="text-center font-body text-xs text-amber-500">
                  You've already generated a plan this month. Extra plans require credit top-up.
                </p>
              )}
              <button
                onClick={handleGenerate}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground font-display text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              >
                <Sparkles className="h-4 w-4" />
                Generate My Plan
              </button>
            </div>
            <NavButtons onBack={goBack} onNext={undefined} />
          </StepWrapper>
        )}

        {/* GENERATING */}
        {step === "generating" && (
          <StepWrapper key="generating">
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-display text-xl font-extrabold text-foreground">Building your plan...</h2>
                <p className="font-body text-sm text-muted-foreground">
                  Analysing evidence-based training principles and your profile to create a personalised program.
                </p>
              </div>
            </div>
          </StepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepWrapper({ children, key }: { children: React.ReactNode; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ main, accent, suffix }: { main?: string; accent: string; suffix?: string }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl font-extrabold leading-tight text-foreground">
      {main && <>{main} </>}<span className="text-primary">{accent}</span>{suffix && <> {suffix}</>}
    </h2>
  );
}

function NavButtons({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center gap-3 mt-8">
      {onBack && (
        <button
          onClick={onBack}
          className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center shrink-0 active:scale-[0.95] transition-transform"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-display text-base font-semibold active:scale-[0.97] transition-transform"
        >
          NEXT
        </button>
      )}
    </div>
  );
}
