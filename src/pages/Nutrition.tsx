import { useState, useMemo, Component, type ReactNode } from "react";
import { GatedFeature } from "@/components/FeatureGate";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import SignalPulse from "@/components/SignalPulse";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/useProfile";
import TodayTab from "@/components/nutrition/TodayTab";
import MyWeekTab from "@/components/nutrition/MyWeekTab";
import DiscoverTab from "@/components/nutrition/DiscoverTab";
import { ShoppingListPanel } from "@/components/ShoppingList";
import { Dumbbell, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SupplementRecommender from "@/components/nutrition/SupplementRecommender";

class TabErrorBoundary extends Component<{ children: ReactNode; tab: string }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl bg-card p-8 text-center space-y-3 shadow-soft">
          <p className="font-display text-base font-bold text-foreground">Something went wrong loading {this.props.tab}</p>
          <p className="font-body text-xs text-muted-foreground">Try refreshing the page.</p>
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

type TabId = "today" | "myweek" | "discover" | "supplements" | "shop";

export default function NutritionPage() {
  const { currentPhase, currentCycleDay } = useCycle();
  const { movementGoals: profileGoals } = useProfile();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId | null) ?? "today"
  );
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
    { id: "myweek", label: "My Week" },
    { id: "discover", label: "Discover" },
    { id: "supplements", label: "Supplements" },
    { id: "shop", label: "Shop" },
  ];

  return (
    <div className="relative">
    <div className="relative">
      <AtmosphericHero size="md">
        <div className="absolute inset-0 z-0"><SignalPulse /></div>
        <div className="text-center relative z-10">
          <p className="font-body text-section-label uppercase text-primary-foreground/40 mb-4">Nutrition</p>
          <h1 className="font-display text-[2.5rem] md:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.02] mb-5">Nourish</h1>
          <p className="font-editorial text-quote italic text-primary-foreground/60 max-w-md mx-auto">
            Eat for your cycle, not against it.
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 pb-24">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
          {/* Tabs - first item */}
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

          {/* Nudge if no body goals set - below tabs */}
          {bodyGoals.length === 0 && (
            <button
              onClick={() => navigate("/movement")}
              className="w-full bg-card p-3 flex items-center gap-3 text-left transition-all active:bg-secondary/50"
              style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-soft)' }}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-body text-xs font-medium text-foreground">Want your meals to fuel your workouts?</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Set your body goals in Movement first →</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          )}

          {activeTab === "today" && <TabErrorBoundary tab="Today"><TodayTab /></TabErrorBoundary>}
          {activeTab === "myweek" && <TabErrorBoundary tab="My Week"><MyWeekTab /></TabErrorBoundary>}
          {activeTab === "discover" && <TabErrorBoundary tab="Discover"><DiscoverTab /></TabErrorBoundary>}
          {activeTab === "supplements" && <TabErrorBoundary tab="Supplements"><SupplementRecommender /></TabErrorBoundary>}
          {activeTab === "shop" && <TabErrorBoundary tab="Shop"><ShoppingListPanel /></TabErrorBoundary>}
        </div>
      </ContentSection>
    </div>
    </div>
  );
}
