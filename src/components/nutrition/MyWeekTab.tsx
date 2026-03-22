import { useState, useEffect } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useCycle } from "@/contexts/CycleContext";
import { Phase, PHASE_SHORT, PHASE_DAYS } from "@/lib/cycle-utils";
import PrepPreferences from "./PrepPreferences";
import WeeklyPlanView from "./WeeklyPlanView";
import SmartShoppingList from "./SmartShoppingList";
import {
  PrepPreferences as PrepPrefsType,
  WeeklyPlan,
  generateWeeklyPlan,
  saveWeeklyPlan,
  getWeeklyPlan,
  getSavedPreferences,
  DEFAULT_PREFS,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

type Step = "prep" | "plan" | "shop";
const STEPS: { id: Step; label: string }[] = [
  { id: "prep", label: "Prep" },
  { id: "plan", label: "Plan" },
  { id: "shop", label: "Shop" },
];

export default function MyWeekTab({ onPlanSaved, onSaveToToday }: { onPlanSaved?: () => void; onSaveToToday?: () => void }) {
  const info = getCycleInfo(getLastPeriodStart());
  const phaseColor = PHASE_HEX[info.phase];
  const [step, setStep] = useState<Step>("prep");
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [prefs, setPrefs] = useState<PrepPrefsType>(getSavedPreferences() || DEFAULT_PREFS);

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
    onPlanSaved?.();
    setStep("plan");
  };

  const handleProceedToShop = () => {
    haptic("medium");
    setStep("shop");
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

      {/* Steps — no saved weeks */}
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
          onPlanSaved={onPlanSaved}
          onSaveToToday={onSaveToToday}
        />
      )}

      {step === "shop" && plan && (
        <SmartShoppingList plan={plan} phase={info.phase} />
      )}
    </div>
  );
}
