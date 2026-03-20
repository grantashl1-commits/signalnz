import { useState } from "react";
import { GatedPage } from "@/components/FeatureGate";
import PhaseBadge from "@/components/PhaseBadge";
import { HerbCluster } from "@/components/BotanicalElements";
import SignalPulse from "@/components/SignalPulse";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { getCycleInfo, getLastPeriodStart, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { ALL_MEAL_RECIPES } from "@/lib/recipe-index";
import { BAKING_RECIPES } from "@/data/baking-recipes";
import { haptic } from "@/hooks/use-mobile";
import TodayTab from "@/components/nutrition/TodayTab";
import PlansTab from "@/components/nutrition/PlansTab";
import RecipesGrid from "@/components/nutrition/RecipesGrid";
import MyWeekTab from "@/components/nutrition/MyWeekTab";
import { ShoppingListPanel } from "@/components/ShoppingList";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

type TabId = "today" | "plans" | "myweek" | "recipes" | "baking" | "shopping";

export default function NutritionPage() {
  const info = getCycleInfo(getLastPeriodStart());
  
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const todayMeals = TODAY_MEALS[info.phase];

  const TABS: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "plans", label: "Plans" },
    { id: "myweek", label: "My Week" },
    { id: "recipes", label: "Recipes" },
    { id: "baking", label: "Baking" },
    { id: "shopping", label: "🛒 List" },
  ];

  return (
    <GatedPage requiredTier="nourished">
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <AtmosphericHero size="md">
        <div className="absolute inset-0 z-0">
          <SignalPulse />
        </div>
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Nutrition</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Nourish</h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            Eat for your cycle, not against it.
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-8 md:space-y-10 pb-24">

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
        <TodayTab meals={todayMeals} phase={info.phase} cycleDay={info.cycleDay} />
      )}

      {activeTab === "plans" && <PlansTab phase={info.phase} cycleDay={info.cycleDay} />}

      {activeTab === "recipes" && <RecipesGrid recipes={ALL_MEAL_RECIPES} currentPhase={info.phase} />}

      {activeTab === "baking" && <RecipesGrid recipes={BAKING_RECIPES} currentPhase={info.phase} showBakingHeader />}

      {activeTab === "myweek" && <MyWeekTab />}
      </ContentSection>
    </div>
    </GatedPage>
  );
}
