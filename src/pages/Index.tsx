import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Wind, Droplets, Sprout, Clock } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { SacredSpiral, BotanicalSprig, HandUnderline, SeedGeometry, WildStar, CymatiSketch, RootSystem } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart, getCheckin, setCheckin, getCheckinStreak, getWaterCount, setWaterCount, getSeedCyclingDay, getPhaseFromDay, Phase } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { TODAY_WORKOUT, WORKOUTS } from "@/data/workouts";
import { haptic } from "@/hooks/use-mobile";

const CHECKIN_STATES = [
  { label: "Radiant", phase: "ovulatory" as Phase },
  { label: "Clear", phase: "follicular" as Phase },
  { label: "Steady", phase: "follicular" as Phase },
  { label: "Muted", phase: "luteal" as Phase },
  { label: "Static", phase: "menstrual" as Phase },
];

const FOCUS: Record<Phase, { nutrition: string; movement: string; nervous: string; cycle: string }> = {
  follicular: {
    nutrition: "Embrace fermented foods and complex carbs as estrogen rises",
    movement: "This is your strength window — lift heavy, push harder",
    nervous: "Coherent breathing — 5 breaths per minute for 5 minutes",
    cycle: "Estrogen is climbing — energy and clarity are your superpowers right now",
  },
  menstrual: {
    nutrition: "Focus on iron-rich foods with vitamin C to support your body",
    movement: "Rest is productive. Gentle yoga and walking only",
    nervous: "Physiological sigh — instant calm when you need it",
    cycle: "Honour your need for rest. This is your inner winter",
  },
  ovulatory: {
    nutrition: "Antioxidants, folate, and zinc for peak hormonal output",
    movement: "Peak energy — go for high intensity and group workouts",
    nervous: "You're naturally more social — lean into connection",
    cycle: "You're at your communicative peak — use this window wisely",
  },
  luteal: {
    nutrition: "Higher calorie needs are normal. Eat nutrient-dense complex carbs",
    movement: "Intuitive movement. Pilates, moderate strength, walk when in doubt",
    nervous: "4-7-8 breathing before bed for deeper sleep",
    cycle: "Progesterone is rising — turn inward and prioritise rest",
  },
};

const PHASE_POETRY: Record<Phase, string> = {
  menstrual: "rest is its own kind of wisdom.",
  follicular: "your body is rising into its power phase.",
  ovulatory: "you are transmitting at full signal.",
  luteal: "the harvest is rich. honour the complexity.",
};

// Mobile animation variants
const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" },
  }),
};

