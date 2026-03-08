import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Salad, Dumbbell, Brain } from "lucide-react";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, getCheckin, setCheckin, Phase } from "@/lib/cycle-utils";

const TILES = [
  { path: "/cycle", icon: Moon, title: "Cycle Tracker", desc: "Know your rhythm" },
  { path: "/nutrition", icon: Salad, title: "Nutrition", desc: "Eat for your phase" },
  { path: "/movement", icon: Dumbbell, title: "Movement", desc: "Train with your body" },
  { path: "/nervous-system", icon: Brain, title: "Regulate", desc: "Calm your system" },
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

const FEELINGS = ["Energised", "Good", "Moderate", "Low", "Depleted"];

export default function HomePage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [checkin, setCheckinState] = useState(getCheckin() || "");
  const focus = FOCUS[info.phase];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleCheckin = (feeling: string) => {
    setCheckin(feeling);
    setCheckinState(feeling);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
          {greeting}. You're on Day {info.cycleDay}.
        </h1>
        <div className="mt-3">
          <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} size="lg" />
        </div>
      </div>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-4">
        {TILES.map((tile, i) => (
          <motion.div
            key={tile.path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={tile.path} className="card-warm-hover block p-5 md:p-6">
              <tile.icon className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-display text-lg font-semibold text-foreground">{tile.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tile.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Today's Focus */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-5">Today's Focus</h2>
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
              transition={{ delay: 0.3 + i * 0.08 }}
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

      {/* Daily check-in */}
      <section className="card-warm p-5">
        <p className="font-display text-lg text-foreground mb-4">How does your body feel today?</p>
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
    </div>
  );
}
