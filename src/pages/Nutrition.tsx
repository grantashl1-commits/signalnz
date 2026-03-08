import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, getWaterCount, setWaterCount, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { TODAY_MEALS, PHASE_MEAL_PLANS, RECIPES, NUTRIENT_FOCUS, type Recipe } from "@/data/meal-plans";

const PHASE_PRINCIPLES: Record<Phase, string[]> = {
  menstrual: [
    "Iron-rich foods + vitamin C to aid absorption",
    "Anti-inflammatory foods — ginger, turmeric, dark leafy greens",
    "Magnesium-rich foods for cramps and mood",
  ],
  follicular: [
    "Complex low-GI carbs as estrogen rises",
    "Fermented foods to support the gut-estrogen axis",
    "Lighter eating — appetite is naturally lower",
  ],
  ovulatory: [
    "Antioxidants + folate + zinc for peak hormonal output",
    "Raw and lightly cooked vegetables",
    "Appetite at its lowest — focus on nutrient density, not quantity",
  ],
  luteal: [
    "Higher calorie needs are normal and healthy",
    "Nutrient-dense complex carbs — sweet potato, oats, legumes",
    "Magnesium + B6 for PMS. Never skip meals — progesterone needs steady glucose",
  ],
};

export default function NutritionPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [activeTab, setActiveTab] = useState<"today" | "plans" | "recipes">("today");
  const [expandedPlan, setExpandedPlan] = useState<Phase | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [water, setWaterState] = useState(getWaterCount());
  const [recipePhaseFilter, setRecipePhaseFilter] = useState<Phase | "all">("all");

  const todayMeals = TODAY_MEALS[info.phase];
  const nutrients = NUTRIENT_FOCUS[info.phase];
  const principles = PHASE_PRINCIPLES[info.phase];

  const addWater = () => {
    const next = Math.min(water + 1, 8);
    setWaterState(next);
    setWaterCount(next);
  };

  const filteredRecipes = recipePhaseFilter === "all"
    ? RECIPES
    : RECIPES.filter((r) => r.phase === recipePhaseFilter);

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "plans" as const, label: "Meal Plans" },
    { id: "recipes" as const, label: "Recipes" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Nutrition</h1>
        <p className="text-muted-foreground mt-1">Eat for your cycle, not against it</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />
        <span className="text-sm text-muted-foreground">{principles[0]}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Today's Phase-Synced Meals — {PHASE_SHORT[info.phase]} Day {info.cycleDay}
          </h2>

          {todayMeals.map((meal, i) => (
            <motion.div
              key={meal.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-warm p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{meal.type}</span>
                {meal.prepTime && <span className="text-[10px] text-muted-foreground">• {meal.prepTime}</span>}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{meal.name}</h3>
              {meal.ingredients && (
                <p className="text-xs text-muted-foreground mt-1">{meal.ingredients}</p>
              )}
              <p className="text-xs text-accent mt-2 font-medium leading-relaxed">{meal.phaseBenefit}</p>
              {(meal.calories || meal.protein) && (
                <div className="flex gap-3 mt-2">
                  {meal.calories && <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">{meal.calories}</span>}
                  {meal.protein && <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">Protein: {meal.protein}</span>}
                </div>
              )}
            </motion.div>
          ))}

          {/* Water tracker */}
          <div className="card-warm p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground mb-3">Water Tracker</p>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  onClick={i === water ? addWater : undefined}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    i < water ? "bg-accent/70 border-accent" : "border-border hover:border-accent/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{water}/8 glasses today</span>
              <button
                onClick={addWater}
                disabled={water >= 8}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-40"
              >
                +1
              </button>
            </div>
          </div>

          {/* Nutrient focus */}
          <div className="card-warm p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground mb-3">Nutrient Focus for {PHASE_SHORT[info.phase]}</p>
            <div className="flex flex-wrap gap-2">
              {nutrients.map((n) => (
                <span key={n} className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                  {n} ✓
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Today's meals cover your key {PHASE_SHORT[info.phase].toLowerCase()} phase nutrients.</p>
          </div>
        </div>
      )}

      {/* MEAL PLANS TAB */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => {
            const plan = PHASE_MEAL_PLANS[phase];
            const expanded = expandedPlan === phase;
            return (
              <div key={phase} className="card-warm overflow-hidden">
                <button
                  onClick={() => setExpandedPlan(expanded ? null : phase)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium phase-${phase}-light mb-2`}>
                      {PHASE_SHORT[phase]} Phase
                    </span>
                    <p className="text-sm text-muted-foreground">{plan.theme}</p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 pb-5 space-y-3"
                  >
                    {plan.days.map((day) => (
                      <div key={day.day} className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs font-bold text-foreground mb-1">Day {day.day}</p>
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">B:</span> {day.breakfast}</p>
                          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">L:</span> {day.lunch}</p>
                          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">D:</span> {day.dinner}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RECIPES TAB */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          {/* Phase filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRecipePhaseFilter("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                recipePhaseFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              All Phases
            </button>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => setRecipePhaseFilter(phase)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  recipePhaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`
                }`}
              >
                {PHASE_SHORT[phase]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredRecipes.map((recipe, i) => {
              const expanded = expandedRecipe === recipe.id;
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-warm overflow-hidden"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedRecipe(expanded ? null : recipe.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium phase-${recipe.phase}-light`}>
                        {PHASE_SHORT[recipe.phase]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{recipe.prepTime} • Serves {recipe.serves}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground">{recipe.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.keyNutrients.map((n) => (
                        <span key={n} className="text-[9px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{n}</span>
                      ))}
                    </div>
                  </div>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-5 pb-5 space-y-3 border-t border-border pt-3"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-1">Ingredients</p>
                        <ul className="space-y-0.5">
                          {recipe.ingredients.map((ing, j) => (
                            <li key={j} className="text-xs text-muted-foreground">• {ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-1">Method</p>
                        <ol className="space-y-1">
                          {recipe.method.map((step, j) => (
                            <li key={j} className="text-xs text-muted-foreground">{j + 1}. {step}</li>
                          ))}
                        </ol>
                      </div>
                      <p className="text-xs text-accent font-medium leading-relaxed">{recipe.phaseBenefit}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
