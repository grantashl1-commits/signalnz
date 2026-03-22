import { useState, useMemo } from "react";
import { GatedPage } from "@/components/FeatureGate";
import PhaseBadge from "@/components/PhaseBadge";
import SignalPulse from "@/components/SignalPulse";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { useCycle } from "@/contexts/CycleContext";
import { ALL_MEAL_RECIPES } from "@/lib/recipe-index";
import { BAKING_RECIPES } from "@/data/baking-recipes";
import { haptic } from "@/hooks/use-mobile";
import TodayTab from "@/components/nutrition/TodayTab";
import PlansTab from "@/components/nutrition/PlansTab";
import RecipesGrid from "@/components/nutrition/RecipesGrid";
import MyWeekTab from "@/components/nutrition/MyWeekTab";
import AIRecipesTab from "@/components/nutrition/AIRecipesTab";
import { ShoppingListPanel } from "@/components/ShoppingList";

type TabId = "today" | "plans" | "myweek" | "ai" | "recipes" | "baking" | "shopping";

export default function NutritionPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [planVersion, setPlanVersion] = useState(0);

  const handlePlanSaved = () => setPlanVersion(v => v + 1);
  const handleSaveToToday = () => { setPlanVersion(v => v + 1); setActiveTab("today"); };

  const TABS: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "plans", label: "Plans" },
    { id: "myweek", label: "My Week" },
    { id: "ai", label: "AI Recipes" },
    { id: "recipes", label: "Recipes" },
    { id: "baking", label: "Baking" },
    { id: "shopping", label: "Shopping List" },
  ];

  return (
    <GatedPage requiredTier="nourished">
    <div className="relative">
      <AtmosphericHero size="md">
        <div className="absolute inset-0 z-0"><SignalPulse /></div>
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Nutrition</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Nourish</h1>
          <p className="font-display text-base md:text-lg italic text-primary-foreground/60 max-w-md mx-auto">
            Eat for your cycle, not against it.
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-10 md:space-y-12 pb-24">
        <PhaseBadge phase={currentPhase} cycleDay={currentCycleDay} />

        {/* Tabs */}
        <div className="scroll-snap-x flex gap-1 rounded-full bg-secondary p-1 -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { haptic("light"); setActiveTab(tab.id); }}
              className={`touch-tab scroll-snap-item flex-shrink-0 rounded-full px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "today" && <TodayTab />}
        {activeTab === "plans" && <PlansTab phase={currentPhase} cycleDay={currentCycleDay} />}
        {activeTab === "ai" && <AIRecipesTab phase={currentPhase} cycleDay={currentCycleDay} />}
        {activeTab === "recipes" && <RecipesGrid recipes={ALL_MEAL_RECIPES} currentPhase={currentPhase} />}
        {activeTab === "baking" && <RecipesGrid recipes={BAKING_RECIPES} currentPhase={currentPhase} showBakingHeader />}
        {activeTab === "myweek" && <MyWeekTab />}
        {activeTab === "shopping" && <ShoppingListPanel />}
      </ContentSection>
    </div>
    </GatedPage>
  );
}
