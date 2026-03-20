import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WildStar } from "@/components/BotanicalElements";
import { setLastPeriodStart } from "@/lib/cycle-utils";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: Props) {
  const { user } = useAuth();
  const { updateDisplayName } = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [cycleDate, setCycleDate] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  const handleNameNext = () => {
    if (name.trim()) setStep(1);
  };

  const handleFinish = async () => {
    setSaving(true);
    if (user && name.trim()) {
      await updateDisplayName(name.trim());
    }
    if (cycleDate) {
      setLastPeriodStart(format(cycleDate, "yyyy-MM-dd"));
    }
    localStorage.setItem("signal_onboarding_complete", "true");
    setSaving(false);
    onComplete();
  };

  const handleSkipCycle = async () => {
    setSaving(true);
    if (user && name.trim()) {
      await updateDisplayName(name.trim());
    }
    localStorage.setItem("signal_onboarding_complete", "true");
    setSaving(false);
    onComplete();
  };

  const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-name" {...fade} className="text-center space-y-8">
              <div className="flex justify-center">
                <WildStar size={40} color="hsl(var(--primary))" />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Welcome to Signal
                </h1>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  Your cycle-synced wellness companion. Let's personalise your experience.
                </p>
              </div>

              <div className="space-y-4">
                <label className="font-body text-sm font-medium text-foreground block text-left">
                  What should we call you?
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ash"
                  className="text-base h-12 rounded-xl bg-card border-border"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                />
              </div>

              <Button
                onClick={handleNameNext}
                disabled={!name.trim()}
                className="w-full h-12 rounded-full font-display text-base font-semibold gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-cycle" {...fade} className="text-center space-y-8">
              <div className="space-y-3">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Hi, {name.trim()} ✦
                </h1>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  When did your last period start? This helps us sync your guidance to your cycle.
                </p>
              </div>

              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[260px] h-12 justify-start text-left font-body text-base rounded-xl",
                        !cycleDate && "text-muted-foreground"
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

              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  disabled={!cycleDate || saving}
                  className="w-full h-12 rounded-full font-display text-base font-semibold gap-2"
                >
                  {saving ? "Setting up…" : "Get started"} <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  onClick={handleSkipCycle}
                  disabled={saving}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now — I'll set this up later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-10">
          {[0, 1].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-primary" : "w-3 bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