export default function HomePage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [checkin, setCheckinState] = useState(getCheckin() || "");
  const [water, setWaterState] = useState(getWaterCount());
  const focus = FOCUS[info.phase];
  const streak = getCheckinStreak();
  const seedInfo = getSeedCyclingDay(info.cycleDay);

  const todayWorkout = WORKOUTS.find((w) => w.id === TODAY_WORKOUT[info.phase]);
  const todayMeals = TODAY_MEALS[info.phase];
  const lunchMeal = todayMeals?.find((m) => m.type === "Lunch");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : "good evening";

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

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 relative">
      {/* Background decorations — scaled for mobile */}
      <div className="absolute top-0 right-0 -translate-y-4 md:-translate-y-8 translate-x-4 md:translate-x-8 pointer-events-none">
        <SacredSpiral size={120} opacity={0.15} className="md:hidden" />
        <SacredSpiral size={180} opacity={0.2} className="hidden md:block" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-16 md:translate-y-20 -translate-x-6 md:-translate-x-10 pointer-events-none">
        <RootSystem size={180} opacity={0.05} className="md:hidden" />
        <RootSystem size={250} opacity={0.06} className="hidden md:block" />
      </div>

      {/* Greeting */}
      <div className="pt-2 md:pt-4">
        <p className="font-hand text-base md:text-lg text-primary">{greeting},</p>
        <h1 className="font-display text-[2.8rem] md:text-6xl font-bold italic text-foreground leading-none mt-1">
          you.
        </h1>
        <HandUnderline width={60} className="mt-1 md:hidden" />
        <HandUnderline width={80} className="mt-1 hidden md:block" />
        <p className="font-display text-base md:text-lg italic text-muted-foreground mt-2 md:mt-3">
          {PHASE_POETRY[info.phase]}
        </p>

        <BotanicalSprig width={200} className="mt-3 md:mt-4 mx-auto md:hidden" />
        <BotanicalSprig width={280} className="mt-4 mx-auto hidden md:block" />
      </div>

      {/* Today Cards — single column on mobile, 2x2 on desktop */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { path: "/cycle", label: "cycle", icon: Moon, title: `Day ${info.cycleDay} — ${info.name.replace(" Phase", "")}`, desc: focus.cycle },
            { path: "/nutrition", label: "nutrition", icon: Salad, title: lunchMeal?.name || "Today's meals", desc: focus.nutrition },
            { path: "/movement", label: "movement", icon: Dumbbell, title: todayWorkout?.name || "Today's workout", desc: `${todayWorkout?.duration || ""} · ${todayWorkout?.equipment || ""}` },
            { path: "/breathwork", label: "nervous system", icon: Wind, title: "Coherent Breathing", desc: focus.nervous },
          ].map((tile, i) => (
            <motion.div
              key={tile.path}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={tile.path} className="frequency-panel block p-4 md:p-5 h-full group relative overflow-hidden touch-card" style={{ "--panel-color": `hsl(var(--phase-${info.phase}))` } as React.CSSProperties}>
                <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 -translate-y-2 translate-x-2 pointer-events-none opacity-[0.08]">
                  <CymatiSketch phase={info.phase} size={48} opacity={1} />
                </div>
                <p className="font-hand text-sm font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>{tile.label}</p>
                <h3 className="font-display text-base md:text-lg italic text-foreground leading-tight mt-1">{tile.title}</h3>
                <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{tile.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Daily Check-in */}
      <section className="card-warm p-5 md:p-6">
        <p className="font-hand text-base md:text-lg text-primary mb-3 md:mb-4">how are you today?</p>
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
          {CHECKIN_STATES.map((state) => {
            const selected = checkin === state.label;
            return (
              <button
                key={state.label}
                onClick={() => handleCheckin(state.label)}
                className={`touch-btn flex flex-col items-center gap-1 rounded-2xl p-2.5 md:p-3 w-14 md:w-16 min-h-[52px] ${
                  selected
                    ? "ring-2 ring-primary scale-110 bg-secondary shadow-md"
                    : "bg-secondary/50 active:bg-secondary/80"
                }`}
              >
                <div className="h-11 w-11 md:h-14 md:w-14 rounded-full bg-background flex items-center justify-center overflow-hidden border border-border">
                  <SeedGeometry size={40} opacity={selected ? 0.5 : 0.2} color={selected ? `hsl(var(--phase-${state.phase}))` : undefined} />
                </div>
                <span className="font-hand text-[10px] md:text-xs font-bold text-foreground">{state.label}</span>
              </button>
            );
          })}
        </div>
        {checkin && (
          <div className="flex items-center justify-center gap-3 mt-3 md:mt-4">
            <span className="font-hand text-sm text-primary">logged: {checkin.toLowerCase()}</span>
            {streak > 1 && (
              <span className="flex items-center gap-1 font-hand text-sm text-muted-foreground">
                <WildStar size={14} /> {streak}-day streak
              </span>
            )}
          </div>
        )}
      </section>

      {/* Week Snapshot — horizontal scroll */}
      <section>
        <p className="font-hand text-sm font-bold text-primary mb-3">this week</p>
        <div className="scroll-snap-x flex gap-2 pb-2 -mx-1 px-1">
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
                className={`scroll-snap-item flex-shrink-0 w-16 rounded-2xl p-2.5 text-center transition-all ${
                  isToday ? "bg-card ring-1 ring-primary/30 shadow-sm" : "bg-secondary/40"
                }`}
              >
                <p className="font-body text-[10px] text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </p>
                <p className="font-mono text-sm text-foreground mt-0.5">{date.getDate()}</p>
                <div className={`mx-auto mt-1 h-2 w-2 rounded-full`} style={{ backgroundColor: `hsl(var(--phase-${phase}))` }} />
                {checkedIn && <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-primary/60" />}
                <p className="font-mono text-[8px] text-muted-foreground mt-0.5">D{cycleDay}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Wins — single column on mobile */}
      <section>
        <p className="font-hand text-sm font-bold text-primary mb-3">quick actions</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-phase-follicular" />
              <span className="font-hand text-sm font-bold text-phase-follicular">hydration</span>
            </div>
            <div className="flex gap-1 mb-2">
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

          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-lavender-dust" />
              <span className="font-hand text-sm font-bold text-lavender-dust">wind-down</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">Evening breathwork at 8pm</p>
          </div>

          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-4 w-4 text-sage-mist" />
              <span className="font-hand text-sm font-bold text-sage-mist">seed cycling</span>
            </div>
            <p className="font-body text-xs text-foreground">{seedInfo.seeds}</p>
            <p className="font-mono text-[9px] text-muted-foreground mt-0.5">{seedInfo.phase} · D{info.cycleDay}</p>
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section>
        <p className="font-hand text-sm font-bold text-primary mb-3">today's focus</p>
        <div className="space-y-2">
          {[
            { icon: Salad, label: "nutrition", text: focus.nutrition },
            { icon: Dumbbell, label: "movement", text: focus.movement },
            { icon: Wind, label: "nervous system", text: focus.nervous },
            { icon: Moon, label: "cycle", text: focus.cycle },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              className="frequency-panel flex items-start gap-3 md:gap-4 p-4"
              style={{ "--panel-color": `hsl(var(--phase-${info.phase}))` } as React.CSSProperties}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <span className="font-hand text-sm font-bold" style={{ color: `hsl(var(--phase-${info.phase}))` }}>{item.label}</span>
                <p className="font-body text-sm text-foreground/80 mt-1 leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
