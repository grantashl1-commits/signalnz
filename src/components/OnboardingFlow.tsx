import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CalendarDays, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WildStar } from "@/components/BotanicalElements";
import SignalLogo from "@/components/SignalLogo";
import { setLastPeriodStart } from "@/lib/cycle-utils";
import { useCycle } from "@/contexts/CycleContext";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onComplete: () => void;
}

const TOTAL_STEPS = 6;

const GOALS = [
  { id: "energy", label: "Energy & Vitality" },
  { id: "mood", label: "Mood & Hormones" },
  { id: "fitness", label: "Fitness & Strength" },
  { id: "weight", label: "Weight & Metabolism" },
  { id: "fertility", label: "Fertility Awareness" },
  { id: "wellness", label: "General Wellness" },
];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to regular exercise or getting back into it" },
  { id: "intermediate", label: "Intermediate", desc: "Consistent training 2–4 times per week" },
  { id: "advanced", label: "Advanced", desc: "Experienced athlete training 4+ times per week" },
];

const fade = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function OnboardingFlow({ onComplete }: Props) {
  const { user } = useAuth();
  const { updateDisplayName } = useProfile();
  const { setCycleStartDate } = useCycle();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [cycleDate, setCycleDate] = useState<Date | undefined>();
  const [cycleLength, setCycleLength] = useState(28);
  const [goal, setGoal] = useState<string | null>(null);
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const next = () => { haptic("light"); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const back = () => { haptic("light"); setStep((s) => Math.max(s - 1, 0)); };

  const canAdvance = (): boolean => {
    if (step === 0) return true;
    if (step === 1) return !!cycleDate;
    if (step === 2) return true;
    if (step === 3) return !!goal;
    if (step === 4) return !!fitnessLevel;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save display name
      if (user && name.trim()) {
        await updateDisplayName(name.trim());
      }

      // Save cycle date
      if (cycleDate) {
        const dateStr = format(cycleDate, "yyyy-MM-dd");
        setLastPeriodStart(dateStr);
        setCycleStartDate(dateStr);
      }

      // Save goal, fitness level, cycle length, onboarding flag to profiles
      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            user_id: user.id,
            display_name: name.trim() || null,
            primary_goal: goal,
            fitness_level: fitnessLevel,
            cycle_length: cycleLength,
            onboarding_complete: true,
          }, { onConflict: "user_id" });
      }

      // Also save fitness level to localStorage for existing fitness-profile consumers
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
    onComplete();
  };

  // Progress dots for steps 1-4
  const showProgress = step >= 1 && step <= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(280 30% 20%) 100%)" }}
    >
      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* Progress indicator */}
        {showProgress && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  s === step ? "w-8 bg-white" : s < step ? "w-3 bg-white/60" : "w-3 bg-white/20"
                )}
              />
            ))}
          </div>
        )}

        {/* Back button */}
        {step > 0 && step < 5 && (
          <button onClick={back} className="absolute top-10 left-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors font-body text-sm z-20">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* ── Screen 1: Welcome ── */}
          {step === 0 && (
            <motion.div key="welcome" {...fade} className="text-center space-y-8">
              <div className="flex justify-center">
                <img src="/logos/Icon.png" alt="Signal" className="h-16 w-16 object-contain" />
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-bold text-white tracking-wide uppercase">Signal</h1>
                <p className="font-display text-lg text-white/90 italic leading-relaxed">
                  Your body speaks. Signal listens.
                </p>
                <p className="font-body text-sm text-white/60 leading-relaxed">
                  Let's set up your personal rhythm. Takes 2 minutes.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <label className="font-body text-sm font-medium text-white/80 block text-left">
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
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                Begin <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Screen 2: Period Start Date ── */}
          {step === 1 && (
            <motion.div key="period" {...fade} className="text-center space-y-8 pt-8">
              <div className="space-y-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                  When did your last period start?
                </h1>
                <p className="font-body text-sm text-white/60">
                  This is how we calculate your current phase.
                </p>
              </div>

              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[260px] h-12 justify-start text-left font-body text-base rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20",
                        !cycleDate && "text-white/50"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {cycleDate ? format(cycleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={cycleDate}
                      onSelect={setCycleDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={next}
                disabled={!cycleDate}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Screen 3: Cycle Length ── */}
          {step === 2 && (
            <motion.div key="length" {...fade} className="text-center space-y-8 pt-8">
              <div className="space-y-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                  How long is your typical cycle?
                </h1>
                <p className="font-body text-sm text-white/60">
                  Not sure? 28 is a great starting point.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => { haptic("light"); setCycleLength((l) => Math.max(21, l - 1)); }}
                  className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="font-display text-5xl font-bold text-white">{cycleLength}</span>
                  <p className="font-body text-sm text-white/50 mt-1">days</p>
                </div>
                <button
                  onClick={() => { haptic("light"); setCycleLength((l) => Math.min(35, l + 1)); }}
                  className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <Button
                onClick={next}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Screen 4: Primary Goal ── */}
          {step === 3 && (
            <motion.div key="goal" {...fade} className="text-center space-y-8 pt-8">
              <div className="space-y-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                  What matters most to you right now?
                </h1>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { haptic("light"); setGoal(g.id); }}
                    className={cn(
                      "rounded-full px-5 py-2.5 font-body text-sm font-medium transition-all border",
                      goal === g.id
                        ? "bg-white text-primary border-white shadow-lg"
                        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={next}
                disabled={!goal}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Screen 5: Fitness Level ── */}
          {step === 4 && (
            <motion.div key="fitness" {...fade} className="text-center space-y-8 pt-8">
              <div className="space-y-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                  How would you describe your current fitness?
                </h1>
              </div>

              <div className="space-y-3">
                {FITNESS_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => { haptic("light"); setFitnessLevel(lvl.id); }}
                    className={cn(
                      "w-full rounded-2xl p-5 text-left transition-all border",
                      fitnessLevel === lvl.id
                        ? "bg-white text-primary border-white shadow-lg"
                        : "bg-white/10 text-white border-white/15 hover:bg-white/15"
                    )}
                  >
                    <p className={cn(
                      "font-display text-lg font-bold",
                      fitnessLevel === lvl.id ? "text-primary" : "text-white"
                    )}>{lvl.label}</p>
                    <p className={cn(
                      "font-body text-sm mt-1",
                      fitnessLevel === lvl.id ? "text-primary/70" : "text-white/60"
                    )}>{lvl.desc}</p>
                  </button>
                ))}
              </div>

              <Button
                onClick={next}
                disabled={!fitnessLevel}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* ── Screen 6: All Done ── */}
          {step === 5 && (
            <motion.div key="done" {...fade} className="text-center space-y-8">
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <WildStar size={48} color="white" />
                </motion.div>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                  Your signal is ready{name.trim() ? `, ${name.trim()}` : ""}.
                </h1>
                <p className="font-body text-base text-white/70 leading-relaxed max-w-sm mx-auto">
                  We've tuned Signal to your cycle. Everything updates as your body moves through each phase.
                </p>
              </div>

              <Button
                onClick={handleFinish}
                disabled={saving}
                className="w-full h-14 rounded-full font-display text-lg font-semibold gap-2 bg-white text-primary hover:bg-white/90"
              >
                {saving ? "Setting up…" : "See my signal"} <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
