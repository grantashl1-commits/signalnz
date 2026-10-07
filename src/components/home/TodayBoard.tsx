import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, ShoppingBasket, PenLine, Target, Utensils, Dumbbell, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT, type Phase } from "@/lib/cycle-utils";
import { getTodayMeals } from "@/lib/today-meals";
import { getSelectedPath, getNextSession, type NextSessionInfo } from "@/lib/training-path-utils";
import { useHabitList } from "@/hooks/useHabitList";
import { useHabitCompletions } from "@/hooks/useHabitCompletions";
import RecipeImage from "@/components/nutrition/RecipeImage";

/**
 * Today — the ten-second answer to "what am I eating, how am I moving,
 * and what's one thing to note?" Every tile is one tap into its pillar.
 */

const PHASE_LINE: Record<Phase, string> = {
  menstrual: "Rest counts as progress today. Warm food, gentle movement.",
  follicular: "Energy is returning — a good day to build something.",
  ovulatory: "You're at your strongest. Say yes to the hard session.",
  luteal: "Turning inward. Steady meals, steady training, softer edges.",
};

const PROMPTS = [
  "What would make today feel like enough?",
  "One thing your body told you today.",
  "What are you quietly proud of?",
  "What can you let go of tonight?",
  "Where did you feel most like yourself?",
  "What do you need more of this week?",
  "Who made today lighter?",
];

const ease = [0.22, 1, 0.36, 1] as const;

function Tile({
  to, accent, icon: Icon, eyebrow, children, className = "", delay = 0,
}: {
  to: string; accent: string; icon: typeof Utensils; eyebrow: string; children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      <Link
        to={to}
        className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-border/70 bg-card p-5 shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:shadow-medium active:scale-[0.99]"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `hsl(${accent} / 0.14)`, color: `hsl(${accent})` }}>
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="eyebrow text-[10px] text-muted-foreground">{eyebrow}</span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        {children}
      </Link>
    </motion.div>
  );
}

export default function TodayBoard({ greeting, firstName }: { greeting: string; firstName: string | null }) {
  const { currentPhase, currentCycleDay } = useCycle();
  const { meals } = useMemo(() => getTodayMeals(currentCycleDay), [currentCycleDay]);

  const [session, setSession] = useState<NextSessionInfo | null>(null);
  useEffect(() => {
    const refresh = () => {
      const path = getSelectedPath();
      setSession(path ? getNextSession(path) : null);
    };
    refresh();
    window.addEventListener("signal:training-path-changed", refresh);
    return () => window.removeEventListener("signal:training-path-changed", refresh);
  }, []);

  const { habits } = useHabitList();
  const { completedIds } = useHabitCompletions();
  const habitsDone = habits.filter((h) => completedIds.has(h.id)).length;

  const now = new Date();
  const prompt = PROMPTS[now.getDay() % PROMPTS.length];
  const phaseColor = `hsl(var(--phase-${currentPhase}))`;
  const progress = session ? Math.round((session.completedCount / Math.max(1, session.totalSessions)) * 100) : 0;

  return (
    <section className="mx-auto max-w-5xl px-5 md:px-8 pt-6 md:pt-10">
      {/* Greeting */}
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="mb-6 md:mb-10">
        <p className="eyebrow text-muted-foreground">{format(now, "EEEE d MMMM")}</p>
        <h1 className="display-serif mt-2 text-[3rem] md:text-[5.5rem] text-foreground">
          {greeting}{firstName ? <>, <em className="text-primary">{firstName}</em></> : null}.
        </h1>
        <Link to="/cycle" className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: phaseColor }} />
          <span><span className="text-foreground font-medium">{PHASE_SHORT[currentPhase]}, day {currentCycleDay}.</span> {PHASE_LINE[currentPhase]}</span>
        </Link>
      </motion.header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Eat — the hero tile */}
        <Tile to="/nutrition" accent="var(--eat)" icon={Utensils} eyebrow="Eat today" className="col-span-2 md:row-span-2" delay={0.05}>
          <div className="flex flex-1 flex-col gap-2">
            {meals.map((m, i) => (
              <div key={m.slot} className={`flex items-center gap-3 ${i > 0 ? "border-t border-border/60 pt-2" : ""}`}>
                <div className="h-14 w-14 md:h-16 md:w-16 flex-none overflow-hidden rounded-2xl bg-secondary">
                  <RecipeImage variant="thumb" recipeName={m.name} recipeId={m.recipe?.id} recipeImage={m.recipe?.image} className="!h-full !w-full !bg-transparent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-eat">{m.label}</p>
                  <p className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground">{m.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
            <ShoppingBasket className="h-3.5 w-3.5" /> Shopping list & swaps inside
          </div>
        </Tile>

        {/* Move */}
        <Tile to={session ? "/movement" : "/movement?tab=training"} accent="var(--move)" icon={Dumbbell} eyebrow="Move" className="col-span-2" delay={0.1}>
          {session ? (
            <>
              <p className="display-serif text-[1.75rem] leading-tight text-foreground">{session.session.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                {session.session.durationMin ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.session.durationMin} min</span> : null}
                <span>{session.path.name} · week {session.week}</span>
              </div>
              <div className="mt-auto pt-4">
                <div className="h-1 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-move transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{session.completedCount} of {session.totalSessions} sessions</p>
              </div>
            </>
          ) : (
            <>
              <p className="display-serif text-[1.75rem] leading-tight text-foreground">Choose a training path</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Strength, pilates, running or restore — sized to the time you have.</p>
            </>
          )}
        </Tile>

        {/* Reflect */}
        <Tile to="/journal" accent="var(--reflect)" icon={BookOpen} eyebrow="Reflect" delay={0.15}>
          <p className="display-serif italic text-[1.25rem] leading-snug text-foreground">"{prompt}"</p>
          <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary">
            <PenLine className="h-3.5 w-3.5" /> Write one line
          </span>
        </Tile>

        {/* Goals */}
        <Tile to="/my-practice" accent="var(--goals)" icon={Target} eyebrow="Goals" delay={0.2}>
          {habits.length > 0 ? (
            <>
              <p className="display-serif text-[2.5rem] leading-none text-foreground">
                {habitsDone}<span className="text-muted-foreground/60">/{habits.length}</span>
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">habits done today</p>
            </>
          ) : (
            <>
              <p className="display-serif text-[1.25rem] leading-snug text-foreground">Set one small habit</p>
              <p className="mt-1 text-[12px] text-muted-foreground">and a vision for the bigger picture.</p>
            </>
          )}
        </Tile>
      </div>
    </section>
  );
}
