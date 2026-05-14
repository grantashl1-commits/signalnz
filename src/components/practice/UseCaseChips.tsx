import { Sun, Moon, Activity, AlertCircle, Sparkles } from "lucide-react";

export type BreathworkUseCase = "all" | "morning" | "anxious" | "pre-workout" | "before-bed";

export const USE_CASE_PRACTICE_KEYS: Record<Exclude<BreathworkUseCase, "all">, string[]> = {
  morning: ["coherent-breathing", "box-breathing"],
  anxious: ["physiological-sigh", "four-seven-eight"],
  "pre-workout": ["box-breathing", "coherent-breathing"],
  "before-bed": ["four-seven-eight", "coherent-breathing"],
};

const CHIPS: { id: BreathworkUseCase; label: string; Icon: typeof Sun }[] = [
  { id: "all", label: "All", Icon: Sparkles },
  { id: "morning", label: "Morning", Icon: Sun },
  { id: "anxious", label: "Anxious", Icon: AlertCircle },
  { id: "pre-workout", label: "Pre-workout", Icon: Activity },
  { id: "before-bed", label: "Before bed", Icon: Moon },
];

interface Props {
  active: BreathworkUseCase;
  onChange: (v: BreathworkUseCase) => void;
}

export default function UseCaseChips({ active, onChange }: Props) {
  return (
    <div className="-mx-5 px-5 mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 w-max">
        {CHIPS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`touch-btn flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 min-h-[36px] font-body text-xs font-medium transition-all border ${
                on
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
