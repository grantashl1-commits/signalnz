import { useState, useEffect, useCallback } from "react";
import GiveSignalPanel from "@/components/signal/GiveSignalPanel";
import { Link } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WildStar, SeedGeometry } from "@/components/BotanicalElements";
import { PeriodDueReminder } from "@/components/DailySignal";
import { useCycle } from "@/contexts/CycleContext";
import { getCheckin, setCheckin, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useProfile } from "@/hooks/useProfile";
import NPSSurvey from "@/components/NPSSurvey";

const CHECKIN_STATES = [
  { label: "Radiant", phase: "ovulatory" as Phase, color: "#E8A838", bg: "#FDF3E0", textDark: "#8B6914", response: "Golden. Today's plan leans into your glow." },
  { label: "Clear", phase: "follicular" as Phase, color: "#5B8DB8", bg: "#E4EEF6", textDark: "#2E5A7A", response: "Clarity is power. Let's make the most of it." },
  { label: "Muted", phase: "luteal" as Phase, color: "#9B8FA6", bg: "#EDE8F0", textDark: "#5E4F6B", response: "Noted. Today's plan is gentle." },
  { label: "Static", phase: "menstrual" as Phase, color: "#1A0F2E", bg: "#E0DAE8", textDark: "#1A0F2E", response: "Quiet days matter. We'll keep things soft." },
];

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
  const { openSignal } = useSignalPanel();
  const { displayName, onboardingComplete, loading: profileLoading, refetch } = useProfile();
  const { currentPhase, currentCycleDay } = useCycle();
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  const [checkin, setCheckinState] = useState(getCheckin() || "");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [giveSignalOpen, setGiveSignalOpen] = useState(false);
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

  const handleCheckin = (state: string) => {
    haptic("medium");
    setCheckin(state);
    setCheckinState(state);
  };

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

          <motion.div {...fadeUp(0.6)} className="relative">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 pointer-events-none"
                style={{ width: 200, height: 56 }}
                animate={{
                  scaleX: [1, 2.2, 3],
                  scaleY: [1, 1.8, 2.4],
                  opacity: [0.35, 0.12, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1.3,
                  ease: "easeOut",
                }}
              />
            ))}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                haptic("medium");
                setGiveSignalOpen(true);
              }}
              className="relative z-10 inline-flex items-center gap-2.5 px-10 py-[1.125rem] rounded-full bg-card text-foreground font-display text-base font-semibold shadow-elevated hover:shadow-glow transition-shadow"
            >
              <WildStar size={16} color="hsl(var(--primary))" />
              Give me a signal
            </motion.button>
          </motion.div>
        </div>
      </AtmosphericHero>

      <PeriodDueReminder />

      {/* ═══ SECTION 2 — TODAY'S FOCUS (single compact card) ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
          <motion.div {...fadeUp(0.1)} className="card-warm space-y-3">
            <p className="font-mono text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>today</p>
            {[
              { label: "eat", value: focus.nutrition },
              { label: "move", value: focus.movement },
              { label: "rest", value: focus.nervous },
              { label: "cycle", value: focus.cycle },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 items-start">
                <span className="font-mono text-section-label w-10 pt-0.5" style={{ color: 'hsl(var(--label-color))' }}>{label}</span>
                <p className="text-body-lg text-foreground/70 leading-snug flex-1">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </ContentSection>

      {/* ═══ SECTION 3 — CHECK-IN ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp(0.1)}>
            <h2 className="font-display text-card-title font-bold text-foreground mb-8">
              How are you today?
            </h2>

            <div className="flex flex-col gap-3">
              {CHECKIN_STATES.map((state) => {
                const selected = checkin === state.label;
                const unselectedFade = checkin && !selected;
                return (
                  <motion.button
                    key={state.label}
                    onClick={() => handleCheckin(state.label)}
                    animate={selected ? { scale: 1.04 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="touch-btn flex items-center gap-4 rounded-full min-h-[56px] px-5 py-3 transition-all duration-300 w-full text-left"
                    style={{
                      backgroundColor: selected ? state.color : state.bg,
                      boxShadow: selected
                        ? `0 4px 20px ${state.color}30, 0 0 0 2px ${state.color}`
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      opacity: unselectedFade ? 0.5 : 1,
                    }}
                  >
                    {/* Colour dot indicator */}
                    <motion.div
                      animate={selected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: selected ? 'rgba(255,255,255,0.9)' : state.color,
                        boxShadow: selected ? `0 0 8px ${state.color}80` : 'none',
                      }}
                    />
                    <span
                      className="font-display text-[15px] font-semibold flex-1 transition-colors duration-300"
                      style={{ color: selected ? (state.label === 'Static' ? '#FDFCFB' : '#FDFCFB') : state.textDark }}
                    >
                      {state.label}
                    </span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {checkin && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-2"
              >
                <p className="font-display text-sm italic text-foreground/80">
                  {CHECKIN_STATES.find(s => s.label === checkin)?.response}
                </p>
                <span className="font-body text-xs text-primary">
                  Logged: {checkin.toLowerCase()}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </ContentSection>

      <div style={{ height: 'var(--section-gap)' }} />

      <GiveSignalPanel open={giveSignalOpen} onClose={() => setGiveSignalOpen(false)} />
    </div>
  );
}
