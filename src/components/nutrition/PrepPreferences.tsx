import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import {
  PrepPreferences as PrepPrefsType,
  BreakfastPref,
  LunchPref,
  DinnerPref,
  savePreferences,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface Props {
  initialPrefs: PrepPrefsType;
  phase: Phase;
  onBuild: (prefs: PrepPrefsType) => void;
}

function RadioCard({ selected, label, description, onSelect }: { selected: boolean; label: string; description?: string; onSelect: () => void }) {
  return (
    <button
      onClick={() => { haptic("light"); onSelect(); }}
      className={`touch-card w-full text-left rounded-xl p-3 min-h-[48px] border transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={selected ? { borderColor: "hsl(var(--primary))" } : { borderColor: "hsl(var(--border))" }}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <div>
          <p className="font-body text-xs text-foreground">{label}</p>
          {description && <p className="font-body text-[10px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>{description}</p>}
        </div>
      </div>
    </button>
  );
}

export default function PrepPreferences({ initialPrefs, phase, onBuild }: Props) {
  const [breakfast, setBreakfast] = useState<BreakfastPref>(initialPrefs.breakfast);
  const [lunch, setLunch] = useState<LunchPref>(initialPrefs.lunch);
  const [dinner, setDinner] = useState<DinnerPref>(initialPrefs.dinner);
  const [prepDays, setPrepDays] = useState<string[]>(initialPrefs.prepDays);
  const [adults, setAdults] = useState(initialPrefs.adults);
  const [kids, setKids] = useState(initialPrefs.kids);
  const phaseColor = PHASE_HEX[phase];

  const togglePrepDay = (day: string) => {
    haptic("light");
    setPrepDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleBuild = () => {
    const prefs: PrepPrefsType = { breakfast, lunch, dinner, prepDays, adults, kids };
    savePreferences(prefs);
    onBuild(prefs);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">How does your week work?</h2>
        <p className="font-body text-sm text-muted-foreground mt-1 italic" style={{ fontWeight: 300 }}>
          Tell us once. We'll plan around you.
        </p>
      </div>

      {/* Breakfast */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Breakfast</p>
        <RadioCard selected={breakfast === "batch"} label="I'll prep overnight oats on Sunday for the whole week." description="Same breakfast every day." onSelect={() => setBreakfast("batch")} />
        <RadioCard selected={breakfast === "rotate"} label="I'll batch cook 2–3 options and rotate." onSelect={() => setBreakfast("rotate")} />
        <RadioCard selected={breakfast === "variety"} label="I prefer variety — different each day." onSelect={() => setBreakfast("variety")} />
      </div>

      {/* Lunch */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Lunch</p>
        <RadioCard selected={lunch === "batch"} label="I'll roast a tray of tofu + veg + cook rice on Sunday." description="Use that for all lunches." onSelect={() => setLunch("batch")} />
        <RadioCard selected={lunch === "rotate"} label="I'll make 2–3 lunch options and rotate." onSelect={() => setLunch("rotate")} />
        <RadioCard selected={lunch === "variety"} label="I prefer variety — different each day." onSelect={() => setLunch("variety")} />
      </div>

      {/* Dinner */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Dinner</p>
        <RadioCard selected={dinner === "double"} label="Cook dinner 2× serving size — I'll reheat leftovers the next night." description="This halves unique dinners: 4 meals covers 7 nights." onSelect={() => setDinner("double")} />
        <RadioCard selected={dinner === "fresh"} label="I prefer a fresh dinner each night." onSelect={() => setDinner("fresh")} />
        <RadioCard selected={dinner === "mix"} label="Mix — some nights reheat, some fresh." onSelect={() => setDinner("mix")} />
      </div>

      {/* Prep day */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>When can you do your main prep?</p>
        <div className="flex flex-wrap gap-2">
          {["Sunday", "Saturday", "Wednesday", "No set day"].map((day) => (
            <button
              key={day}
              onClick={() => togglePrepDay(day)}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                prepDays.includes(day) ? "text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
              style={prepDays.includes(day) ? { backgroundColor: phaseColor, color: "white" } : {}}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-3">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Cooking for</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Adults:</span>
            <button onClick={() => { haptic("light"); setAdults(Math.max(1, adults - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-mono text-sm font-bold" style={{ color: phaseColor }}>{adults}</span>
            <button onClick={() => { haptic("light"); setAdults(Math.min(6, adults + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Kids:</span>
            <button onClick={() => { haptic("light"); setKids(Math.max(0, kids - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-mono text-sm font-bold" style={{ color: phaseColor }}>{kids}</span>
            <button onClick={() => { haptic("light"); setKids(Math.min(6, kids + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
        </div>
        {kids > 0 && (
          <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
            Kids portions auto-calculate as 0.6× adult.
          </p>
        )}
      </div>

      {/* Build button */}
      <button
        onClick={handleBuild}
        className="touch-btn w-full rounded-[14px] py-3.5 min-h-[52px] font-body text-sm font-bold text-white transition-all active:opacity-90"
        style={{ backgroundColor: phaseColor }}
      >
        Build my plan →
      </button>
    </div>
  );
}
