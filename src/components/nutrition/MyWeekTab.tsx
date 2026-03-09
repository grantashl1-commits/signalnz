import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Phase, PHASE_SHORT, getCycleInfo, getLastPeriodStart, PHASE_DAYS } from "@/lib/cycle-utils";
import PrepPreferences from "./PrepPreferences";
import WeeklyPlanView from "./WeeklyPlanView";
import SmartShoppingList from "./SmartShoppingList";
import {
  PrepPreferences as PrepPrefsType,
  WeeklyPlan,
  generateWeeklyPlan,
  saveWeeklyPlan,
  getWeeklyPlan,
  getSavedPlans,
  getSavedPreferences,
  DEFAULT_PREFS,
  formatDateShort,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

type Step = "prep" | "plan" | "shop";
const STEPS: { id: Step; label: string }[] = [
  { id: "prep", label: "Prep" },
  { id: "plan", label: "Plan" },
  { id: "shop", label: "Shop" },
];

export default function MyWeekTab() {
  const info = getCycleInfo(getLastPeriodStart());
  const phaseColor = PHASE_HEX[info.phase];
  const [step, setStep] = useState<Step>("prep");
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [prefs, setPrefs] = useState<PrepPrefsType>(getSavedPreferences() || DEFAULT_PREFS);
  const savedPlans = getSavedPlans();

  // Check for existing plan
  useEffect(() => {
    const existing = getWeeklyPlan();
    if (existing) {
      setPlan(existing);
      setPrefs(existing.prepPreferences);
      setStep("plan");
    }
  }, []);

  const handleBuildPlan = (preferences: PrepPrefsType) => {
    haptic("medium");
    setPrefs(preferences);
    const newPlan = generateWeeklyPlan(preferences);
    setPlan(newPlan);
    saveWeeklyPlan(newPlan);
    setStep("plan");
  };

  const handleProceedToShop = () => {
    haptic("medium");
    setStep("shop");
  };

  const handleRecreatePlan = (savedPlan: WeeklyPlan) => {
    haptic("medium");
    setPrefs(savedPlan.prepPreferences);
    const newPlan = generateWeeklyPlan(savedPlan.prepPreferences);
    setPlan(newPlan);
    saveWeeklyPlan(newPlan);
    setStep("plan");
  };

  const handleStartFresh = () => {
    haptic("light");
    setPlan(null);
    setStep("prep");
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.id === "prep" || (s.id === "plan" && plan) || (s.id === "shop" && plan)) {
                  haptic("light");
                  setStep(s.id);
                }
              }}
              className="flex items-center gap-1.5"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: step === s.id ? phaseColor : "hsl(var(--secondary))",
                  color: step === s.id ? "white" : "hsl(var(--muted-foreground))",
                }}
              >
                {i + 1}
              </div>
              <span
                className="font-body text-xs font-medium"
                style={{ color: step === s.id ? phaseColor : "hsl(var(--muted-foreground))" }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Past plans */}
      {step === "prep" && savedPlans.length > 0 && (
        <div className="space-y-2">
          <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>
            Your saved weeks
          </p>
          <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1">
            {savedPlans.slice(0, 5).map(({ key, plan: savedPlan }) => (
              <button
                key={key}
                onClick={() => handleRecreatePlan(savedPlan)}
                className="touch-card scroll-snap-item flex-shrink-0 w-20 h-24 rounded-xl p-2 text-left"
                style={{
                  backgroundColor: "#F5EDE0",
                  borderTop: `3px solid ${PHASE_HEX[savedPlan.phase]}`,
                }}
              >
                <p className="font-body text-[10px] font-bold text-foreground truncate">
                  {PHASE_SHORT[savedPlan.phase]}
                </p>
                <p className="font-body text-[9px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
                  {formatDateShort(new Date(savedPlan.dateRange.start))} – {formatDateShort(new Date(savedPlan.dateRange.end))}
                </p>
                <RotateCcw className="h-3 w-3 text-muted-foreground mt-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {step === "prep" && (
        <PrepPreferences
          initialPrefs={prefs}
          phase={info.phase}
          onBuild={handleBuildPlan}
        />
      )}

      {step === "plan" && plan && (
        <WeeklyPlanView
          plan={plan}
          phase={info.phase}
          onProceedToShop={handleProceedToShop}
          onStartFresh={handleStartFresh}
        />
      )}

      {step === "shop" && plan && (
        <SmartShoppingList plan={plan} phase={info.phase} />
      )}
    </div>
  );
}
