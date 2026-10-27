import { saveAIMealPlan, savePreferences, type PrepPreferences } from "@/lib/weekly-planner";
import { buildDbMealPlanFull } from "@/lib/build-db-meal-plan";
import { getNextSession, getSelectedPath, getSelectedPathId, pathForOnboarding, plannedExercises, setSelectedPathId } from "@/lib/training-path-utils";
import { dreamJournalEntry, habitsFromDream, reflectOnDream, type DreamHabit } from "@/lib/dream-reflection";
import { loadEntries, saveEntries } from "@/lib/journal-store";
import { getHabits, saveHabits } from "@/data/self-care-rituals";
import { toast } from "sonner";
import { useState, useEffect, useMemo, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CalendarDays, Minus, Plus, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import iconCream from "@/assets/icon-cream.png";
import { useCycle } from "@/contexts/CycleContext";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onComplete: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Her dream comes first and the practical setup follows; measurements and cycle
// tracking come last and are optional.
const FLOW = ["welcome", "dream", "reflect", "movement_goals", "fitness_level", "equipment", "body", "nutrition", "cycle", "generating"] as const;
const TOTAL_STEPS = FLOW.length;

const MOVEMENT_GOALS = [
  { id: "strength", label: "Feel stronger in my body" },
  { id: "fat_loss", label: "Soften how I sit in my body" },
  { id: "cardio", label: "Find my breath again" },
  { id: "stress", label: "Quiet a busy nervous system" },
  { id: "consistency", label: "Return to myself, gently" },
  { id: "mobility", label: "Move with more ease" },
  { id: "event", label: "Build toward something specific" },
  { id: "recovery", label: "Come back from injury, slowly" },
];

const DIETARY_PREFERENCES = [
  { id: "omnivore", label: "Omnivore" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten-free" },
  { id: "dairy_free", label: "Dairy-free" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "low_carb", label: "Low-carb" },
  { id: "mediterranean", label: "Mediterranean" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginning, or beginning again", desc: "New to this, or finding your way back after a pause" },
  { id: "intermediate", label: "Somewhere in the middle", desc: "Moving a couple of times a week, mostly familiar" },
  { id: "advanced", label: "Already in rhythm", desc: "Training often, comfortable with most movements" },
];

const EQUIPMENT_OPTIONS = [
  { id: "home-none", label: "At home — just me", desc: "Bodyweight only. Your body is enough." },
  { id: "home-some", label: "At home — a few things", desc: "Dumbbells, bands, kettlebells, a mat" },
  { id: "gym", label: "Gym", desc: "Full setup whenever you're there" },
];

const LOADING_MESSAGES = [
  "Listening to where you are in your cycle…",
  "Shaping a four-week rhythm around your body…",
  "Preparing food that meets you where you are…",
  "Choosing the smallest, kindest place to begin…",
  "Your Signal is here.",
];

const CYCLE_OPTIONS = [
  {
    id: "cycling",
    title: "I still bleed",
    desc: "Regular, or roughly so",
  },
  {
    id: "perimenopause",
    title: "Things are shifting",
    desc: "Cycles uncertain, or in perimenopause",
  },
  {
    id: "post_menopause",
    title: "I no longer bleed",
    desc: "Post-menopause, or no period",
  },
  {
    id: "not_tracking",
    title: "I'd rather not track",
    desc: "Plans follow the calendar. Add your cycle any time.",
  },
];

const DREAM_QUESTIONS = ["How do your mornings feel?", "What does your body let you do?", "Who is around you?", "What have you let go of?"];

// ─── TDEE / macro helpers ─────────────────────────────────────────────────────

function calcAge(dob: Date): number {
  return differenceInYears(new Date(), dob);
}

function calcTDEE(weightKg: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor for female
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * 1.4);
}

function calcMacros(goals: string[], weightKg: number, heightCm: number, dob: Date | undefined) {
  const age = dob ? calcAge(dob) : 30;
  const tdee = calcTDEE(weightKg || 65, heightCm || 165, age);

  const hasFatLoss = goals.includes("fat_loss");
  const hasStrength = goals.includes("strength");

  let calories = tdee;
  let proteinG = Math.round(weightKg * 1.8);

  if (hasFatLoss) {
    calories = tdee - 300;
    proteinG = Math.round(weightKg * 2.0);
  } else if (hasStrength) {
    calories = tdee + 200;
    proteinG = Math.round(weightKg * 2.2);
  }

  const proteinCals = proteinG * 4;
  const fatG = Math.round((calories * 0.25) / 9);
  const fatCals = fatG * 9;
  const carbG = Math.round((calories - proteinCals - fatCals) / 4);

  return { calories, proteinG, carbG, fatG };
}

// Unit conversion helpers
function kgToLbs(kg: number) { return Math.round(kg * 2.2046 * 10) / 10; }
function lbsToKg(lbs: number) { return Math.round(lbs / 2.2046 * 10) / 10; }
function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalIn = cm / 2.54;
  return { ft: Math.floor(totalIn / 12), inches: Math.round(totalIn % 12) };
}
function ftInToCm(ft: number, inches: number) {
  return Math.round((ft * 12 + inches) * 2.54);
}

// ─── Animation variant ────────────────────────────────────────────────────────

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="space-y-2">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h1>
      {sub && <p className="font-body text-sm text-white/60 leading-relaxed">{sub}</p>}
    </div>
  );
}

