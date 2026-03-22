import { useState, useEffect, useMemo } from "react";
import { Minus, Plus, Dumbbell } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import {
  PrepPreferences as PrepPrefsType,
  BreakfastPref,
  LunchPref,
  DinnerPref,
  CookingSkill,
  AvailableTime,
  savePreferences,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const BODY_GOAL_LABELS: Record<string, string> = {
  "lose-weight": "Lose weight",
  "gain-muscle": "Build muscle",
  "tone-up": "Tone & define",
  flexibility: "Improve flexibility",
  endurance: "Build endurance",
  "stress-relief": "Stress relief",
  posture: "Fix posture",
  energy: "More energy",
};

const BODY_GOAL_NUTRITION: Record<string, string> = {
  "lose-weight": "moderate calorie deficit with high fibre and satiety",
  "gain-muscle": "higher protein and calorie surplus for muscle gain",
  "tone-up": "balanced macros, 1.6g protein/kg target",
  flexibility: "anti-inflammatory foods, magnesium-rich meals",
  endurance: "complex carbs for sustained energy, iron-rich foods",
  "stress-relief": "magnesium-rich, adaptogens, B vitamins and omega-3",
  posture: "anti-inflammatory support, calcium and vitamin D",
  energy: "B-vitamin rich foods, iron, complex carbs, reduced sugar",
};

interface Props {
  initialPrefs: PrepPrefsType;
  phase: Phase;
  onBuild: (prefs: PrepPrefsType) => void;
  isGenerating?: boolean;
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

export default function PrepPreferences({ initialPrefs, phase, onBuild, isGenerating }: Props) {
  const [breakfast, setBreakfast] = useState<BreakfastPref>(initialPrefs.breakfast);
  const [lunch, setLunch] = useState<LunchPref>(initialPrefs.lunch);
  const [dinner, setDinner] = useState<DinnerPref>(initialPrefs.dinner);
  const [prepDays, setPrepDays] = useState<string[]>(initialPrefs.prepDays);
  const [adults, setAdults] = useState(initialPrefs.adults);
  const [kids, setKids] = useState(initialPrefs.kids);
  const [dietType, setDietType] = useState(initialPrefs.dietType || "");
  const [allergies, setAllergies] = useState(initialPrefs.allergies || "");
  const [dislikes, setDislikes] = useState(initialPrefs.dislikes || "");
  const [calorieTarget, setCalorieTarget] = useState(initialPrefs.calorieTarget || "");
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>(initialPrefs.cookingSkill || "confident");
  const [availableTime, setAvailableTime] = useState<AvailableTime>(initialPrefs.availableTime || "30");
  const [equipment, setEquipment] = useState<string[]>(initialPrefs.equipment || ["oven", "stovetop"]);
  const phaseColor = PHASE_HEX[phase];

  // Read body goals array from BodyVisualiser's localStorage
  const bodyGoals = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem("signal_body_goals");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);

  const togglePrepDay = (day: string) => {
    haptic("light");
    setPrepDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleEquipment = (item: string) => {
    haptic("light");
    setEquipment((prev) => prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]);
  };

  const handleBuild = () => {
    const prefs: PrepPrefsType = {
      breakfast, lunch, dinner, prepDays, adults, kids,
      dietType, allergies, dislikes, calorieTarget,
      cookingSkill, availableTime, equipment,
      bodyGoal: bodyGoals[0] || "",
      bodyGoals,
    };
    savePreferences(prefs);
    onBuild(prefs);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">How does your week work?</h2>
        <p className="font-body text-sm text-muted-foreground mt-1 italic" style={{ fontWeight: 300 }}>
          Tell us once. AI builds your personalised 28-day plan.
        </p>
      </div>

      {/* Body Goal (auto-populated) */}
      {bodyGoal && (
        <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-body text-xs font-semibold text-foreground">
              {BODY_GOAL_LABELS[bodyGoal] || bodyGoal}
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
              Your plan will be optimised for {BODY_GOAL_NUTRITION[bodyGoal] || "balanced nutrition"} — we'll adjust protein and calorie targets accordingly.
            </p>
          </div>
        </div>
      )}

      {/* Cooking Skill */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Cooking confidence</p>
        <RadioCard selected={cookingSkill === "beginner"} label="Beginner — quick and simple recipes only" description="Under 5 ingredients, minimal techniques" onSelect={() => setCookingSkill("beginner")} />
        <RadioCard selected={cookingSkill === "confident"} label="Confident — I can follow most recipes" description="Happy with standard home cooking" onSelect={() => setCookingSkill("confident")} />
        <RadioCard selected={cookingSkill === "adventurous"} label="Adventurous — bring on the challenge" description="Fermenting, slow-cooking, global cuisines" onSelect={() => setCookingSkill("adventurous")} />
      </div>

      {/* Available Time */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Max time per meal</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: "15" as AvailableTime, label: "15 min" },
            { value: "30" as AvailableTime, label: "30 min" },
            { value: "45" as AvailableTime, label: "45 min" },
            { value: "60+" as AvailableTime, label: "60+ min" },
          ]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { haptic("light"); setAvailableTime(value); }}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                availableTime === value ? "text-white" : "bg-secondary text-muted-foreground"
              }`}
              style={availableTime === value ? { backgroundColor: phaseColor } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Kitchen Equipment */}
      <div className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Kitchen equipment</p>
        <div className="flex flex-wrap gap-2">
          {["Oven", "Stovetop", "Air fryer", "Slow cooker", "Blender", "Food processor", "Instant Pot"].map(item => (
            <button
              key={item}
              onClick={() => toggleEquipment(item.toLowerCase())}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                equipment.includes(item.toLowerCase()) ? "text-white" : "bg-secondary text-muted-foreground"
              }`}
              style={equipment.includes(item.toLowerCase()) ? { backgroundColor: phaseColor } : {}}
            >
              {item}
            </button>
          ))}
        </div>
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

      {/* Dietary requirements */}
      <div className="space-y-3 pt-2 border-t border-border">
        <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Dietary preferences</p>
        
        <div className="space-y-2">
          <label className="font-body text-xs text-foreground">Diet type</label>
          <div className="flex flex-wrap gap-2">
            {["No preference", "Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "Keto", "Paleo"].map(dt => (
              <button
                key={dt}
                onClick={() => { haptic("light"); setDietType(dietType === dt ? "" : dt); }}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                  dietType === dt ? "text-white" : "bg-secondary text-muted-foreground"
                }`}
                style={dietType === dt ? { backgroundColor: phaseColor } : {}}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Allergies or intolerances</label>
          <input
            type="text"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="e.g. nuts, shellfish, soy..."
            className="w-full rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Foods you dislike (won't include)</label>
          <input
            type="text"
            value={dislikes}
            onChange={e => setDislikes(e.target.value)}
            placeholder="e.g. mushrooms, tofu, eggplant..."
            className="w-full rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Daily calorie target</label>
          <div className="flex flex-wrap gap-2">
            {["No preference", "1400–1600", "1600–1800", "1800–2000", "2000–2200", "2200+"].map(cal => (
              <button
                key={cal}
                onClick={() => { haptic("light"); setCalorieTarget(calorieTarget === cal ? "" : cal); }}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                  calorieTarget === cal ? "text-white" : "bg-secondary text-muted-foreground"
                }`}
                style={calorieTarget === cal ? { backgroundColor: phaseColor } : {}}
              >
                {cal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Build button */}
      <button
        onClick={handleBuild}
        disabled={isGenerating}
        className="touch-btn w-full rounded-[14px] py-3.5 min-h-[52px] font-body text-sm font-bold text-white transition-all active:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: phaseColor }}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating your plan...
          </span>
        ) : (
          "Build my AI plan →"
        )}
      </button>
    </div>
  );
}
