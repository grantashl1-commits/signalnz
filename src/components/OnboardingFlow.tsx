import { useState, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CalendarDays, Minus, Plus, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SignalLogo from "@/components/SignalLogo";
import { setLastPeriodStart } from "@/lib/cycle-utils";
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

const TOTAL_STEPS = 7;

const MOVEMENT_GOALS = [
  { id: "strength", label: "Build strength" },
  { id: "fat_loss", label: "Lose fat / body recomp" },
  { id: "cardio", label: "Improve fitness & cardio" },
  { id: "stress", label: "Reduce stress & feel calmer" },
  { id: "consistency", label: "Build consistency" },
  { id: "mobility", label: "Flexibility & mobility" },
  { id: "event", label: "Train for an event" },
  { id: "recovery", label: "Recover from injury" },
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
  { id: "beginner", label: "Beginner", desc: "New to structured training or returning after a break" },
  { id: "intermediate", label: "Intermediate", desc: "Training 2–3× per week with some experience" },
  { id: "advanced", label: "Advanced", desc: "Training 4–5× per week, comfortable with complex movements" },
];

const LOADING_MESSAGES = [
  "Analysing your cycle phase...",
  "Building your 4-week training plan...",
  "Preparing your nutrition guide...",
  "Personalising your habit recommendations...",
  "Your Signal is ready.",
];

const CYCLE_OPTIONS = [
  {
    id: "cycling",
    title: "I still get my period",
    desc: "Regular or semi-regular cycles",
  },
  {
    id: "perimenopause",
    title: "Irregular or perimenopause",
    desc: "Cycles changing or unpredictable",
  },
  {
    id: "post_menopause",
    title: "I no longer get my period",
    desc: "Post-menopause or no period",
  },
];

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

  // Navigation
  const [step, setStep] = useState(0);

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

  // Step 4 — Nutrition
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [dietaryDislikes, setDietaryDislikes] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState("");
  const [mealPrepDay, setMealPrepDay] = useState<string | null>(null);

  // Step 5 — Fitness Level
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);

  // Step 6 — Generating
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const next = () => { haptic("light"); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const back = () => { haptic("light"); setStep((s) => Math.max(s - 1, 0)); };

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
    if (step !== 6) return;
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
    if (step === 6 && loadingMsgIndex === LOADING_MESSAGES.length - 1 && !saving) {
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
        setLastPeriodStart(dateStr);
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
          } as any, { onConflict: "user_id" });
      }

      // Keep localStorage fallbacks for existing consumers
      try {
        const existing = JSON.parse(localStorage.getItem("signal_fitness_profile") || "{}");
        localStorage.setItem("signal_fitness_profile", JSON.stringify({
          ...existing,
          level: fitnessLevel || existing.level || "beginner",
        }));
      } catch { /* ignore */ }

      localStorage.setItem("signal_onboarding_complete", "true");
    } catch (e) {
      console.error("Onboarding save error:", e);
    }
    setSaving(false);
    // Small delay so "Your Signal is ready." text is visible
    setTimeout(onComplete, 800);
  };

  // ── canAdvance logic per step
  const canAdvance = (): boolean => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!dob && weightKg > 0 && heightCm > 0;
    if (step === 2) return !!cycleStatus;
    if (step === 3) return movementGoals.length > 0;
    if (step === 4) return true;
    if (step === 5) return !!fitnessLevel;
    return true;
  };

  const showProgress = step >= 1 && step <= 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(280 30% 20%) 100%)" }}
    >
      <div className="relative z-10 w-full max-w-md px-6 py-10 min-h-screen">

        {/* Step progress bar */}
        {showProgress && (
          <div className="flex justify-center gap-1.5 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
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
        {step > 0 && step < 6 && (
          <button
            onClick={back}
            className="absolute top-10 left-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors font-body text-sm z-20"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* ───── Step 0: Welcome ───── */}
          {step === 0 && (
            <motion.div key="welcome" {...slide} className="text-center space-y-8 pt-4">
              <div className="flex justify-center">
                <SignalLogo size={64} className="text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-bold text-white tracking-wide uppercase">Signal</h1>
                <p className="font-display text-lg text-white/90 italic leading-relaxed">
                  Let's get to know you
                </p>
                <p className="font-body text-sm text-white/60 leading-relaxed">
                  This takes 3 minutes. Your answers build your personalised plan.
                </p>
              </div>
              <div className="space-y-3 pt-4 text-left">
                <label className="font-body text-sm font-medium text-white/80 block">
                  What should we call you?
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ash"
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
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ───── Step 1: Your Body ───── */}
          {step === 1 && (
            <motion.div key="body" {...slide} className="space-y-6 pt-8">
              <StepHeading title="Your body" sub="Used to calculate your personalised targets — never shared." />

              {/* Date of birth */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">Date of birth</label>
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
                      {dob ? format(dob, "d MMMM yyyy") : "Select your birthday"}
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
                  <label className="font-body text-sm font-medium text-white/80">Current weight</label>
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
                  Goal weight <span className="text-white/40 font-normal">(optional)</span>
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
                Stored securely and only used to calculate your personalised targets. Update any time in Account settings.
              </p>

              <NextButton onClick={next} disabled={!dob || weightKg <= 0 || heightCm <= 0} />
            </motion.div>
          )}

          {/* ───── Step 2: Your Cycle ───── */}
          {step === 2 && (
            <motion.div key="cycle" {...slide} className="space-y-6 pt-8">
              <StepHeading title="Your cycle" sub="This shapes your training and nutrition recommendations each week." />

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
                        When did your last period start?
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
                            {lastPeriodDate ? format(lastPeriodDate, "PPP") : "Pick a date"}
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
                        Average cycle length
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
                      <p className="font-body text-xs text-white/40 text-center">Not sure? 28 days is a great starting point.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <NextButton onClick={next} disabled={!cycleStatus} />
            </motion.div>
          )}

          {/* ───── Step 3: Movement Goals ───── */}
          {step === 3 && (
            <motion.div key="movement" {...slide} className="space-y-6 pt-8">
              <StepHeading title="What are you training for?" sub="Select all that apply. We'll build your plan around these." />

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
                <p className="font-body text-xs text-white/40">Pick at least one to continue.</p>
              )}

              <NextButton onClick={next} disabled={movementGoals.length === 0} />
            </motion.div>
          )}

          {/* ───── Step 4: Nutrition Goals ───── */}
          {step === 4 && (
            <motion.div key="nutrition" {...slide} className="space-y-6 pt-8">
              <StepHeading title="How would you like to eat?" />

              {/* Calculated targets */}
              {macros && (
                <div className="rounded-2xl bg-white/10 border border-white/15 p-4 space-y-3">
                  <p className="font-body text-xs text-white/60 uppercase tracking-wide">Based on your goals, we suggest:</p>
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
                  <p className="font-body text-xs text-white/40">You can adjust these at any time in Account settings.</p>
                </div>
              )}

              {/* Dietary preferences */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">Dietary preferences</label>
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
                  Ingredients you dislike <span className="text-white/40 font-normal">(optional)</span>
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
                    placeholder={dietaryDislikes.length === 0 ? "e.g. mushrooms, capsicum, tofu" : "Add more..."}
                    className="flex-1 min-w-24 bg-transparent border-none outline-none text-sm font-body text-white placeholder:text-white/30"
                  />
                </div>
                <p className="font-body text-xs text-white/40">Type an ingredient and press Enter or comma to add.</p>
              </div>

              {/* Meal prep day */}
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-white/80">
                  Preferred meal prep day <span className="text-white/40 font-normal">(optional)</span>
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

              <NextButton onClick={next} label="Next" />
            </motion.div>
          )}

          {/* ───── Step 5: Fitness Level ───── */}
          {step === 5 && (
            <motion.div key="fitness" {...slide} className="space-y-6 pt-8">
              <StepHeading title="Where are you starting from?" sub="Be honest — we'll meet you there." />

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

              <NextButton onClick={next} disabled={!fitnessLevel} label="Generate my plan" />
            </motion.div>
          )}

          {/* ───── Step 6: Generating Plan ───── */}
          {step === 6 && (
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
                <SignalLogo size={72} className="text-white" />
              </motion.div>

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
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
