import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { CymatiSketch, BotanicalSprig, HerbCluster, WildStar } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart, getWaterCount, setWaterCount, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { TODAY_MEALS, PHASE_MEAL_PLANS, RECIPES, NUTRIENT_FOCUS } from "@/data/meal-plans";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" } }),
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

  const addWater = () => { haptic("light"); const n = Math.min(water + 1, 8); setWaterState(n); setWaterCount(n); };

  const filteredRecipes = recipePhaseFilter === "all" ? RECIPES : RECIPES.filter((r) => r.phase === recipePhaseFilter);

  const TABS = [
    { id: "today" as const, label: "Today" },
    { id: "plans" as const, label: "Plans" },
    { id: "recipes" as const, label: "Recipes" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative">
      <div className="absolute top-0 right-0 -translate-y-2 md:-translate-y-4 translate-x-2 md:translate-x-4 pointer-events-none">
        <HerbCluster size={70} opacity={0.15} className="md:hidden" />
        <HerbCluster size={100} opacity={0.2} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">nutrition</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground mt-1">Nutrition</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Eat for your cycle, not against it</p>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => { haptic("light"); setActiveTab(tab.id); }}
            className={`touch-tab flex-1 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-3 md:space-y-4">
          <p className="font-display text-lg md:text-xl italic text-foreground">
            {PHASE_SHORT[info.phase]} Day {info.cycleDay} — Phase-Synced Meals
          </p>

          {todayMeals.map((meal, i) => (
            <motion.div key={meal.type} custom={i} initial="hidden" animate="visible" variants={cardVariant}
              className="relative overflow-hidden card-warm p-4 md:p-5"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[18px]" style={{ backgroundColor: PHASE_HEX[info.phase] }} />
              <div className="absolute top-2 right-2 w-10 h-10 md:w-12 md:h-12 pointer-events-none">
                <CymatiSketch phase={info.phase} size={40} opacity={0.06} />
              </div>
              <div className="pl-3">
                <span className="font-hand text-sm font-bold" style={{ color: PHASE_HEX[info.phase] }}>{meal.type}</span>
                {meal.prepTime && <span className="font-mono text-[10px] text-muted-foreground ml-2">{meal.prepTime}</span>}
                <h3 className="font-display text-base md:text-lg italic text-foreground mt-1">{meal.name}</h3>
                {meal.ingredients && <p className="font-body text-xs text-muted-foreground mt-1">{meal.ingredients}</p>}
                <p className="font-display text-xs italic mt-2" style={{ color: PHASE_HEX[info.phase] }}>
                  {meal.phaseBenefit}
                </p>
                {(meal.calories || meal.protein) && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {meal.calories && <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{meal.calories}</span>}
                    {meal.protein && <span className="font-mono text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{meal.protein}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Water */}
          <div className="card-warm p-4 md:p-5">
            <p className="font-hand text-sm font-bold text-phase-follicular mb-3">hydration</p>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <button key={i} onClick={i === water ? addWater : undefined}
                  className={`touch-btn h-7 w-7 rounded-full border transition-all ${i < water ? "bg-phase-follicular/30 border-phase-follicular/60" : "border-border active:border-phase-follicular/30"}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">{water}/8</span>
              <button onClick={addWater} disabled={water >= 8} className="touch-btn rounded-full bg-phase-follicular/10 px-3 py-1.5 min-h-[36px] font-mono text-[10px] text-phase-follicular active:bg-phase-follicular/20 disabled:opacity-30">+1</button>
            </div>
          </div>

          {/* Nutrients */}
          <div className="card-warm p-4 md:p-5">
            <p className="font-hand text-sm font-bold text-primary mb-3">key nutrients today</p>
            <div className="flex flex-wrap gap-2">
              {nutrients.map((n) => (
                <span key={n} className="font-mono text-[10px] rounded-full px-3 py-1.5 flex items-center gap-1" style={{ backgroundColor: `${PHASE_HEX[info.phase]}15`, color: PHASE_HEX[info.phase] }}>
                  <WildStar size={10} color={PHASE_HEX[info.phase]} /> {n}
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
              <div key={phase} className="card-warm overflow-hidden">
                <button onClick={() => { haptic("light"); setExpandedPlan(expanded ? null : phase); }} className="touch-card w-full flex items-center justify-between p-4 md:p-5 text-left min-h-[64px]">
                  <div>
                    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-hand font-bold phase-${phase}-light mb-1`}>{PHASE_SHORT[phase]}</span>
                    <p className="font-body text-xs text-muted-foreground">{plan.theme}</p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 md:px-5 pb-4 md:pb-5 space-y-2">
                    {plan.days.map((day) => (
                      <div key={day.day} className="bg-secondary/60 rounded-xl p-3">
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
        <div className="space-y-4 md:space-y-6">
          {/* Horizontal scroll filter on mobile */}
          <div className="scroll-snap-x flex gap-2 pb-1 -mx-1 px-1 sm:flex-wrap">
            <button onClick={() => setRecipePhaseFilter("all")} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${recipePhaseFilter === "all" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>All</button>
            {(["menstrual", "follicular", "ovulatory", "luteal"] as Phase[]).map((phase) => (
              <button key={phase} onClick={() => setRecipePhaseFilter(phase)} className={`touch-btn scroll-snap-item rounded-full px-3 py-2 min-h-[40px] font-body text-xs font-medium transition-all whitespace-nowrap ${recipePhaseFilter === phase ? `phase-${phase}` : `phase-${phase}-light`}`}>{PHASE_SHORT[phase]}</button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filteredRecipes.map((recipe, i) => {
              const expanded = expandedRecipe === recipe.id;
              return (
                <motion.div key={recipe.id} custom={i} initial="hidden" animate="visible" variants={cardVariant}
                  className="card-warm overflow-hidden"
                >
                  <div className="h-20 md:h-24 bg-secondary/30 relative flex items-center justify-center overflow-hidden">
                    <CymatiSketch phase={recipe.phase} size={80} opacity={0.15} />
                    <p className="absolute font-hand text-sm text-muted-foreground italic px-2 text-center">{recipe.name}</p>
                  </div>

                  <div className="p-4 cursor-pointer touch-card" onClick={() => { haptic("light"); setExpandedRecipe(expanded ? null : recipe.id); }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 font-hand text-[11px] font-bold phase-${recipe.phase}-light`}>{PHASE_SHORT[recipe.phase]}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{recipe.prepTime}</span>
                    </div>
                    <h3 className="font-display text-base italic text-foreground">{recipe.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recipe.keyNutrients.map((n) => <span key={n} className="font-mono text-[8px] bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">{n}</span>)}
                    </div>
                  </div>

                  {expanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                      <div>
                        <p className="font-hand text-sm font-bold text-primary mb-1">Ingredients</p>
                        <ul className="space-y-0.5">
                          {recipe.ingredients.map((ing, j) => <li key={j} className="font-body text-xs text-muted-foreground">• {ing}</li>)}
                        </ul>
                      </div>
                      <BotanicalSprig width={100} opacity={0.15} />
                      <div>
                        <p className="font-hand text-sm font-bold text-primary mb-1">Method</p>
                        <ol className="space-y-0.5">
                          {recipe.method.map((step, j) => <li key={j} className="font-body text-xs text-muted-foreground">{j + 1}. {step}</li>)}
                        </ol>
                      </div>
                      <p className="font-display text-xs italic" style={{ color: PHASE_HEX[recipe.phase] }}>{recipe.phaseBenefit}</p>
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
