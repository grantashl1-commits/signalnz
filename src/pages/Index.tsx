import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Wind, Droplets, Sprout, Clock } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import CymaticPattern from "@/components/CymaticPatterns";
import NetworkBackground from "@/components/NetworkBackground";
import { getCycleInfo, getLastPeriodStart, getCheckin, setCheckin, getCheckinStreak, getWaterCount, setWaterCount, getSeedCyclingDay, getPhaseFromDay, Phase } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { TODAY_WORKOUT, WORKOUTS } from "@/data/workouts";

const FREQUENCY_STATES = [
  { label: "Radiant", phase: "ovulatory" as Phase, desc: "Peak signal" },
  { label: "Clear", phase: "follicular" as Phase, desc: "Rising signal" },
  { label: "Steady", phase: "follicular" as Phase, desc: "Stable signal" },
  { label: "Muted", phase: "luteal" as Phase, desc: "Low signal" },
  { label: "Static", phase: "menstrual" as Phase, desc: "Rest signal" },
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

const PHASE_METAPHOR: Record<Phase, string> = {
  menstrual: "the signal goes quiet. integration.",
  follicular: "the signal is rising. new transmission.",
  ovulatory: "peak signal. broadcasting clearly.",
  luteal: "complex harmonics. descending wave.",
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
    setCheckin(state);
    setCheckinState(state);
  };

  const addWater = () => {
    const next = Math.min(water + 1, 8);
    setWaterState(next);
    setWaterCount(next);
  };

  // Week snapshot
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-10 relative">
      {/* Network background */}
      <div className="fixed inset-0 -z-10">
        <NetworkBackground opacity={0.25} />
      </div>

      {/* Greeting */}
      <div className="pt-4">
        <p className="ui-label mb-3">signal received,</p>
        <h1 className="font-display text-5xl md:text-6xl font-light italic text-foreground leading-none animate-text-glow">
          {greeting}.
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <span className="font-mono text-sm text-cyan">
            day {info.cycleDay} of 28 · {PHASE_METAPHOR[info.phase]}
          </span>
        </div>

        {/* Thread line */}
        <svg className="w-full h-4 mt-4 thread-glow" viewBox="0 0 600 16">
          <path d="M 0 8 Q 100 4 200 8 T 400 8 T 600 8" fill="none" stroke="hsl(160, 100%, 75%)" strokeWidth="0.5" opacity="0.4" />
          <circle cx="150" cy="7" r="2" fill="hsl(160, 100%, 75%)" opacity="0.6" />
          <circle cx="350" cy="9" r="2" fill="hsl(160, 100%, 75%)" opacity="0.6" />
          <circle cx="500" cy="8" r="1.5" fill="hsl(160, 100%, 75%)" opacity="0.4" />
        </svg>
      </div>

      {/* Frequency Panels — 2x2 */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          {[
            { path: "/cycle", label: "CYCLE SIGNAL", icon: Moon, title: `Day ${info.cycleDay} — ${info.name.replace(" Phase", "")}`, desc: focus.cycle },
            { path: "/nutrition", label: "NUTRITION FEED", icon: Salad, title: lunchMeal?.name || "Today's meals", desc: focus.nutrition },
            { path: "/movement", label: "MOVEMENT DATA", icon: Dumbbell, title: todayWorkout?.name || "Today's workout", desc: `${todayWorkout?.duration || ""} · ${todayWorkout?.equipment || ""}` },
            { path: "/breathwork", label: "NERVOUS SYSTEM", icon: Wind, title: "Coherent Breathing", desc: focus.nervous },
          ].map((tile, i) => (
            <motion.div
              key={tile.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Link to={tile.path} className="frequency-panel block p-4 md:p-5 h-full group relative overflow-hidden" style={{ "--panel-color": `hsl(var(--phase-${info.phase}))` } as React.CSSProperties}>
                <div className="absolute top-0 right-0 w-24 h-24 -translate-y-4 translate-x-4 opacity-[0.06]">
                  <CymaticPattern phase={info.phase} size={96} opacity={1} />
                </div>
                <p className="ui-label mb-2">{tile.label}</p>
                <h3 className="font-display text-base md:text-lg italic text-foreground leading-tight">{tile.title}</h3>
                <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{tile.desc}</p>
                <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-network/40 animate-node-pulse" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Frequency Check-in */}
      <section className="card-deep p-6">
        <p className="font-display text-xl italic text-foreground mb-5">what frequency are you transmitting today?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {FREQUENCY_STATES.map((state) => {
            const selected = checkin === state.label;
            return (
              <button
                key={state.label}
                onClick={() => handleCheckin(state.label)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 w-16 transition-all ${
                  selected
                    ? "ring-2 ring-cyan scale-110 bg-secondary"
                    : "bg-secondary/50 hover:bg-secondary/80"
                }`}
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden">
                  <CymaticPattern phase={state.phase} size={48} opacity={selected ? 0.8 : 0.3} />
                </div>
                <span className="font-body text-[9px] font-bold uppercase tracking-widest text-foreground">{state.label}</span>
              </button>
            );
          })}
        </div>
        {checkin && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="font-mono text-xs text-cyan">logged: {checkin.toLowerCase()}</span>
            {streak > 1 && <span className="font-mono text-[10px] text-muted-foreground">{streak}-day streak</span>}
          </div>
        )}
      </section>

      {/* Week Snapshot */}
      <section>
        <p className="ui-label mb-3">this week</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
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
                className={`flex-shrink-0 w-16 rounded-lg p-2.5 text-center transition-all ${
                  isToday ? "bg-secondary ring-1 ring-cyan/30" : "bg-secondary/30"
                }`}
              >
                <p className="font-body text-[9px] uppercase tracking-widest text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </p>
                <p className="font-mono text-sm text-foreground mt-0.5">{date.getDate()}</p>
                <div className={`mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-phase-${phase}`} />
                {checkedIn && <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-cyan/60" />}
                <p className="font-mono text-[8px] text-muted-foreground mt-0.5">D{cycleDay}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Wins */}
      <section>
        <p className="ui-label mb-3">quick signals</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card-deep p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-cyan" />
              <span className="ui-label">hydration</span>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`h-4 w-4 rounded-full border transition-all ${i < water ? "bg-cyan/60 border-cyan/80" : "border-border"}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">{water}/8</span>
              <button onClick={addWater} disabled={water >= 8} className="rounded-full bg-cyan/10 px-3 py-1 font-mono text-[10px] text-cyan hover:bg-cyan/20 transition-colors disabled:opacity-30">
                +1
              </button>
            </div>
          </div>

          <div className="card-deep p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-cyan" />
              <span className="ui-label">wind-down</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">Evening breathwork at 8pm</p>
          </div>

          <div className="card-deep p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-4 w-4 text-cyan" />
              <span className="ui-label">seed cycling</span>
            </div>
            <p className="font-body text-xs text-foreground">{seedInfo.seeds}</p>
            <p className="font-mono text-[9px] text-muted-foreground mt-0.5">{seedInfo.phase} · D{info.cycleDay}</p>
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section>
        <p className="ui-label mb-3">today's frequency</p>
        <div className="space-y-2">
          {[
            { icon: Salad, label: "NUTRITION", text: focus.nutrition },
            { icon: Dumbbell, label: "MOVEMENT", text: focus.movement },
            { icon: Wind, label: "NERVOUS SYSTEM", text: focus.nervous },
            { icon: Moon, label: "CYCLE", text: focus.cycle },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="frequency-panel flex items-start gap-4 p-4"
              style={{ "--panel-color": `hsl(var(--phase-${info.phase}))` } as React.CSSProperties}
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan/5">
                <item.icon className="h-4 w-4 text-cyan/70" />
              </div>
              <div>
                <span className="ui-label">{item.label}</span>
                <p className="font-body text-sm text-foreground/80 mt-1 leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
