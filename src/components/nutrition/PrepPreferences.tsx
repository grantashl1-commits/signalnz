import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Minus, Plus, Dumbbell, Eye, EyeOff, Check } from "lucide-react";
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
import { getPantryStaples, savePantryStaples, getDislikedRecipes, removeDislikedRecipe } from "@/lib/fitness-profile";
import { findRecipeById } from "@/lib/recipe-index";

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

const PANTRY_STAPLE_OPTIONS = [
  "Olive oil", "Coconut oil", "Butter", "Salt & pepper", "Garlic", "Onions",
  "Tinned tomatoes", "Coconut milk", "Soy sauce / tamari", "Rice", "Pasta",
  "Oats", "Plain flour", "Baking powder", "Eggs", "Honey",
  "Apple cider vinegar", "Dried herbs & spices",
];

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

const FORM_SECTIONS = [
  { id: "cooking", label: "Confidence" },
  { id: "timing", label: "Timing" },
  { id: "equipment", label: "Equipment" },
  { id: "meals", label: "Meals" },
  { id: "prep", label: "Prep Day" },
  { id: "pantry", label: "Pantry" },
  { id: "dietary", label: "Dietary" },
] as const;

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
  const [pantryStaples, setPantryStaplesState] = useState<string[]>(getPantryStaples);
  const [showHiddenRecipes, setShowHiddenRecipes] = useState(false);
  const [dislikedRecipes, setDislikedRecipes] = useState<string[]>(getDislikedRecipes);
  const phaseColor = PHASE_HEX[phase];

  // Progress tracking
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const setSectionRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections(prev => {
          const next = new Set(prev);
          entries.forEach(e => {
            if (e.isIntersecting) next.add(e.target.getAttribute("data-section") || "");
            else next.delete(e.target.getAttribute("data-section") || "");
          });
          return next;
        });
      },
      { threshold: 0.3 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const furthestVisibleIdx = useMemo(() => {
    let max = -1;
    FORM_SECTIONS.forEach((s, i) => { if (visibleSections.has(s.id)) max = i; });
    return max;
  }, [visibleSections]);

  const progressPct = FORM_SECTIONS.length > 0
    ? Math.min(100, Math.round(((furthestVisibleIdx + 1) / FORM_SECTIONS.length) * 100))
    : 0;

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

  const togglePantryStaple = (item: string) => {
    haptic("light");
    setPantryStaplesState(prev => {
      const next = prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item];
      savePantryStaples(next);
      return next;
    });
  };

  const handleUnhideRecipe = (recipeId: string) => {
    haptic("light");
    removeDislikedRecipe(recipeId);
    setDislikedRecipes(prev => prev.filter(id => id !== recipeId));
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
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pb-3 -mx-1 px-1 pt-1">
        <div className="relative h-3 flex items-center">
          {/* Track */}
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-border/40" />
          {/* Fill */}
          <div
            className="absolute left-0 h-[3px] rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
          {/* Section markers */}
          {FORM_SECTIONS.map((s, i) => {
            const left = ((i + 0.5) / FORM_SECTIONS.length) * 100;
            const reached = i <= furthestVisibleIdx;
            return (
              <div
                key={s.id}
                className="absolute flex flex-col items-center"
                style={{ left: `${left}%`, transform: "translateX(-50%)" }}
              >
                <div className={`h-3 w-3 rounded-full border-2 text-[6px] font-mono font-bold flex items-center justify-center transition-all ${
                  reached
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5 px-0.5">
          {FORM_SECTIONS.map((s, i) => (
            <span key={s.id} className={`font-mono text-[7px] tracking-wide transition-colors ${
              i <= furthestVisibleIdx ? "text-primary" : "text-muted-foreground/50"
            }`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">How does your week work?</h2>
        <p className="font-body text-sm text-muted-foreground mt-1 italic" style={{ fontWeight: 300 }}>
          Tell us once. AI builds your personalised 28-day plan.
        </p>
      </div>

      {/* Body Goals */}
      {bodyGoals.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-body text-xs font-semibold text-foreground">
              Your movement goals: {bodyGoals.map(g => BODY_GOAL_LABELS[g] || g).join(", ")}
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
              We've set your nutrition plan to support these — you can override your calorie target below.
            </p>
          </div>
        </div>
      )}

      {/* Cooking Skill */}
      <div ref={setSectionRef("cooking")} data-section="cooking" className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Cooking confidence</p>
        <RadioCard selected={cookingSkill === "beginner"} label="Beginner — quick and simple recipes only" description="Under 5 ingredients, minimal techniques" onSelect={() => setCookingSkill("beginner")} />
        <RadioCard selected={cookingSkill === "confident"} label="Confident — I can follow most recipes" description="Happy with standard home cooking" onSelect={() => setCookingSkill("confident")} />
        <RadioCard selected={cookingSkill === "adventurous"} label="Adventurous — bring on the challenge" description="Fermenting, slow-cooking, global cuisines" onSelect={() => setCookingSkill("adventurous")} />
      </div>

      {/* Available Time */}
      <div ref={setSectionRef("timing")} data-section="timing" className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Max time per meal</p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: "15" as AvailableTime, label: "15 min" },
            { value: "30" as AvailableTime, label: "30 min" },
            { value: "45" as AvailableTime, label: "45 min" },
            { value: "60+" as AvailableTime, label: "60+ min" },
          ]).map(({ value, label }) => (
            <button key={value} onClick={() => { haptic("light"); setAvailableTime(value); }}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                availableTime === value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
              >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Kitchen Equipment */}
      <div ref={setSectionRef("equipment")} data-section="equipment" className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Kitchen equipment</p>
        <div className="flex flex-wrap gap-2">
          {["Oven", "Stovetop", "Air fryer", "Slow cooker", "Blender", "Food processor", "Instant Pot"].map(item => (
            <button key={item} onClick={() => toggleEquipment(item.toLowerCase())}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                equipment.includes(item.toLowerCase()) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
              >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Meal variety grid */}
      <div ref={setSectionRef("meals")} data-section="meals" className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Meal variety preference</p>
        <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
          Tap a cell for each meal to set your preferred variety level.
        </p>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[72px_1fr_1fr_1fr] border-b border-border bg-secondary/40">
            <div />
            {["Same", "2–3 options", "Different"].map(col => (
              <div key={col} className="py-2 px-1 text-center">
                <span className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">{col}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {([
            { meal: "Breakfast" as const, value: breakfast, options: ["batch", "rotate", "variety"] as BreakfastPref[], set: setBreakfast },
            { meal: "Lunch" as const, value: lunch, options: ["batch", "rotate", "variety"] as LunchPref[], set: setLunch },
            { meal: "Dinner" as const, value: dinner, options: ["double", "fresh", "mix"] as DinnerPref[], set: setDinner },
          ] as const).map(({ meal, value, options, set }, rowIdx) => (
            <div key={meal} className={`grid grid-cols-[72px_1fr_1fr_1fr] ${rowIdx < 2 ? "border-b border-border" : ""}`}>
              <div className="flex items-center px-3 py-3">
                <span className="font-body text-xs font-semibold text-foreground">{meal}</span>
              </div>
              {options.map((opt, colIdx) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => { haptic("light"); (set as (v: string) => void)(opt); }}
                    className={`flex items-center justify-center py-3 transition-all ${
                      colIdx < 2 ? "border-r border-border" : ""
                    } ${isSelected ? "bg-primary/10" : "hover:bg-secondary/60"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border-2 border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Prep day */}
      <div ref={setSectionRef("prep")} data-section="prep" className="space-y-2">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>When can you do your main prep?</p>
        <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>Bigger meals will be scheduled on your prep day(s) for advance cooking.</p>
        <div className="flex flex-wrap gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "No set day"].map((day) => (
            <button key={day} onClick={() => togglePrepDay(day)}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                prepDays.includes(day) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
              >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-3">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Cooking for</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Adults:</span>
            <button onClick={() => { haptic("light"); setAdults(Math.max(1, adults - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-mono text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{adults}</span>
            <button onClick={() => { haptic("light"); setAdults(Math.min(6, adults + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Kids:</span>
            <button onClick={() => { haptic("light"); setKids(Math.max(0, kids - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-mono text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{kids}</span>
            <button onClick={() => { haptic("light"); setKids(Math.min(6, kids + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
        </div>
        {kids > 0 && (
          <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
            Kids portions auto-calculate as 0.6× adult.
          </p>
        )}
      </div>

      {/* Pantry Staples */}
      <div ref={setSectionRef("pantry")} data-section="pantry" className="space-y-3 pt-2 border-t border-border">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Pantry staples I always have</p>
        <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
          Items you mark will be excluded from the shopping list.
        </p>
        <div className="flex flex-wrap gap-2">
          {PANTRY_STAPLE_OPTIONS.map(item => {
            const isSelected = pantryStaples.includes(item);
            return (
              <button key={item} onClick={() => togglePantryStaple(item)}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
                >
                {isSelected && <Check className="h-3 w-3" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary requirements */}
      <div ref={setSectionRef("dietary")} data-section="dietary" className="space-y-3 pt-2 border-t border-border">
        <p className="font-hand text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>Dietary preferences</p>
        
        <div className="space-y-2">
          <label className="font-body text-xs text-foreground">Diet type</label>
          <div className="flex flex-wrap gap-2">
            {["No preference", "Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "Keto", "Paleo"].map(dt => (
              <button key={dt} onClick={() => { haptic("light"); setDietType(dietType === dt ? "" : dt); }}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                  dietType === dt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
                >
                {dt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Allergies or intolerances</label>
          <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)}
            placeholder="e.g. nuts, shellfish, soy..."
            className="w-full rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Foods you dislike (won't include)</label>
          <input type="text" value={dislikes} onChange={e => setDislikes(e.target.value)}
            placeholder="e.g. mushrooms, tofu, eggplant..."
            className="w-full rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-xs text-foreground">Daily calorie target</label>
          <div className="flex flex-wrap gap-2">
            {["No preference", "1400–1600", "1600–1800", "1800–2000", "2000–2200", "2200+"].map(cal => (
              <button key={cal} onClick={() => { haptic("light"); setCalorieTarget(calorieTarget === cal ? "" : cal); }}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                  calorieTarget === cal ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
                >
                {cal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden recipes */}
      {dislikedRecipes.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <button onClick={() => { haptic("light"); setShowHiddenRecipes(!showHiddenRecipes); }}
            className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            {showHiddenRecipes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {dislikedRecipes.length} hidden recipe{dislikedRecipes.length !== 1 ? "s" : ""}
          </button>
          {showHiddenRecipes && (
            <div className="space-y-2">
              {dislikedRecipes.map(id => {
                const recipe = findRecipeById(id);
                return (
                  <div key={id} className="flex items-center justify-between rounded-xl bg-card p-3 border border-border">
                    <span className="font-body text-xs text-foreground">{recipe?.name || id}</span>
                    <button onClick={() => handleUnhideRecipe(id)}
                      className="touch-btn font-body text-[10px] text-primary underline">
                      Unhide
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Build button */}
      <button onClick={handleBuild} disabled={isGenerating}
        className="touch-btn w-full rounded-[14px] py-3.5 min-h-[52px] font-body text-sm font-bold text-primary-foreground bg-primary transition-all active:opacity-90 disabled:opacity-50">
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
