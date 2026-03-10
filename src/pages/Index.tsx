import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Wind, Droplets, Sprout, Clock, Heart, PenLine, Users } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { SacredSpiral, BotanicalSprig, HandUnderline, SeedGeometry, WildStar, CymatiSketch, RootSystem } from "@/components/BotanicalElements";
import DailySignalCard, { PeriodDueReminder } from "@/components/DailySignal";
import { getCycleInfo, getLastPeriodStart, getCheckin, setCheckin, getCheckinStreak, getWaterCount, setWaterCount, getSeedCyclingDay, getPhaseFromDay, Phase, getSeedsTaken, setSeedsTaken } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { TODAY_WORKOUT, WORKOUTS } from "@/data/workouts";
import { getHabits, getHabitLog, toggleHabitForDate, getWeekHabitData, HABIT_CATEGORIES, CATEGORY_DOT_CLASSES } from "@/data/self-care-rituals";
import { haptic } from "@/hooks/use-mobile";
import SignalHomeSection from "@/components/signal/SignalHomeSection";
import { useSignalPanel } from "@/hooks/useSignalPanel";
import { AtmosphericHero, ContentSection, SectionDivider, AnimatedCard } from "@/components/AtmosphericSection";

const CHECKIN_STATES = [
  { label: "Radiant", phase: "ovulatory" as Phase },
  { label: "Clear", phase: "follicular" as Phase },
  { label: "Steady", phase: "follicular" as Phase },
  { label: "Muted", phase: "luteal" as Phase },
  { label: "Static", phase: "menstrual" as Phase },
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

const PHASE_POETRY: Record<Phase, string> = {
  menstrual: "Rest is its own kind of wisdom.",
  follicular: "Your body is rising into its power phase.",
  ovulatory: "You are transmitting at full signal.",
  luteal: "The harvest is rich. Honour the complexity.",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function HomePage({ userName }: { userName?: string }) {
  const { openSignal } = useSignalPanel();
  const info = getCycleInfo(getLastPeriodStart());
  const [checkin, setCheckinState] = useState(getCheckin() || "");
  const [water, setWaterState] = useState(getWaterCount());
  const focus = FOCUS[info.phase];
  const streak = getCheckinStreak();
  const seedInfo = getSeedCyclingDay(info.cycleDay);
  const todayStr = new Date().toISOString().split("T")[0];
  const [seedsTakenToday, setSeedsTakenToday] = useState(getSeedsTaken(todayStr));

  const habits = getHabits();
  const [habitLog, setHabitLog] = useState(getHabitLog(todayStr));

  const todayWorkout = WORKOUTS.find((w) => w.id === TODAY_WORKOUT[info.phase]);
  const todayMeals = TODAY_MEALS[info.phase];
  const lunchMeal = todayMeals?.find((m) => m.type === "Lunch");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleCheckin = (state: string) => {
    haptic("medium");
    setCheckin(state);
    setCheckinState(state);
  };

  const addWater = () => {
    haptic("light");
    const next = Math.min(water + 1, 8);
    setWaterState(next);
    setWaterCount(next);
  };

  const handleHabitToggle = (habitId: string) => {
    haptic("light");
    const newVal = toggleHabitForDate(todayStr, habitId);
    setHabitLog(prev => ({ ...prev, [habitId]: newVal }));
  };

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });

  const weekHabitData = habits.length > 0 ? getWeekHabitData(weekDays) : [];
  const habitsCompleted = Object.values(habitLog).filter(Boolean).length;

  return (
    <div className="relative">
      {/* ═══ HERO — atmospheric purple section ═══ */}
      <AtmosphericHero size="lg">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/50 mb-5"
          >
            {greeting}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-[3.5rem] md:text-[5rem] font-extrabold text-primary-foreground leading-[1.02] mb-5"
          >
            {userName || "you"}.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="font-display text-lg md:text-xl italic text-primary-foreground/70 max-w-md mx-auto mb-10"
          >
            {PHASE_POETRY[info.phase]}
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { haptic("medium"); openSignal("Give me a signal for today", "home"); }}
              className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-card text-foreground font-display text-base font-semibold shadow-elevated hover:shadow-glow transition-shadow"
            >
              <WildStar size={16} color="hsl(var(--primary))" />
              Give me a signal
            </motion.button>
          </motion.div>

          {/* Phase indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="flex items-center justify-center gap-2 mt-10"
          >
            <span className="font-body text-xs text-primary-foreground/40 uppercase tracking-widest">
              Day {info.cycleDay} · {info.name}
            </span>
          </motion.div>
        </div>
      </AtmosphericHero>

      {/* ═══ DAILY SIGNAL — cream content section ═══ */}
      <ContentSection className="px-5 md:px-4">
        <AnimatedCard index={0}>
          <DailySignalCard />
        </AnimatedCard>
        <PeriodDueReminder />
      </ContentSection>

      {/* ═══ GIVE ME A SIGNAL — editorial section ═══ */}
      <ContentSection className="px-5 md:px-4">
        <SignalHomeSection onOpenSignal={(prompt) => openSignal(prompt, "home")} />
      </ContentSection>

      <SectionDivider />

      {/* ═══ TODAY'S WORLD — cream cards ═══ */}
      <ContentSection className="px-5 md:px-4">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8 text-center">
          Your day at a glance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { path: "/cycle", label: "Cycle", icon: Moon, title: `Day ${info.cycleDay} — ${info.name.replace(" Phase", "")}`, desc: focus.cycle },
            { path: "/nutrition", label: "Nourish", icon: Salad, title: lunchMeal?.name || "Today's meals", desc: focus.nutrition },
            { path: "/movement", label: "Move", icon: Dumbbell, title: todayWorkout?.name || "Today's workout", desc: `${todayWorkout?.duration || ""} · ${todayWorkout?.equipment || ""}` },
            { path: "/breathwork", label: "Mindful", icon: Wind, title: "Coherent Breathing", desc: focus.nervous },
            { path: "/journal", label: "Journal", icon: PenLine, title: "My Journal", desc: "Reflect, track your mood, and receive AI soul analysis." },
            { path: "/community", label: "Community", icon: Users, title: "Community", desc: "Find your neighbours. Share your skills. Build the village." },
          ].map((tile, i) => (
            <motion.div
              key={tile.path}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={tile.path} className="block rounded-[22px] bg-card p-7 md:p-8 h-full group relative overflow-hidden transition-all hover:shadow-medium hover:-translate-y-0.5 touch-card shadow-soft">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center">
                    <tile.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{tile.label}</span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mt-3">{tile.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-2.5 leading-relaxed line-clamp-2">{tile.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* ═══ DAILY HABITS — atmospheric purple ═══ */}
      {habits.length > 0 && (
        <AtmosphericHero size="sm" dotOpacity={0.05}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">Daily Habits</p>
            <Link to="/my-practice" className="font-body text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors">
              manage
            </Link>
          </div>
          <div className="rounded-[20px] bg-card/95 backdrop-blur-sm p-5 md:p-6 border border-border/50" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4 text-bloom" />
              <span className="font-mono text-sm text-foreground">{habitsCompleted}/{habits.length}</span>
              <span className="font-body text-xs text-muted-foreground">complete today</span>
            </div>
            <div className="space-y-2">
              {habits.slice(0, 6).map(habit => {
                const done = habitLog[habit.id] || false;
                const dotClass = CATEGORY_DOT_CLASSES[habit.category] || "bg-bloom";
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitToggle(habit.id)}
                    className="touch-btn w-full flex items-center gap-2.5 py-2 text-left"
                  >
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? "border-bloom bg-bloom/20" : "border-border"}`}>
                      {done && <WildStar size={10} />}
                    </div>
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${dotClass}`} />
                    <span className={`font-body text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {habit.name}
                    </span>
                  </button>
                );
              })}
              {habits.length > 6 && (
                <Link to="/my-practice" className="block font-body text-xs text-muted-foreground text-center mt-2">
                  +{habits.length - 6} more
                </Link>
              )}
            </div>
          </div>
        </AtmosphericHero>
      )}

      {/* ═══ CHECK-IN — cream section ═══ */}
      <ContentSection className="px-5 md:px-4">
        <div className="rounded-[20px] bg-card border border-border p-6 md:p-8" style={{ boxShadow: "0 4px 20px rgba(139, 111, 94, 0.08)" }}>
          <p className="font-display text-xl md:text-2xl font-bold text-foreground mb-5 text-center">How are you today?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {CHECKIN_STATES.map((state) => {
              const selected = checkin === state.label;
              return (
                <button
                  key={state.label}
                  onClick={() => handleCheckin(state.label)}
                  className={`touch-btn flex flex-col items-center gap-1.5 rounded-2xl p-3 w-16 md:w-20 min-h-[60px] transition-all ${
                    selected
                      ? "ring-2 ring-primary scale-110 bg-secondary shadow-md"
                      : "bg-secondary/50 active:bg-secondary/80"
                  }`}
                >
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-background flex items-center justify-center overflow-hidden border border-border">
                    <SeedGeometry size={40} opacity={selected ? 0.5 : 0.2} color={selected ? `hsl(var(--phase-${state.phase}))` : undefined} />
                  </div>
                  <span className="font-body text-xs font-medium text-foreground">{state.label}</span>
                </button>
              );
            })}
          </div>
          {checkin && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="font-body text-sm text-primary">Logged: {checkin.toLowerCase()}</span>
              {streak > 1 && (
                <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                  <WildStar size={14} /> {streak}-day streak
                </span>
              )}
            </div>
          )}
        </div>
      </ContentSection>

      <SectionDivider />

      {/* ═══ WEEK SNAPSHOT ═══ */}
      <ContentSection className="px-5 md:px-4">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">This Week</p>
        <div className="scroll-snap-x flex gap-2 pb-2 justify-center">
          {weekDays.map((date, i) => {
            const dateStr = date.toISOString().split("T")[0];
            const isToday = dateStr === today.toISOString().split("T")[0];
            const lastPeriod = getLastPeriodStart();
            const cycleDay = lastPeriod ? (((Math.floor((date.getTime() - new Date(lastPeriod).getTime()) / (1000 * 60 * 60 * 24))) % 28) + 28) % 28 + 1 : info.cycleDay;
            const phase = getPhaseFromDay(cycleDay);
            const checkedIn = !!localStorage.getItem(`mindcast_checkin_${dateStr}`);

            return (
              <div
                key={i}
                className={`scroll-snap-item flex-shrink-0 w-16 rounded-2xl p-3 text-center transition-all ${
                  isToday ? "bg-card ring-1 ring-primary/30 shadow-sm border border-border" : "bg-secondary/40"
                }`}
              >
                <p className="font-body text-[10px] text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </p>
                <p className="font-mono text-sm text-foreground mt-0.5">{date.getDate()}</p>
                <div className="mx-auto mt-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(var(--phase-${phase}))` }} />
                {checkedIn && <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-primary/60" />}
                <p className="font-mono text-[8px] text-muted-foreground mt-0.5">D{cycleDay}</p>
              </div>
            );
          })}
        </div>
      </ContentSection>

      {/* ═══ HABIT GRID ═══ */}
      {habits.length > 0 && (
        <ContentSection className="px-5 md:px-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Habit Grid</p>
            <Link to="/my-practice" className="font-body text-xs text-muted-foreground">
              full view
            </Link>
          </div>
          <div className="rounded-[20px] bg-card border border-border p-4 overflow-x-auto" style={{ boxShadow: "0 4px 20px rgba(139, 111, 94, 0.08)" }}>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `100px repeat(7, 1fr)`, minWidth: 360 }}>
              <div />
              {weekDays.map((d, i) => {
                const isToday = d.toISOString().split("T")[0] === todayStr;
                return (
                  <div key={i} className={`text-center py-0.5 ${isToday ? "bg-primary/10 rounded" : ""}`}>
                    <p className="font-body text-[8px] text-muted-foreground">
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </p>
                  </div>
                );
              })}
              {habits.slice(0, 8).map(habit => {
                const dotClass = CATEGORY_DOT_CLASSES[habit.category] || "bg-bloom";
                return (
                  <div key={habit.id} className="contents">
                    <div className="flex items-center gap-1 pr-1 py-0.5">
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                      <span className="font-body text-[8px] text-foreground truncate">{habit.name}</span>
                    </div>
                    {weekHabitData.map((day, i) => {
                      const done = day.log[habit.id] || false;
                      const isDayToday = day.date === todayStr;
                      return (
                        <div key={i} className={`flex items-center justify-center py-0.5 ${isDayToday ? "bg-primary/10 rounded" : ""}`}>
                          {done ? (
                            <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full border border-border/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </ContentSection>
      )}

      {/* ═══ QUICK ACTIONS — atmospheric section ═══ */}
      <AtmosphericHero size="sm" dotOpacity={0.05}>
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60 mb-5 text-center">Quick Actions</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] bg-card/95 backdrop-blur-sm border border-border/50 p-5" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="h-4 w-4 text-phase-follicular" />
              <span className="font-body text-xs font-medium text-phase-follicular uppercase tracking-wider">Hydration</span>
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`h-4 w-4 rounded-full border transition-all ${i < water ? "bg-phase-follicular/40 border-phase-follicular/60" : "border-border"}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">{water}/8</span>
              <button onClick={addWater} disabled={water >= 8} className="touch-btn rounded-full bg-phase-follicular/10 px-3 py-1.5 min-h-[36px] font-mono text-[10px] text-phase-follicular active:bg-phase-follicular/20 transition-colors disabled:opacity-30">
                +1
              </button>
            </div>
          </div>

          <div className="rounded-[20px] bg-card/95 backdrop-blur-sm border border-border/50 p-5" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="h-4 w-4 text-sage-mist" />
              <span className="font-body text-xs font-medium text-sage-mist uppercase tracking-wider">Seeds</span>
            </div>
            <p className="font-body text-sm text-foreground">{seedInfo.seeds}</p>
            <p className="font-mono text-[9px] text-muted-foreground mt-1">{seedInfo.phase} · D{info.cycleDay}</p>
            {!seedsTakenToday && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedsTakenToday}
                  onChange={(e) => { haptic("light"); setSeedsTakenToday(e.target.checked); setSeedsTaken(todayStr, e.target.checked); }}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body text-xs text-muted-foreground">Seeds today?</span>
              </label>
            )}
            {seedsTakenToday && (
              <p className="font-body text-xs text-phase-follicular mt-2">Seeds taken</p>
            )}
          </div>

          <div className="rounded-[20px] bg-card/95 backdrop-blur-sm border border-border/50 p-5" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-lavender-dust" />
              <span className="font-body text-xs font-medium text-lavender-dust uppercase tracking-wider">Wind-down</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">Evening breathwork at 8pm.</p>
          </div>
        </div>
      </AtmosphericHero>

      {/* ═══ TODAY'S FOCUS — cream section ═══ */}
      <ContentSection className="px-5 md:px-4">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center">Today's Focus</p>
        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            { icon: Salad, label: "Nutrition", text: focus.nutrition },
            { icon: Dumbbell, label: "Movement", text: focus.movement },
            { icon: Wind, label: "Nervous System", text: focus.nervous },
            { icon: Moon, label: "Cycle", text: focus.cycle },
          ].map((item, i) => (
            <AnimatedCard key={item.label} index={i}>
              <div className="rounded-[20px] bg-card border border-border p-5 md:p-6 flex items-start gap-4" style={{ boxShadow: "0 4px 20px rgba(139, 111, 94, 0.08)" }}>
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="font-body text-[10px] uppercase tracking-[0.15em] text-primary font-medium">{item.label}</span>
                  <p className="font-body text-sm text-foreground mt-1.5 leading-relaxed">{item.text}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ContentSection>

      {/* Bottom breathing room */}
      <div className="h-8 md:h-12" />
    </div>
  );
}
