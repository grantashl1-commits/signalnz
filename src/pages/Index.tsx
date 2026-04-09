import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { PeriodDueReminder } from "@/components/DailySignal";
import { useCycle } from "@/contexts/CycleContext";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useProfile } from "@/hooks/useProfile";
import NPSSurvey from "@/components/NPSSurvey";
import HomeHabitsTracker from "@/components/HomeHabitsTracker";

const FOCUS: Record<Phase, { nutrition: string; movement: string; nervous: string; cycle: string }> = {
  follicular: {
    nutrition: "Embrace fermented foods and complex carbs as estrogen rises.",
    movement: "This is your strength window — lift heavy, push harder.",
    nervous: "Coherent breathing — 5 breaths per minute for 5 minutes.",
    cycle: "Estrogen is climbing — energy and clarity are your superpowers right now.",
  },
  menstrual: {
    nutrition: "Focus on iron-rich foods with vitamin C to support your body.",
    movement: "Rest is productive. Gentle yoga and walking only.",
    nervous: "Physiological sigh — instant calm when you need it.",
    cycle: "Honour your need for rest. This is your inner winter.",
  },
  ovulatory: {
    nutrition: "Antioxidants, folate, and zinc for peak hormonal output.",
    movement: "Peak energy — go for high intensity and group workouts.",
    nervous: "You're naturally more social — lean into connection.",
    cycle: "You're at your communicative peak — use this window wisely.",
  },
  luteal: {
    nutrition: "Higher calorie needs are normal. Eat nutrient-dense complex carbs.",
    movement: "Intuitive movement. Pilates, moderate strength, walk when in doubt.",
    nervous: "4-7-8 breathing before bed for deeper sleep.",
    cycle: "Progesterone is rising — turn inward and prioritise rest.",
  },
};

const PHASE_SUBTEXT: Record<Phase, string> = {
  menstrual: "Your body is in its Menstrual phase — rest and restoration are your focus.",
  follicular: "Your body is in its Follicular phase — energy and clarity are rising.",
  ovulatory: "Your body is in its Ovulatory phase — you're at your peak.",
  luteal: "Your body is in its Luteal phase — slow down and turn inward.",
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" as const },
});

export default function HomePage() {
  const { user } = useAuth();
  const { displayName, onboardingComplete, loading: profileLoading, refetch } = useProfile();
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  const [showOnboarding, setShowOnboarding] = useState(false);
  const focus = FOCUS[info.phase];

  useEffect(() => {
    const localDone = localStorage.getItem("signal_onboarding_complete") === "true";
    if (user && !profileLoading && onboardingComplete === false && !localDone) {
      setShowOnboarding(true);
    }
  }, [user, profileLoading, onboardingComplete]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refetch();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hasSetCycle = !!useCycle().cycleStartDate;

  const firstName = (() => {
    const meta = user?.user_metadata;
    if (displayName) return displayName.split(" ")[0];
    if (meta?.full_name) return (meta.full_name as string).split(" ")[0];
    if (meta?.name) return (meta.name as string).split(" ")[0];
    return null;
  })();

  if (showOnboarding) return <OnboardingFlow onComplete={handleOnboardingComplete} />;

  return (
    <div className="relative">
      <NPSSurvey />
      {/* ═══ SECTION 1 — HERO / CONTEXT ═══ */}
      <AtmosphericHero size="lg">
        <SignalPulse />
        <div className="text-center max-w-xl mx-auto relative z-10">
          <motion.p
            {...fadeUp(0.1)}
            className="font-body text-section-label uppercase text-primary-foreground/80 mb-8"
          >
            {greeting}, {firstName || "you"}.
          </motion.p>

          <motion.p
            {...fadeUp(0.35)}
            className="font-body text-[1.75rem] md:text-[2rem] font-bold text-primary-foreground leading-tight max-w-md mx-auto mb-6"
          >
            {PHASE_SUBTEXT[info.phase]}
          </motion.p>

          <motion.p
            {...fadeUp(0.45)}
            className="font-body text-section-label text-primary-foreground/60 uppercase mb-10"
          >
            Day {info.cycleDay} · {PHASE_SHORT[info.phase]}
          </motion.p>

          {!hasSetCycle && (
            <motion.div {...fadeUp(0.5)} className="mb-8">
              <Link
                to="/cycle"
                className="inline-flex items-center gap-2 rounded-full bg-card/20 backdrop-blur-sm border border-primary-foreground/20 px-5 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-card/30 transition-colors"
              >
                Set up your cycle <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </AtmosphericHero>

      <PeriodDueReminder />

      {/* ═══ SECTION 2 — TODAY'S FOCUS ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
          <motion.div {...fadeUp(0.1)} className="card-warm space-y-3">
            <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>today</p>
            {[
              { label: "eat", value: focus.nutrition },
              { label: "move", value: focus.movement },
              { label: "rest", value: focus.nervous },
              { label: "cycle", value: focus.cycle },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 items-start">
                <span className="font-body text-section-label w-10 pt-0.5" style={{ color: 'hsl(var(--label-color))' }}>{label}</span>
                <p className="text-body-lg text-foreground/70 leading-snug flex-1">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </ContentSection>

      {/* ═══ SECTION 3 — TODAY'S HABITS + SLEEP ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp(0.15)}>
            <HomeHabitsTracker phase={info.phase} />
          </motion.div>
        </div>
      </ContentSection>

      <div style={{ height: 'var(--section-gap)' }} />
    </div>
  );
}
