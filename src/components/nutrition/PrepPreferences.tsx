import { useState, useMemo } from "react";
import { Minus, Plus, Dumbbell, Eye, EyeOff, Check, Baby, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SignalRingAnimation from "@/components/SignalRingAnimation";

function SignalLoadingRing() {
  return (
    <div className="w-8 h-8">
      <SignalRingAnimation variant="ripple" size={32} color="rgba(255,255,255,0.8)" />
    </div>
  );
}
import { Phase } from "@/lib/cycle-utils";
import {
  PrepPreferences as PrepPrefsType,
  BreakfastPref,
  LunchPref,
  DinnerPref,
  savePreferences,
} from "@/lib/weekly-planner";
import { haptic } from "@/hooks/use-mobile";
import { getDislikedRecipes, removeDislikedRecipe } from "@/lib/fitness-profile";
import { findRecipeById } from "@/lib/recipe-index";
import { useProfile } from "@/hooks/useProfile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

const BODY_GOAL_LABELS: Record<string, string> = {
  "lose-weight": "Lose weight (calorie deficit)",
  "maintain": "Maintain weight",
  "gain-muscle": "Build muscle (calorie surplus)",
  "tone-up": "Tone & define",
  flexibility: "Improve flexibility",
  endurance: "Build endurance",
  "stress-relief": "Stress relief",
  posture: "Fix posture",
  energy: "More energy",
};

const ADULT_DIET_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
];

const KIDS_DIET_OPTIONS = [
  "Dairy-free",
  "Gluten-free",
  "Nut-free",
  "Egg-free",
  "Vegetarian",
  "Vegan",
];

interface Props {
  initialPrefs: PrepPrefsType;
  phase: Phase;
  onBuild: (prefs: PrepPrefsType) => void;
  isGenerating?: boolean;
}

