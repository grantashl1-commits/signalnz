import { useState } from "react";
import PhaseBadge from "@/components/PhaseBadge";
import { HerbCluster, WildStar } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart, Phase, PHASE_SHORT, PHASE_DAYS } from "@/lib/cycle-utils";
import { TODAY_MEALS, RECIPES, NUTRIENT_FOCUS } from "@/data/meal-plans";
import { PDF_RECIPES } from "@/data/pdf-recipes";
import { BAKING_RECIPES } from "@/data/baking-recipes";
import { haptic } from "@/hooks/use-mobile";
import TodayTab from "@/components/nutrition/TodayTab";
import PlansTab from "@/components/nutrition/PlansTab";
import RecipesGrid from "@/components/nutrition/RecipesGrid";
import MyWeekTab from "@/components/nutrition/MyWeekTab";
import SeedCyclingCard from "@/components/nutrition/SeedCyclingCard";

const ALL_RECIPES = [...RECIPES, ...PDF_RECIPES];

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

type TabId = "today" | "plans" | "myweek" | "recipes" | "baking";

export default function NutritionPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const todayMeals = TODAY_MEALS[info.phase];
  const nutrients = NUTRIENT_FOCUS[info.phase];
  const [phaseStart] = PHASE_DAYS[info.phase];
  const phaseDay = info.cycleDay - phaseStart + 1;

  const TABS: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "plans", label: "Plans" },
    { id: "myweek", label: "My Week" },
    { id: "recipes", label: "Recipes" },
    { id: "baking", label: "Baking" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative pb-24">
      <div className="absolute top-0 right-0 -translate-y-2 md:-translate-y-4 translate-x-2 md:translate-x-4 pointer-events-none">
        <HerbCluster size={70} opacity={0.15} className="md:hidden" />
        <HerbCluster size={100} opacity={0.2} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">nutrition</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground mt-1">Nourish</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Eat for your cycle, not against it.</p>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      {/* Tabs — horizontal scroll */}
      <div className="scroll-snap-x flex gap-1 rounded-full bg-secondary p-1 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              haptic("light");
              setActiveTab(tab.id);
            }}
            className={`touch-tab scroll-snap-item flex-shrink-0 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="space-y-4">
          <div>
            <p className="font-display text-lg md:text-xl italic text-foreground">
              {PHASE_SHORT[info.phase]} Day {phaseDay}
            </p>
            <p className="font-body text-[11px] text-muted-foreground" style={{ fontWeight: 300 }}>
              Cycle day {info.cycleDay}
            </p>
          </div>
          <TodayTab meals={todayMeals} phase={info.phase} cycleDay={info.cycleDay} />

          {/* Nutrients */}
          <div className="card-warm p-4 md:p-5">
            <p className="font-hand text-sm font-bold text-primary mb-3">Key nutrients today</p>
            <div className="flex flex-wrap gap-2">
              {nutrients.map((n) => (
                <span
                  key={n}
                  className="font-mono text-[10px] rounded-full px-3 py-1.5 flex items-center gap-1"
                  style={{ backgroundColor: `${PHASE_HEX[info.phase]}15`, color: PHASE_HEX[info.phase] }}
                >
                  <WildStar size={10} color={PHASE_HEX[info.phase]} /> {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "plans" && <PlansTab phase={info.phase} cycleDay={info.cycleDay} />}

      {activeTab === "recipes" && <RecipesGrid recipes={ALL_RECIPES} currentPhase={info.phase} />}

      {activeTab === "baking" && <RecipesGrid recipes={BAKING_RECIPES} currentPhase={info.phase} showBakingHeader />}

      {activeTab === "myweek" && <MyWeekTab />}

      {/* Seed cycling — static within page flow, not fixed */}
      <div className="pt-2">
        <SeedCyclingCard cycleDay={info.cycleDay} phase={info.phase} />
      </div>
    </div>
  );
}
