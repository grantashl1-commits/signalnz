import { Button } from "@/components/ui/button";
import { usePageTab } from "@/hooks/usePageTab";
import PageHeading from "@/components/ui/PageHeading";
import { Utensils as PageIcon } from "lucide-react";
import { useState, useMemo, Component, type ReactNode } from "react";
import { GatedFeature } from "@/components/FeatureGate";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { ContentSection } from "@/components/AtmosphericSection";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/useProfile";
import TodayTab from "@/components/nutrition/TodayTab";
import MyWeekTab from "@/components/nutrition/MyWeekTab";
import DiscoverTab from "@/components/nutrition/DiscoverTab";
import WeekShoppingList from "@/components/nutrition/WeekShoppingList";
import { Dumbbell, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SupplementRecommender from "@/components/nutrition/SupplementRecommender";
import MyRecipesTab from "@/components/nutrition/MyRecipesTab";
import NourishStreakBadge from "@/components/nutrition/NourishStreakBadge";

class TabErrorBoundary extends Component<{ children: ReactNode; tab: string }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl bg-card p-8 text-center space-y-3 shadow-soft">
          <p className="font-display text-base font-bold text-foreground">{this.props.tab} didn't come through</p>
          <p className="font-body text-xs text-muted-foreground">Try refreshing — it usually lands.</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="font-body text-xs text-primary underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type TabId = "today" | "myweek" | "discover" | "myrecipes" | "supplements" | "shop";

export default function NutritionPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const { movementGoals: profileGoals } = useProfile();
  const [activeTab, setActiveTab] = usePageTab<TabId>(["today", "myweek", "shop", "discover", "myrecipes", "supplements"], "today");
  const navigate = useNavigate();

  const bodyGoals = useMemo<string[]>(() => {
    if (profileGoals && profileGoals.length > 0) return profileGoals;
    try {
      const raw = localStorage.getItem("signal_body_goals");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, [profileGoals]);

  const TABS: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "myweek", label: "Plan" },
    { id: "shop", label: "List" },
    { id: "discover", label: "Recipes" },
    { id: "myrecipes", label: "Saved" },
    { id: "supplements", label: "Supplements" },
  ];

  return (
    <div className="member-page member-page-eat relative">
    <div className="relative">
      <PageHeading title="Eat" label="Food & meal planning" icon={PageIcon} tone="eat">
          Eat with your cycle, in the shape of today.
        </PageHeading>

      <ContentSection className="px-5 md:px-4 pb-24">
        <div className="space-y-6">
          
          {/* Tabs - first item */}
          <div className="page-tabs scroll-snap-x flex gap-1 border-b border-border pb-2">
            {TABS.map((tab) => (
              <Button
                variant="ghost"
                aria-pressed={activeTab === tab.id}
                key={tab.id}
                onClick={() => { haptic("light"); setActiveTab(tab.id); }}
                className={`touch-tab scroll-snap-item flex-shrink-0 rounded-lg px-3 py-2.5 min-h-[44px] font-body text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-eat/15 text-foreground" : "text-muted-foreground active:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Nudge if no body goals set - below tabs */}
          {bodyGoals.length === 0 && (
            <button
              onClick={() => navigate("/account")}
              className="w-full bg-card p-3 flex items-center gap-3 text-left transition-all active:bg-secondary/50"
              style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-soft)' }}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-medium text-foreground">Want your meals to fuel your workouts?</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Set your movement goals in Account first →</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          )}

          {activeTab === "today" && <TabErrorBoundary tab="Today"><TodayTab /></TabErrorBoundary>}
          {activeTab === "myweek" && <TabErrorBoundary tab="My Week"><MyWeekTab /></TabErrorBoundary>}
          {activeTab === "discover" && <TabErrorBoundary tab="Discover"><DiscoverTab /></TabErrorBoundary>}
          {activeTab === "myrecipes" && <TabErrorBoundary tab="My Recipes"><MyRecipesTab /></TabErrorBoundary>}
          {activeTab === "supplements" && <TabErrorBoundary tab="Supplements"><SupplementRecommender /></TabErrorBoundary>}
          {activeTab === "shop" && <TabErrorBoundary tab="Shop"><WeekShoppingList /></TabErrorBoundary>}
        </div>
      </ContentSection>
    </div>
    </div>
  );
}
