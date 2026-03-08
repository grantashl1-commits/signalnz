import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Brain, Droplets, Sprout, Clock } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, getCheckin, setCheckin, getCheckinStreak, getWaterCount, setWaterCount, getSeedCyclingDay, getPhaseFromDay, Phase } from "@/lib/cycle-utils";
import { TODAY_MEALS } from "@/data/meal-plans";
import { TODAY_WORKOUT, WORKOUTS } from "@/data/workouts";

const FEELINGS = ["Energised", "Good", "Moderate", "Low", "Depleted"];

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
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const handleCheckin = (feeling: string) => {
    setCheckin(feeling);
    setCheckinState(feeling);
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
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top greeting bar */}
      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <p className="text-sm uppercase tracking-widest opacity-70 mb-1">{greeting}</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
          Day {info.cycleDay} — {info.name.replace(" Phase", "").toUpperCase()} PHASE
        </h1>
        <div className="mt-3">
          <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
        </div>
      </div>

      {/* Today at a glance */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Today at a Glance</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { path: "/cycle", icon: Moon, title: "Cycle", desc: `Day ${info.cycleDay} of 28 — ${info.name.replace(" Phase", "")}. ${focus.cycle.split("—")[0]?.trim()}.` },
            { path: "/nutrition", icon: Salad, title: "Nutrition", desc: lunchMeal ? `Today: ${lunchMeal.name}. Click to see full day.` : "View today's meals." },
            { path: "/movement", icon: Dumbbell, title: "Movement", desc: todayWorkout ? `Today: ${todayWorkout.name} — ${todayWorkout.duration}. ${todayWorkout.equipment}.` : "View workouts." },
            { path: "/breathwork", icon: Brain, title: "Nervous System", desc: `Tonight: ${focus.nervous.split("—")[0]?.trim()}.` },
          ].map((tile, i) => (
            <motion.div
              key={tile.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={tile.path} className="card-warm-hover block p-4 md:p-5 h-full">
                <tile.icon className="h-5 w-5 text-accent mb-2" />
                <h3 className="font-display text-base font-semibold text-foreground leading-tight">{tile.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{tile.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Daily check-in */}
      <section className="card-warm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-lg text-foreground">How does your body feel today?</p>
          {streak > 0 && (
            <span className="text-xs text-accent font-medium">{streak}-day streak 🌿</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f}
              onClick={() => handleCheckin(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                checkin === f
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {checkin && (
          <p className="text-xs text-muted-foreground mt-3">Logged: {checkin} ✓</p>
        )}
      </section>

      {/* Week Snapshot */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-3">This Week</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((date, i) => {
            const dateStr = date.toISOString().split("T")[0];
            const isToday = dateStr === today.toISOString().split("T")[0];
            const lastPeriod = getLastPeriodStart();
            const cycleDay = lastPeriod ? (((Math.floor((date.getTime() - new Date(lastPeriod).getTime()) / (1000 * 60 * 60 * 24))) % 28) + 28) % 28 + 1 : info.cycleDay;
            const phase = getPhaseFromDay(cycleDay);
            const checkedIn = !!localStorage.getItem(`mindcast_checkin_${dateStr}`);

            const phaseColor = phase === "menstrual" ? "bg-burgundy" : phase === "follicular" ? "bg-accent" : phase === "ovulatory" ? "bg-gold" : "bg-plum";

            return (
              <div
                key={i}
                className={`flex-shrink-0 w-20 rounded-xl p-3 text-center ${
                  isToday ? "card-warm ring-2 ring-accent/40" : "bg-muted/50 rounded-xl"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{dayNames[i]}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{date.getDate()}</p>
                <div className={`mx-auto mt-1.5 h-2 w-2 rounded-full ${phaseColor}`} />
                {checkedIn && <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-accent/60" />}
                <p className="text-[9px] text-muted-foreground mt-1">Day {cycleDay}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Wins */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-3">Quick Wins</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {/* Water */}
          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-foreground uppercase tracking-wider">Water</span>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`h-5 w-5 rounded-full border transition-colors ${
                    i < water ? "bg-accent/80 border-accent" : "border-border"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{water}/8 glasses</span>
              <button
                onClick={addWater}
                disabled={water >= 8}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors disabled:opacity-40"
              >
                +1
              </button>
            </div>
          </div>

          {/* Evening reminder */}
          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-foreground uppercase tracking-wider">Wind-Down</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Evening routine at 8pm — breathwork before bed</p>
          </div>

          {/* Seed cycling */}
          <div className="card-warm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-foreground uppercase tracking-wider">Seed Cycling</span>
            </div>
            <p className="text-sm text-foreground font-medium">{seedInfo.seeds}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{seedInfo.phase} • Day {info.cycleDay}</p>
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Today's Focus</h2>
        <div className="space-y-3">
          {[
            { icon: Salad, label: "Nutrition", text: focus.nutrition },
            { icon: Dumbbell, label: "Movement", text: focus.movement },
            { icon: Brain, label: "Nervous System", text: focus.nervous },
            { icon: Moon, label: "Cycle", text: focus.cycle },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="card-warm flex items-start gap-4 p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <item.icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</span>
                <p className="text-sm text-foreground mt-0.5 leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
