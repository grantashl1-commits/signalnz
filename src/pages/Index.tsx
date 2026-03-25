import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Wind, ArrowRight, Zap, ChevronDown } from "lucide-react";
import { WildStar, SeedGeometry } from "@/components/BotanicalElements";
import { PeriodDueReminder } from "@/components/DailySignal";
import { useCycle } from "@/contexts/CycleContext";
import { getCheckin, setCheckin, getCheckinStreak, Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { WORKOUTS } from "@/data/workouts";
import { getTodayAssignment } from "@/lib/workout-rotation";
import { haptic } from "@/hooks/use-mobile";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useProfile } from "@/hooks/useProfile";
import NPSSurvey from "@/components/NPSSurvey";

const CHECKIN_STATES = [
  { label: "Radiant", phase: "ovulatory" as Phase, color: "#F4A63A", response: "Golden. Today's plan leans into your glow." },
  { label: "Clear", phase: "follicular" as Phase, color: "#5B8DB8", response: "Clarity is power. Let's make the most of it." },
  { label: "Muted", phase: "luteal" as Phase, color: "#9B8FA6", response: "Noted. Today's plan is gentle." },
  { label: "Static", phase: "menstrual" as Phase, color: "#4A236E", response: "Quiet days matter. We'll keep things soft." },
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
  const [scrolled, setScrolled] = useState(false);
  const focus = FOCUS[info.phase];
  const streak = getCheckinStreak();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const bodyGoals = (() => { try { const r = localStorage.getItem("signal_body_goals"); return r ? JSON.parse(r) : []; } catch { return []; } })();
  const todayAssignment = getTodayAssignment(info.phase, bodyGoals, new Date().getDay());
  const todayWorkout = WORKOUTS.find((w) => w.id === todayAssignment.workoutId);
  const todayMeals = TODAY_MEALS[info.phase];
  const lunchMeal = todayMeals?.find((m) => m.type === "Lunch");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hasSetCycle = !!useCycle().cycleStartDate;

  // Extract first name from auth metadata, profile display name, or fallback
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
            className="font-body text-sm tracking-[0.2em] uppercase text-primary-foreground/80 mb-6"
          >
            {greeting}, {firstName || "you"}.
          </motion.p>


          <motion.p
            {...fadeUp(0.35)}
            className="font-body text-base md:text-lg text-primary-foreground/80 leading-relaxed max-w-md mx-auto mb-4"
          >
            {PHASE_SUBTEXT[info.phase]}
          </motion.p>

          <motion.p
            {...fadeUp(0.45)}
            className="font-body text-xs text-primary-foreground/60 uppercase tracking-[0.25em] mb-8"
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
            {/* Expanding pulse rings */}
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
                openSignal("Give me a signal for today", "home");
              }}
              className="relative z-10 inline-flex items-center gap-2.5 px-10 py-4.5 rounded-full bg-card text-foreground font-display text-base font-semibold shadow-elevated hover:shadow-glow transition-shadow"
            >
              <WildStar size={16} color="hsl(var(--primary))" />
              Give me a signal
            </motion.button>
          </motion.div>

          {/* Scroll hint arrow */}
          <motion.div
            {...fadeUp(0.8)}
            className="mt-10 flex flex-col items-center gap-1"
            style={{ opacity: scrolled ? 0 : 1, transition: "opacity 0.3s" }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="h-5 w-5" style={{ color: "#C9B8E8" }} />
            </motion.div>
            <span className="font-hand text-[10px] italic" style={{ color: "#C9B8E8" }}>your day at a glance</span>
          </motion.div>
        </div>
      </AtmosphericHero>

      <PeriodDueReminder />

      {/* ═══ SECTION 2 — TODAY'S FOCUS ═══ */}
      <ContentSection className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <motion.p
            {...fadeUp(0.1)}
            className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3 text-center"
          >
            What matters today
          </motion.p>
          <motion.h2
            {...fadeUp(0.15)}
            className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12"
          >
            Today's focus
          </motion.h2>

          <div className="space-y-5">
            {[
              { icon: Salad, label: "Nutrition", text: focus.nutrition },
              { icon: Dumbbell, label: "Movement", text: focus.movement },
              { icon: Wind, label: "Nervous system", text: focus.nervous },
              { icon: Moon, label: "Cycle insight", text: focus.cycle },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeUp(0.2 + i * 0.08)}
                className="rounded-[22px] bg-card p-7 md:p-8 flex items-start gap-6 shadow-soft"
              >
                <div className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-background">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="font-body text-[11px] uppercase tracking-[0.2em] text-primary font-medium">
                    {item.label}
                  </span>
                  <p className="font-body text-[15px] text-foreground mt-2.5 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ContentSection>

      {/* ═══ SECTIONS 3 & 4 — TWO-COLUMN ON DESKTOP ═══ */}
      <ContentSection className="px-5 md:px-8 py-12 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* LEFT — Check-in */}
          <motion.div {...fadeUp(0.1)}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              How are you today?
            </h2>

            <div className="flex flex-wrap gap-4 justify-start">
              {CHECKIN_STATES.map((state) => {
                const selected = checkin === state.label;
                const unselectedFade = checkin && !selected;
                return (
                  <motion.button
                    key={state.label}
                    onClick={() => handleCheckin(state.label)}
                    animate={selected ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`touch-btn flex flex-col items-center gap-3 rounded-2xl p-4 w-[72px] transition-all duration-250 ${
                      unselectedFade ? "opacity-50" : ""
                    } ${
                      selected
                        ? "ring-2 shadow-medium"
                        : "bg-card/60 hover:bg-card hover:shadow-soft"
                    }`}
                    style={selected ? {
                      backgroundColor: state.color,
                      boxShadow: `0 0 0 2px ${state.color}, 0 4px 20px ${state.color}40`,
                    } : undefined}
                  >
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
                        selected ? "shadow-soft" : "bg-background/80"
                      }`}
                      style={selected ? { backgroundColor: `${state.color}30` } : undefined}
                    >
                      <SeedGeometry
                        size={44}
                        opacity={selected ? 0.7 : 0.2}
                        color={selected ? "white" : undefined}
                      />
                    </div>
                    <span
                      className={`font-body text-xs font-medium transition-colors duration-250 ${
                        selected ? "text-white" : "text-foreground"
                      }`}
                    >
                      {state.label}
                    </span>
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
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-primary">
                    Logged: {checkin.toLowerCase()}
                  </span>
                  {streak > 1 && (
                    <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                      <WildStar size={14} /> {streak}-day streak
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT — Your day at a glance */}
          <motion.div {...fadeUp(0.2)}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Your day at a glance
            </h2>

            <div className="space-y-4">
              {[
                {
                  path: "/cycle",
                  icon: Moon,
                  label: "Cycle",
                  title: `Day ${info.cycleDay} — ${PHASE_SHORT[info.phase]}`,
                  desc: "Tap to explore your cycle insights.",
                },
                {
                  path: "/movement",
                  icon: Dumbbell,
                  label: "Movement",
                  title: todayWorkout?.name || "Today's workout",
                  desc: `${todayWorkout?.duration || "35 min"} · ${todayWorkout?.equipment || "dumbbells"}`,
                },
                {
                  path: "/nutrition",
                  icon: Salad,
                  label: "Nourish",
                  title: lunchMeal?.name || "Today's meal",
                  desc: "Tap to see your full meal plan.",
                },
              ].map((tile, i) => (
                <motion.div key={tile.path} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={tile.path}
                    className="block rounded-[22px] bg-card p-6 md:p-7 group transition-all hover:shadow-medium hover:-translate-y-0.5 shadow-soft"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                        <tile.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        {tile.label}
                      </span>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                      {tile.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
                      {tile.desc}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </ContentSection>

      {/* Bottom breathing room */}
      <div className="h-16 md:h-24" />
    </div>
  );
}