export default function PrepPreferences({ initialPrefs, phase, onBuild, isGenerating }: Props) {
  const navigate = useNavigate();
  const [breakfast, setBreakfast] = useState<BreakfastPref>(initialPrefs.breakfast);
  const [lunch, setLunch] = useState<LunchPref>(initialPrefs.lunch);
  const [dinner, setDinner] = useState<DinnerPref>(initialPrefs.dinner);
  const [prepDays, setPrepDays] = useState<string[]>(initialPrefs.prepDays);
  const [adults, setAdults] = useState(initialPrefs.adults);
  const [kids, setKids] = useState(initialPrefs.kids);

  // Multi-select diet types for adults — migrate from legacy single string
  const [dietTypes, setDietTypes] = useState<string[]>(() => {
    if (initialPrefs.dietTypes?.length) return initialPrefs.dietTypes;
    if (initialPrefs.dietType && initialPrefs.dietType !== "No preference") return [initialPrefs.dietType];
    return [];
  });

  // Multi-select diet types for kids — migrate from legacy single string
  const [kidsDietTypes, setKidsDietTypes] = useState<string[]>(() => {
    if (initialPrefs.kidsDietTypes?.length) return initialPrefs.kidsDietTypes;
    if (initialPrefs.kidsDietType && initialPrefs.kidsDietType !== "No restrictions") return [initialPrefs.kidsDietType];
    return [];
  });

  const [allergies, setAllergies] = useState(initialPrefs.allergies || "");
  const [dislikes, setDislikes] = useState(initialPrefs.dislikes || "");
  const [calorieTarget, setCalorieTarget] = useState(initialPrefs.calorieTarget || "");
  const [showHiddenRecipes, setShowHiddenRecipes] = useState(false);
  const [dislikedRecipes, setDislikedRecipes] = useState<string[]>(getDislikedRecipes);
  const [kidsAllergies, setKidsAllergies] = useState(initialPrefs.kidsAllergies || "");

  const phaseColor = PHASE_HEX[phase];

  const { movementGoals: profileGoals } = useProfile();

  const bodyGoals = useMemo<string[]>(() => {
    if (profileGoals && profileGoals.length > 0) return profileGoals;
    try {
      const raw = localStorage.getItem("signal_body_goals");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, [profileGoals]);

  const hasMovementGoals = bodyGoals.length > 0;

  const toggleDietType = (dt: string) => {
    haptic("light");
    setDietTypes(prev => prev.includes(dt) ? prev.filter(d => d !== dt) : [...prev, dt]);
  };

  const toggleKidsDietType = (dt: string) => {
    haptic("light");
    setKidsDietTypes(prev => prev.includes(dt) ? prev.filter(d => d !== dt) : [...prev, dt]);
  };

  const togglePrepDay = (day: string) => {
    haptic("light");
    setPrepDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleUnhideRecipe = (recipeId: string) => {
    haptic("light");
    removeDislikedRecipe(recipeId);
    setDislikedRecipes(prev => prev.filter(id => id !== recipeId));
  };

  const handleBuild = () => {
    const prefs: PrepPrefsType = {
      breakfast, lunch, dinner, prepDays, adults, kids,
      dietTypes: dietTypes.length > 0 ? dietTypes : undefined,
      dietType: dietTypes[0] || "",   // legacy compat for edge function
      allergies, dislikes, calorieTarget,
      cookingSkill: "confident",
      availableTime: "30",
      equipment: ["oven", "stovetop"],
      bodyGoal: bodyGoals[0] || "",
      bodyGoals,
      kidsDietTypes: kids > 0 && kidsDietTypes.length > 0 ? kidsDietTypes : undefined,
      kidsDietType: kids > 0 ? (kidsDietTypes[0] || "") : "",  // legacy compat
      kidsAllergies: kids > 0 ? kidsAllergies : "",
    };
    savePreferences(prefs);
    onBuild(prefs);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold italic text-foreground">How Does Your Week Work?</h2>
        <p className="font-body text-sm text-muted-foreground mt-1 italic" style={{ fontWeight: 300 }}>
          Tell us once. AI builds your personalised weekly plan.
        </p>
      </div>

      {/* Movement Goals — gate */}
      {!hasMovementGoals ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-body text-xs font-semibold text-foreground">
              Set your movement goals first
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
              Your nutrition plan is built around your fitness goals — calorie targets, protein needs, and meal timing are all tailored to what you're working towards.
            </p>
            <button
              onClick={() => navigate("/movement")}
              className="mt-2 font-body text-xs font-semibold text-primary underline"
            >
              Go to Movement to set your goals →
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-body text-xs font-semibold text-foreground">
              Movement goals: {bodyGoals.map(g => BODY_GOAL_LABELS[g] || g).join(", ")}
            </p>
            <p className="font-body text-[10px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
              Your plan will be calibrated to these goals — calories, protein targets, and meal timing adjusted accordingly.
            </p>
          </div>
        </div>
      )}

      {/* Meal variety - checkboxes for weekly repetition */}
      <div className="space-y-3">
        <p className="font-display text-sm font-bold italic" style={{ color: "hsl(var(--primary))" }}>Meal Variety Preference</p>
        <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
          Choose how much variety you want per week.
        </p>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[72px_1fr_1fr_1fr] border-b border-border bg-secondary/40">
            <div />
            {["Same daily", "2–3 options", "Different daily"].map(col => (
              <div key={col} className="py-2 px-1 text-center">
                <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">{col}</span>
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
      <div className="space-y-2">
        <p className="font-display text-sm font-bold italic" style={{ color: "hsl(var(--primary))" }}>Main Prep Day</p>
        <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>Bigger meals will be scheduled on your prep day(s).</p>
        <div className="flex flex-wrap gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "No set day"].map((day) => (
            <button key={day} onClick={() => togglePrepDay(day)}
              className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all ${
                prepDays.includes(day) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div className="space-y-3">
        <p className="font-display text-sm font-bold italic" style={{ color: "hsl(var(--primary))" }}>Cooking For</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Adults:</span>
            <button onClick={() => { haptic("light"); setAdults(Math.max(1, adults - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-body text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{adults}</span>
            <button onClick={() => { haptic("light"); setAdults(Math.min(6, adults + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-foreground">Kids:</span>
            <button onClick={() => { haptic("light"); setKids(Math.max(0, kids - 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
            <span className="font-body text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{kids}</span>
            <button onClick={() => { haptic("light"); setKids(Math.min(6, kids + 1)); }} className="touch-btn w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
          </div>
        </div>
        {kids > 0 && (
          <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
            Kids meals will be generated as separate recipes matched to the same protein.
          </p>
        )}
      </div>

      {/* Kids Dietary Preferences — conditional on kids > 0 */}
      {kids > 0 && (
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Baby className="h-4 w-4 text-primary" />
            <p className="font-display text-sm font-bold italic" style={{ color: "hsl(var(--primary))" }}>
              Kids' Dietary Needs
            </p>
          </div>
          <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>
            Select all that apply — kids' meals will respect every choice.
          </p>

          <div className="space-y-2">
            <label className="font-body text-xs text-foreground">Diet restrictions</label>
            <div className="flex flex-wrap gap-2">
              {KIDS_DIET_OPTIONS.map(dt => {
                const selected = kidsDietTypes.includes(dt);
                return (
                  <button key={dt} onClick={() => toggleKidsDietType(dt)}
                    className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {selected && <Check className="h-3 w-3" />}
                    {dt}
                  </button>
                );
              })}
            </div>
            {kidsDietTypes.length === 0 && (
              <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>No restrictions — all kids recipes included.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-body text-xs text-foreground">Allergies or intolerances</label>
            <input type="text" value={kidsAllergies} onChange={e => setKidsAllergies(e.target.value)}
              placeholder="e.g. dairy, nuts, eggs..."
              className="w-full rounded-xl bg-card px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      )}

      {/* Dietary requirements */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div>
          <p className="font-display text-sm font-bold italic" style={{ color: "hsl(var(--primary))" }}>Your Dietary Preferences</p>
          <p className="font-body text-[10px] text-muted-foreground mt-0.5 italic" style={{ fontWeight: 300 }}>
            Select all that apply — your plan will respect every choice.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADULT_DIET_OPTIONS.map(dt => {
            const selected = dietTypes.includes(dt);
            return (
              <button key={dt} onClick={() => toggleDietType(dt)}
                className={`touch-btn rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                {selected && <Check className="h-3 w-3" />}
                {dt}
              </button>
            );
          })}
        </div>
        {dietTypes.length === 0 && (
          <p className="font-body text-[10px] text-muted-foreground italic" style={{ fontWeight: 300 }}>No restrictions selected — all recipes included.</p>
        )}

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

        {hasMovementGoals && (
          <p className="font-body text-[10px] text-primary italic">
            Calories and protein targets are calibrated to your movement goals.
          </p>
        )}
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
      <button onClick={handleBuild} disabled={isGenerating || !hasMovementGoals}
        className="touch-btn w-full rounded-[14px] py-3.5 min-h-[52px] font-body text-sm font-bold text-primary-foreground bg-primary transition-all active:opacity-90 disabled:opacity-50">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <SignalLoadingRing />
            <span className="font-body text-xs text-primary-foreground/80">Generating your plan...</span>
          </div>
        ) : !hasMovementGoals ? (
          "Set movement goals to continue"
        ) : (
          "Build my AI plan →"
        )}
      </button>
    </div>
  );
}
