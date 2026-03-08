import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import CymaticPattern from "@/components/CymaticPatterns";
import { getCycleInfo, getLastPeriodStart, getWaterCount, setWaterCount, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { TODAY_MEALS, PHASE_MEAL_PLANS, RECIPES, NUTRIENT_FOCUS } from "@/data/meal-plans";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#8B1A4A",
  follicular: "#00C9A7",
  ovulatory: "#FFD166",
  luteal: "#4A3F7A",
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

  const addWater = () => { const n = Math.min(water + 1, 8); setWaterState(n); setWaterCount(n); };

  const filteredRecipes = recipePhaseFilter === "all" ? RECIPES : RECIPES.filter((r) => r.phase === recipePhaseFilter);

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "plans" as const, label: "Meal Plans" },
    { id: "recipes" as const, label: "Recipes" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 light-mode" style={{ "--background": "210 25% 96%", "--foreground": "210 40% 10%", "--card": "0 0% 100%", "--card-foreground": "210 40% 10%", "--muted": "210 15% 90%", "--muted-foreground": "210 15% 40%", "--border": "210 15% 88%" } as React.CSSProperties}>
      {/* Faint cymatic watermark */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <CymaticPattern phase={info.phase} size={600} opacity={1} />
      </div>

      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">nutrition feed</p>
        <h1 className="font-display text-4xl font-light italic text-foreground mt-1">Nutrition</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Eat for your cycle, not against it</p>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 font-body text-xs font-medium uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-4">
          <p className="font-display text-xl italic text-foreground">
            {PHASE_SHORT[info.phase]} Day {info.cycleDay} — Phase-Synced Meals
          </p>

          {todayMeals.map((meal, i) => (
            <motion.div key={meal.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-xl border bg-card p-5"
              style={{ borderColor: `${PHASE_HEX[info.phase]}20` }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-[3px]`} style={{ backgroundColor: PHASE_HEX[info.phase] }} />
              <div className="absolute top-0 right-0 w-16 h-16 -translate-y-4 translate-x-4 pointer-events-none">
                <CymaticPattern phase={info.phase} size={64} opacity={0.06} />
              </div>
              <div className="pl-3">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">{meal.type}</span>
                {meal.prepTime && <span className="font-mono text-[10px] text-muted-foreground ml-2">{meal.prepTime}</span>}
                <h3 className="font-display text-lg italic text-foreground mt-1">{meal.name}</h3>
                {meal.ingredients && <p className="font-body text-xs text-muted-foreground mt-1">{meal.ingredients}</p>}
                <p className="font-mono text-[10px] mt-2 leading-relaxed" style={{ color: PHASE_HEX[info.phase] }}>
                  SIGNAL: {meal.phaseBenefit}
                </p>
                {(meal.calories || meal.protein) && (
                  <div className="flex gap-3 mt-2">
                    {meal.calories && <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">{meal.calories}</span>}
                    {meal.protein && <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">{meal.protein}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Water */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-cyan mb-3">hydration</p>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <button key={i} onClick={i === water ? addWater : undefined}
                  className={`h-7 w-7 rounded-full border transition-all ${i < water ? "bg-cyan/30 border-cyan/60" : "border-muted hover:border-cyan/30"}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">{water}/8</span>
              <button onClick={addWater} disabled={water >= 8} className="rounded-full bg-cyan/10 px-3 py-1 font-mono text-[10px] text-cyan hover:bg-cyan/20 disabled:opacity-30">+1</button>
            </div>
          </div>

          {/* Nutrients */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-cyan mb-3">nutrient signal</p>
            <div className="flex flex-wrap gap-2">
              {nutrients.map((n) => (
                <span key={n} className="font-mono text-[10px] rounded-full px-3 py-1.5" style={{ backgroundColor: `${PHASE_HEX[info.phase]}15`, color: PHASE_HEX[info.phase] }}>
                  {n} ✓
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="space-y-3">
          {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => {
            const plan = PHASE_MEAL_PLANS[phase];
            const expanded = expandedPlan === phase;
            return (
              <div key={phase} className="rounded-xl border bg-card overflow-hidden" style={{ borderColor: `${PHASE_HEX[phase]}20` }}>
                <button onClick={() => setExpandedPlan(expanded ? null : phase)} className="w-full flex items-center justify-between p-5 text-left">
                  <div>
                    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-body font-bold uppercase tracking-widest phase-${phase}-light mb-1`}>{PHASE_SHORT[phase]}</span>
                    <p className="font-body text-xs text-muted-foreground">{plan.theme}</p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 space-y-2">
                    {plan.days.map((day) => (
                      <div key={day.day} className="bg-muted/60 rounded-lg p-3">
                        <p className="font-mono text-[10px] font-bold text-foreground mb-1">DAY {day.day}</p>
                        <p className="font-body text-xs text-muted-foreground"><span className="font-bold text-foreground/70">B:</span> {day.breakfast}</p>
                        <p className="font-body text-xs text-muted-foreground"><span className="font-bold text-foreground/70">L:</span> {day.lunch}</p>
                        <p className="font-body text-xs text-muted-foreground"><span className="font-bold text-foreground/70">D:</span> {day.dinner}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setRecipePhaseFilter("all")} className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${recipePhaseFilter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>All</button>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
              <button key={phase} onClick={() => setRecipePhaseFilter(phase)} className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${recipePhaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}>{PHASE_SHORT[phase]}</button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredRecipes.map((recipe, i) => {
              const expanded = expandedRecipe === recipe.id;
              return (
                <motion.div key={recipe.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl border bg-card overflow-hidden" style={{ borderColor: `${PHASE_HEX[recipe.phase]}20` }}
                >
                  {/* Cymatic placeholder image */}
                  <div className="h-24 bg-muted/50 relative flex items-center justify-center overflow-hidden">
                    <CymaticPattern phase={recipe.phase} size={120} opacity={0.25} />
                    <div className="absolute inset-0 border-[0.5px] border-muted m-2 rounded-sm pointer-events-none" style={{ borderColor: `${PHASE_HEX[recipe.phase]}30` }} />
                  </div>

                  <div className="p-4 cursor-pointer" onClick={() => setExpandedRecipe(expanded ? null : recipe.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-widest phase-${recipe.phase}-light`}>{PHASE_SHORT[recipe.phase]}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{recipe.prepTime}</span>
                    </div>
                    <h3 className="font-display text-base italic text-foreground">{recipe.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recipe.keyNutrients.map((n) => <span key={n} className="font-mono text-[8px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{n}</span>)}
                    </div>
                  </div>

                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                      <div>
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-foreground mb-1">Ingredients</p>
                        <ul className="space-y-0.5">
                          {recipe.ingredients.map((ing, j) => <li key={j} className="font-body text-xs text-muted-foreground">• {ing}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-foreground mb-1">Method</p>
                        <ol className="space-y-0.5">
                          {recipe.method.map((step, j) => <li key={j} className="font-body text-xs text-muted-foreground">{j + 1}. {step}</li>)}
                        </ol>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed" style={{ color: PHASE_HEX[recipe.phase] }}>SIGNAL: {recipe.phaseBenefit}</p>
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