function NextButton({ onClick, disabled, label = "Next" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90 disabled:opacity-40"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }: Props) {
  const { user } = useAuth();
  const { updateDisplayName } = useProfile();
  const { setCycleStartDate } = useCycle();

  // Track onboarding start
  useEffect(() => {
    trackEvent("onboarding_started");
    trackEvent("onboarding_step_viewed", { step: 0, step_name: "welcome" });
  }, []);

  // Navigation
  const [step, setStep] = useState(0);
  const stepId = FLOW[step];

  // Step 0 — Name
  const [name, setName] = useState("");

  // Step 1 — Body
  const [dob, setDob] = useState<Date | undefined>();
  const [weightKg, setWeightKg] = useState<number>(65);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [goalWeightKg, setGoalWeightKg] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [ftVal, setFtVal] = useState(5);
  const [inVal, setInVal] = useState(5);
  const [weightDisplay, setWeightDisplay] = useState("65");
  const [goalWeightDisplay, setGoalWeightDisplay] = useState("");

  // Step 2 — Cycle
  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>();
  const [cycleLength, setCycleLength] = useState(28);

  // Step 3 — Movement Goals
  const [movementGoals, setMovementGoals] = useState<string[]>([]);
  // My Dream Life: her own words, then the goals and habits she keeps from them.
  const [dream, setDream] = useState("");
  const suggestions = useMemo(() => reflectOnDream(dream), [dream]);
  const [chosenHabits, setChosenHabits] = useState<DreamHabit[]>([]);

  // Step 4 — Nutrition
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [dietaryDislikes, setDietaryDislikes] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState("");
  const [mealPrepDay, setMealPrepDay] = useState<string | null>(null);

  // Step 5 — Fitness Level
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);

  // Step 6 — Equipment
  const [equipmentPref, setEquipmentPref] = useState<string>("home-some");

  // Step 7 — Generating
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  // Shown once setup is saved, so she sees her actual first session before arriving.
  const [ready, setReady] = useState(false);
  const [firstSession, setFirstSession] = useState<{ plan: string; name: string; detail: string; moves: string[] } | null>(null);

  const STEP_NAMES = FLOW;

  const next = () => {
    haptic("light");
    const nextStep = Math.min(step + 1, TOTAL_STEPS - 1);
    trackEvent("onboarding_step_completed", { step: step, step_name: STEP_NAMES[step] });
    trackEvent("onboarding_step_viewed", { step: nextStep, step_name: STEP_NAMES[nextStep] });
    setStep(nextStep);
  };
  const reflect = () => {
    setMovementGoals(prev => (prev.length ? prev : suggestions.goals));
    setChosenHabits(suggestions.habits);
    next();
  };
  const toggleHabit = (habit: DreamHabit) => {
    haptic("light");
    setChosenHabits(prev => (prev.some(h => h.name === habit.name) ? prev.filter(h => h.name !== habit.name) : [...prev, habit]));
  };
  const back = () => {
    haptic("light");
    trackEvent("onboarding_step_back", { from_step: step, from_step_name: STEP_NAMES[step] });
    setStep((s) => Math.max(s - 1, 0));
  };

  // Derived macros (calculated once for display in step 4)
  const macros = weightKg && heightCm
    ? calcMacros(movementGoals, weightKg, heightCm, dob)
    : null;

  // ── Weight unit toggle
  const switchWeightUnit = (unit: "kg" | "lbs") => {
    if (unit === weightUnit) return;
    setWeightUnit(unit);
    if (unit === "lbs") {
      setWeightDisplay(String(kgToLbs(weightKg)));
    } else {
      setWeightDisplay(String(weightKg));
    }
  };

  const handleWeightChange = (val: string) => {
    setWeightDisplay(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setWeightKg(weightUnit === "kg" ? num : lbsToKg(num));
    }
  };

  const handleGoalWeightChange = (val: string) => {
    setGoalWeightDisplay(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setGoalWeightKg(weightUnit === "kg" ? num : lbsToKg(num));
    } else {
      setGoalWeightKg(null);
    }
  };

  // ── Height unit toggle
  const switchHeightUnit = (unit: "cm" | "ft") => {
    if (unit === heightUnit) return;
    setHeightUnit(unit);
    if (unit === "ft") {
      const { ft, inches } = cmToFtIn(heightCm);
      setFtVal(ft);
      setInVal(inches);
    }
  };

  const handleFtInChange = (ft: number, inches: number) => {
    const clamped = { ft: Math.max(3, Math.min(8, ft)), inches: Math.max(0, Math.min(11, inches)) };
    setFtVal(clamped.ft);
    setInVal(clamped.inches);
    setHeightCm(ftInToCm(clamped.ft, clamped.inches));
  };

  // ── Dietary dislikes tag input
  const addDislike = (raw: string) => {
    const tags = raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    setDietaryDislikes((prev) => {
      const merged = [...prev];
      tags.forEach((t) => { if (!merged.includes(t)) merged.push(t); });
      return merged;
    });
    setDislikeInput("");
  };

  const handleDislikeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (dislikeInput.trim()) addDislike(dislikeInput);
    }
    if (e.key === "Backspace" && dislikeInput === "" && dietaryDislikes.length > 0) {
      setDietaryDislikes((prev) => prev.slice(0, -1));
    }
  };

  const removeDislike = (tag: string) => setDietaryDislikes((prev) => prev.filter((t) => t !== tag));

  // ── Toggle movement goal
  const toggleGoal = (id: string) => {
    haptic("light");
    setMovementGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // ── Toggle dietary preference
  const togglePref = (id: string) => {
    haptic("light");
    setDietaryPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ── Cycle through loading messages on step 6
  useEffect(() => {
    if (stepId !== "generating") return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => {
        if (i >= LOADING_MESSAGES.length - 1) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
    }, 1600);
    return () => clearInterval(interval);
  }, [step]);

  // ── Auto-save when loading screen finishes
  useEffect(() => {
    if (stepId === "generating" && loadingMsgIndex === LOADING_MESSAGES.length - 1 && !saving) {
      handleFinish();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, loadingMsgIndex]);

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (user && name.trim()) {
        await updateDisplayName(name.trim());
      }

      if (lastPeriodDate) {
        const dateStr = format(lastPeriodDate, "yyyy-MM-dd");
        setCycleStartDate(dateStr);
      }

      const m = macros ?? { calories: 2000, proteinG: 130, carbG: 220, fatG: 65 };

      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            user_id: user.id,
            display_name: name.trim() || null,
            primary_goal: movementGoals[0] ?? null,
            fitness_level: fitnessLevel,
            cycle_length: cycleLength,
            onboarding_complete: true,
            date_of_birth: dob ? format(dob, "yyyy-MM-dd") : null,
            weight_kg: weightKg || null,
            height_cm: heightCm || null,
            goal_weight_kg: goalWeightKg,
            movement_goals: movementGoals,
            dietary_preferences: dietaryPrefs,
            dietary_dislikes: dietaryDislikes,
            calorie_target: m.calories,
            protein_target_g: m.proteinG,
            carb_target_g: m.carbG,
            fat_target_g: m.fatG,
            last_period_date: lastPeriodDate ? format(lastPeriodDate, "yyyy-MM-dd") : null,
            cycle_status: cycleStatus ?? "cycling",
            meal_prep_day: mealPrepDay,
            cycle_mode: cycleStatus ?? "cycling",
            equipment_preference: equipmentPref,
          } as any, { onConflict: "user_id" });

        // ── Start the member on the training path Today and Move show ──
        if (!getSelectedPathId()) setSelectedPathId(pathForOnboarding(movementGoals[0], equipmentPref, fitnessLevel));
        const path = getSelectedPath();
        const next = path ? getNextSession(path) : null;
        if (path && next) {
          setFirstSession({
            plan: path.name,
            name: next.session.name,
            detail: [next.session.durationMin ? `${next.session.durationMin} min` : null, next.session.equipment].filter(Boolean).join(" · "),
            moves: plannedExercises(next.session).slice(0, 4).map(e => e.exercise_name),
          });
        }

        // Use the same validated library plan as the nutrition planner.
        const dietPrefMap: Record<string, string> = {
          vegetarian: "Vegetarian", vegan: "Vegan", gluten_free: "Gluten-free",
          dairy_free: "Dairy-free", pescatarian: "Pescatarian",
        };
        const nutritionPrefs: PrepPreferences = {
          breakfast: "rotate", lunch: "rotate", dinner: "mix",
          prepDays: [mealPrepDay || "Sunday"], adults: 1, kids: 0,
          dietTypes: dietaryPrefs.map(d => dietPrefMap[d]).filter(Boolean),
          dislikes: dietaryDislikes.join(", "), calorieTarget: String(m.calories),
        };
        savePreferences(nutritionPrefs);
        try {
          saveAIMealPlan(buildDbMealPlanFull(nutritionPrefs));
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Your meal plan could not be created. Please try again in Eat.");
        }
      }

      // Keep localStorage fallbacks for existing consumers
      try {
        const existing = JSON.parse(localStorage.getItem("signal_fitness_profile") || "{}");
        localStorage.setItem("signal_fitness_profile", JSON.stringify({
          ...existing,
          level: fitnessLevel || existing.level || "beginner",
        }));
      } catch { /* ignore */ }

      // Her dream becomes her first journal entry; the habits she kept join her list.
      if (dream.trim()) saveEntries([dreamJournalEntry(dream), ...loadEntries()]);
      const newHabits = habitsFromDream(chosenHabits, getHabits());
      if (newHabits.length) saveHabits([...getHabits(), ...newHabits]);
      if (cycleStatus) localStorage.setItem("cycleMode", cycleStatus);

      localStorage.setItem("signal_onboarding_complete", "true");
      localStorage.setItem("cycleModeSelected", "true");
      trackEvent("onboarding_completed", {
        goals_count: movementGoals.length,
        cycle_status: cycleStatus,
        fitness_level: fitnessLevel,
        has_dietary_prefs: dietaryPrefs.length > 0,
      });
    } catch {
      // non-fatal — user still lands on home screen
    }
    setSaving(false);
    setReady(true);
  };

  // ── canAdvance logic per step
  const canAdvance = (): boolean => {
    if (stepId === "welcome") return name.trim().length > 0;
    if (stepId === "cycle") return !!cycleStatus;
    if (stepId === "movement_goals") return movementGoals.length > 0;
    if (stepId === "fitness_level") return !!fitnessLevel;
    if (stepId === "equipment") return !!equipmentPref;
    return true;
  };

  const showProgress = step >= 1 && stepId !== "generating";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(280 30% 20%) 100%)" }}
    >
      <div className="relative z-10 w-full max-w-md px-6 pt-10 pb-36 min-h-screen">

        {/* Step progress bar */}
        {showProgress && (
          <div className="flex justify-center gap-1.5 mb-8">
            {FLOW.slice(1, -1).map((_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-all duration-400",
                  s === step ? "w-8 bg-white" : s < step ? "w-4 bg-white/60" : "w-4 bg-white/20"
                )}
              />
            ))}
          </div>
        )}

        {/* Back button */}
        {step > 0 && stepId !== "generating" && (
          <button
            onClick={back}
            className="absolute top-10 left-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors font-body text-sm z-20"
          >
            <ArrowLeft className="h-4 w-4" /> Back a step
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* ───── Step 0: Welcome ───── */}
          {stepId === "welcome" && (
            <motion.div key="welcome" {...slide} className="text-center space-y-8 pt-4">
              <div className="flex justify-center">
                <img src={iconCream} alt="Signal" className="w-16 h-16" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-bold text-white tracking-wide uppercase">Signal</h1>
                <p className="font-display text-lg text-white/90 italic leading-relaxed">
                  Tune into your inner self.
                </p>
                <p className="font-body text-sm text-white/60 leading-relaxed">
                  A few quiet questions, about three minutes. Your answers shape the way we'll meet you.
                </p>
              </div>
              <div className="space-y-3 pt-4 text-left">
                <label className="font-body text-sm font-medium text-white/80 block">
                  What would you like us to call you?
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The name you answer to"
                  className="text-base h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && next()}
                />
              </div>
              <Button
                onClick={next}
                disabled={!name.trim()}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90 disabled:opacity-40"
              >
                Come in <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="font-body text-[10px] text-white/35 text-center leading-relaxed pt-2">
                Signal offers wellness guidance, not medical advice. For anything that needs a clinician, please reach for one.
              </p>
            </motion.div>
          )}

          {/* ───── Step 1: Your Body ───── */}
          {stepId === "dream" && (
            <motion.div key="dream" {...slide} className="space-y-6 pt-8">
              <StepHeading title="My Dream Life looks like…" sub="Write freely, a line or a page. It stays private and becomes your first journal entry." />
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                rows={7}
                aria-label="My Dream Life looks like"
                placeholder="Slow mornings with my kids. Strong enough to carry the shopping and the toddler. Calm when the day gets loud…"
                className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 text-white placeholder:text-white/40 font-body text-base leading-relaxed focus:outline-none focus:border-white/50"
              />
              <ul className="space-y-1 font-body text-xs text-white/50">
                {DREAM_QUESTIONS.map((q) => <li key={q}>· {q}</li>)}
              </ul>
              <NextButton onClick={reflect} label={dream.trim() ? "This is my dream" : "Skip for now"} />
            </motion.div>
          )}

          {stepId === "reflect" && (
            <motion.div key="reflect" {...slide} className="space-y-6 pt-8 pb-8">
              <StepHeading title={dream.trim() ? "Here's what we heard" : "A gentle place to start"} sub="Keep what fits and let the rest go. You can change any of this later." />
              {dream.trim() && (
                <blockquote className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 font-editorial text-sm italic text-white/80">
                  “{dream.trim().length > 180 ? `${dream.trim().slice(0, 180)}…` : dream.trim()}”
                </blockquote>
              )}
              <div className="space-y-2">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-white/60">Ways to move that fit</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.goals.map((id) => {
                    const goal = MOVEMENT_GOALS.find((g) => g.id === id);
                    if (!goal) return null;
                    const on = movementGoals.includes(id);
                    return (
                      <button key={id} onClick={() => toggleGoal(id)} aria-pressed={on}
                        className={cn("rounded-full border px-4 py-2 font-body text-sm transition-colors", on ? "bg-white text-primary border-white" : "border-white/30 text-white/80")}>
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-body text-xs uppercase tracking-[0.18em] text-white/60">Small daily habits</p>
                <div className="space-y-2">
                  {suggestions.habits.map((habit) => {
                    const on = chosenHabits.some((h) => h.name === habit.name);
                    return (
                      <button key={habit.name} onClick={() => toggleHabit(habit)} aria-pressed={on}
                        className={cn("w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-body text-sm transition-colors", on ? "bg-white text-primary border-white" : "border-white/30 text-white/80")}>
                        {habit.name}
                        {on && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <NextButton onClick={next} label="Keep these" />
            </motion.div>
          )}

          {stepId === "body" && (
            <motion.div key="body" {...slide} className="space-y-6 pt-8">
              <StepHeading title="A little about your body" sub="Optional. Just enough to shape your numbers. Stays with you, never shared." />

              {/* Date of birth */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">Your birthday</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-body text-base rounded-xl bg-white/10 border-white/20 hover:bg-white/20",
                        dob ? "text-white" : "text-white/40"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4 text-white/60" />
                      {dob ? format(dob, "d MMMM yyyy") : "Choose your day"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                      defaultMonth={new Date(1990, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1940}
                      toYear={new Date().getFullYear() - 13}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-body text-sm font-medium text-white/80">Where you are today</label>
                  <div className="flex rounded-lg overflow-hidden border border-white/20">
                    {(["kg", "lbs"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => switchWeightUnit(u)}
                        className={cn(
                          "px-3 py-1 text-xs font-body font-medium transition-colors",
                          weightUnit === u ? "bg-white text-primary" : "bg-white/10 text-white/60"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  value={weightDisplay}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder={weightUnit === "kg" ? "65" : "143"}
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-body text-base"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-body text-sm font-medium text-white/80">Height</label>
                  <div className="flex rounded-lg overflow-hidden border border-white/20">
                    {(["cm", "ft"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => switchHeightUnit(u)}
                        className={cn(
                          "px-3 py-1 text-xs font-body font-medium transition-colors",
                          heightUnit === u ? "bg-white text-primary" : "bg-white/10 text-white/60"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {heightUnit === "cm" ? (
                  <Input
                    type="number"
                    value={heightCm || ""}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    placeholder="165"
                    className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-body text-base"
                  />
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-12">
                        <button onClick={() => handleFtInChange(ftVal - 1, inVal)} className="text-white/60 hover:text-white"><Minus className="h-3 w-3" /></button>
                        <span className="flex-1 text-center font-body text-base text-white">{ftVal} ft</span>
                        <button onClick={() => handleFtInChange(ftVal + 1, inVal)} className="text-white/60 hover:text-white"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-12">
                        <button onClick={() => handleFtInChange(ftVal, inVal - 1)} className="text-white/60 hover:text-white"><Minus className="h-3 w-3" /></button>
                        <span className="flex-1 text-center font-body text-base text-white">{inVal} in</span>
                        <button onClick={() => handleFtInChange(ftVal, inVal + 1)} className="text-white/60 hover:text-white"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Goal weight (optional) */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">
                  Where you'd like to be <span className="text-white/40 font-normal">(only if it feels right)</span>
                </label>
                <Input
                  type="number"
                  value={goalWeightDisplay}
                  onChange={(e) => handleGoalWeightChange(e.target.value)}
                  placeholder={weightUnit === "kg" ? "58" : "128"}
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-body text-base"
                />
              </div>

              <p className="font-body text-xs text-white/40 leading-relaxed">
                Held privately, used only to shape your numbers. You can soften or change any of this any time.
              </p>

              <NextButton onClick={next} label={dob || weightKg > 0 || heightCm > 0 ? "Next" : "Skip for now"} />
            </motion.div>
          )}

          {/* ───── Step 2: Your Cycle ───── */}
          {stepId === "cycle" && (
            <motion.div key="cycle" {...slide} className="space-y-6 pt-8 pb-8">
              <StepHeading title="Listening to your cycle" sub="This shapes how we move and eat alongside your body each week." />

              <div className="space-y-3">
                {CYCLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { haptic("light"); setCycleStatus(opt.id); }}
                    className={cn(
                      "w-full rounded-2xl p-5 text-left transition-all border",
                      cycleStatus === opt.id
                        ? "bg-white border-white shadow-lg"
                        : "bg-white/10 border-white/15 hover:bg-white/15"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn(
                          "font-display text-base font-bold",
                          cycleStatus === opt.id ? "text-primary" : "text-white"
                        )}>{opt.title}</p>
                        <p className={cn(
                          "font-body text-sm mt-0.5",
                          cycleStatus === opt.id ? "text-primary/70" : "text-white/60"
                        )}>{opt.desc}</p>
                      </div>
                      {cycleStatus === opt.id && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Period date picker — only for 'cycling' */}
              <AnimatePresence>
                {cycleStatus === "cycling" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="font-body text-sm font-medium text-white/80">
                        When did your last bleed begin?
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-body text-base rounded-xl bg-white/10 border-white/20 hover:bg-white/20",
                              lastPeriodDate ? "text-white" : "text-white/40"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4 text-white/60" />
                            {lastPeriodDate ? format(lastPeriodDate, "PPP") : "Choose a day"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={lastPeriodDate}
                            onSelect={setLastPeriodDate}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="font-body text-sm font-medium text-white/80">
                        How long, on average, between bleeds
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { haptic("light"); setCycleLength((l) => Math.max(21, l - 1)); }}
                          className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-center">
                          <span className="font-display text-3xl font-bold text-white">{cycleLength}</span>
                          <span className="font-body text-sm text-white/50 ml-1">days</span>
                        </div>
                        <button
                          onClick={() => { haptic("light"); setCycleLength((l) => Math.min(35, l + 1)); }}
                          className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-body text-xs text-white/40 text-center">If you're not sure, 28 is a soft place to start.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <NextButton onClick={next} disabled={!cycleStatus} label="Begin, gently" />
            </motion.div>
          )}

          {/* ───── Step 3: Movement Goals ───── */}
          {stepId === "movement_goals" && (
            <motion.div key="movement" {...slide} className="space-y-6 pt-8">
              <StepHeading title="What's calling you to move?" sub="Choose anything that lands. We'll shape your weeks around it." />

              <div className="flex flex-wrap gap-2.5">
                {MOVEMENT_GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={cn(
                      "rounded-full px-4 py-2 font-body text-sm font-medium transition-all border",
                      movementGoals.includes(g.id)
                        ? "bg-white text-primary border-white shadow-md"
                        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {movementGoals.length === 0 && (
                <p className="font-body text-xs text-white/40">Choose at least one to keep going.</p>
              )}

              <NextButton onClick={next} disabled={movementGoals.length === 0} />
            </motion.div>
          )}

          {/* ───── Step 4: Nutrition Goals ───── */}
          {stepId === "nutrition" && (
            <motion.div key="nutrition" {...slide} className="space-y-6 pt-8">
              <StepHeading title="How would you like to eat?" />

              {/* Calculated targets */}
              {macros && (
                <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-3">
                  <p className="font-body text-xs text-white/60 uppercase tracking-wide">A starting place, shaped by what you've shared:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Calories", value: macros.calories, unit: "kcal" },
                      { label: "Protein", value: macros.proteinG, unit: "g" },
                      { label: "Carbs", value: macros.carbG, unit: "g" },
                      { label: "Fat", value: macros.fatG, unit: "g" },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="font-display text-xl font-bold text-white">{m.value}</p>
                        <p className="font-body text-xs text-white/50">{m.unit}</p>
                        <p className="font-body text-xs text-white/40 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-xs text-white/40">Soften or shift these any time in Account.</p>
                </div>
              )}

              {/* Dietary preferences */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">How you eat</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_PREFERENCES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePref(p.id)}
                      className={cn(
                        "rounded-full px-4 py-2 font-body text-sm font-medium transition-all border",
                        dietaryPrefs.includes(p.id)
                          ? "bg-white text-primary border-white shadow-md"
                          : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dislikes tag input */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">
                  Foods your body would rather not see <span className="text-white/40 font-normal">(only if any come to mind)</span>
                </label>
                <div className="min-h-12 rounded-xl bg-white/10 border border-white/20 px-3 py-2 flex flex-wrap gap-2 items-center cursor-text"
                  onClick={() => document.getElementById("dislike-input")?.focus()}
                >
                  {dietaryDislikes.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-white/20 text-white text-xs font-body rounded-full px-2.5 py-1">
                      {tag}
                      <button onClick={(e) => { e.stopPropagation(); removeDislike(tag); }} className="hover:text-white/60">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="dislike-input"
                    value={dislikeInput}
                    onChange={(e) => setDislikeInput(e.target.value)}
                    onKeyDown={handleDislikeKeyDown}
                    onBlur={() => { if (dislikeInput.trim()) addDislike(dislikeInput); }}
                    placeholder={dietaryDislikes.length === 0 ? "mushrooms, capsicum, tofu…" : "Add another…"}
                    className="flex-1 min-w-24 bg-transparent border-none outline-none text-sm font-body text-white placeholder:text-white/30"
                  />
                </div>
                <p className="font-body text-xs text-white/40">Press Enter or comma to add each one.</p>
              </div>

              {/* Meal prep day */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">
                  A day to gather your week's food <span className="text-white/40 font-normal">(only if it helps)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => { haptic("light"); setMealPrepDay(mealPrepDay === day ? null : day); }}
                      className={cn(
                        "rounded-full px-3 py-2 font-body text-sm font-medium transition-all border",
                        mealPrepDay === day
                          ? "bg-white text-primary border-white shadow-md"
                          : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <NextButton onClick={next} label="Keep going" />
            </motion.div>
          )}

          {/* ───── Step 5: Fitness Level ───── */}
          {stepId === "fitness_level" && (
            <motion.div key="fitness" {...slide} className="space-y-6 pt-8">
              <StepHeading title="Where are you, today?" sub="Honestly, wherever that is. We'll meet you there." />

              <div className="space-y-3">
                {FITNESS_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => { haptic("light"); setFitnessLevel(lvl.id); }}
                    className={cn(
                      "w-full rounded-2xl p-5 text-left transition-all border",
                      fitnessLevel === lvl.id
                        ? "bg-white border-white shadow-lg"
                        : "bg-white/10 border-white/15 hover:bg-white/15"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn(
                          "font-display text-lg font-bold",
                          fitnessLevel === lvl.id ? "text-primary" : "text-white"
                        )}>{lvl.label}</p>
                        <p className={cn(
                          "font-body text-sm mt-1",
                          fitnessLevel === lvl.id ? "text-primary/70" : "text-white/60"
                        )}>{lvl.desc}</p>
                      </div>
                      {fitnessLevel === lvl.id && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <NextButton onClick={next} disabled={!fitnessLevel} />
            </motion.div>
          )}

          {/* ───── Step 6: Equipment ───── */}
          {stepId === "equipment" && (
            <motion.div key="equipment" {...slide} className="space-y-6 pt-8">
              <StepHeading title="What do you have around you?" sub="We'll shape your sessions to match what's already there." />

              <div className="space-y-3">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { haptic("light"); setEquipmentPref(opt.id); }}
                    className={cn(
                      "w-full rounded-2xl p-5 text-left transition-all border",
                      equipmentPref === opt.id
                        ? "bg-white border-white shadow-lg"
                        : "bg-white/10 border-white/15 hover:bg-white/15"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cn(
                          "font-display text-lg font-bold",
                          equipmentPref === opt.id ? "text-primary" : "text-white"
                        )}>{opt.label}</p>
                        <p className={cn(
                          "font-body text-sm mt-1",
                          equipmentPref === opt.id ? "text-primary/70" : "text-white/60"
                        )}>{opt.desc}</p>
                      </div>
                      {equipmentPref === opt.id && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <NextButton onClick={next} disabled={!equipmentPref} />
            </motion.div>
          )}

          {/* ───── Step 7: Generating Plan ───── */}
          {stepId === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] space-y-10 text-center"
            >
              {/* Animated logo pulse */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={iconCream} alt="Signal" className="w-[72px] h-[72px]" />
              </motion.div>

              {ready ? (
                <div className="w-full max-w-sm space-y-6">
                  <p className="font-display text-xl font-bold text-white">Your Signal is here.</p>
                  {firstSession && (
                    <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 text-left space-y-2">
                      <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/60">Your first session · {firstSession.plan}</p>
                      <p className="font-display text-lg font-bold text-white">{firstSession.name}</p>
                      {firstSession.detail && <p className="font-body text-sm text-white/70">{firstSession.detail}</p>}
                      {firstSession.moves.length > 0 && <p className="font-body text-sm text-white/80">{firstSession.moves.join(" · ")}</p>}
                    </div>
                  )}
                  <NextButton onClick={onComplete} label="Begin" />
                </div>
              ) : (
              <>
              {/* Loading messages */}
              <div className="space-y-3 min-h-[80px]">
                {LOADING_MESSAGES.map((msg, i) => (
                  <AnimatePresence key={msg}>
                    {i <= loadingMsgIndex && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: i === loadingMsgIndex ? 1 : 0.35 }}
                        className={cn(
                          "font-body text-base leading-relaxed transition-all",
                          i === loadingMsgIndex ? "text-white" : "text-white/35",
                          i === LOADING_MESSAGES.length - 1 && "font-display text-xl font-bold text-white"
                        )}
                      >
                        {msg}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {loadingMsgIndex < LOADING_MESSAGES.length - 1 && (
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              )}
              </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
