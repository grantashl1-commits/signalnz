import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { EASE } from "./primitives";
import { Ink, type InkName } from "@/components/ink/Ink";

const PHASES = [
  {
    key: "menstrual",
    name: "Menstrual",
    days: "Days 1–5",
    mood: "Release & reset",
    eat: "Iron-rich, warming bowls — dhal, broths, dark greens.",
    move: "Walks, mobility and restore. Rest is training too.",
    ink: "moon" as InkName,
  },
  {
    key: "follicular",
    name: "Follicular",
    days: "Days 6–13",
    mood: "Plan & begin",
    eat: "Fresh, light and protein-forward to fuel rising energy.",
    move: "Build — strength sessions and learning new skills.",
    ink: "seedling" as InkName,
  },
  {
    key: "ovulatory",
    name: "Ovulatory",
    days: "Days 14–16",
    mood: "Connect & speak up",
    eat: "Fibre and colour — cruciferous veg, berries, seeds.",
    move: "Peak — your strongest lifts and hardest intervals.",
    ink: "sun" as InkName,
  },
  {
    key: "luteal",
    name: "Luteal",
    days: "Days 17–28",
    mood: "Edit & complete",
    eat: "Complex carbs and magnesium for steadier moods.",
    move: "Steady — moderate strength, pilates, zone 2.",
    ink: "fallingLeaf" as InkName,
  },
];

const R = 44;
const C = 2 * Math.PI * R;

export default function CycleLens() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => setI(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const rotate = useTransform(p, [0, 1], [0, -270]);
  const sweep = useTransform(p, [0, 1], [C * 0.25, C]);
  const dash = useTransform(sweep, (s) => `${s} ${C}`);
  const ph = PHASES[i];

  return (
    <section ref={ref} className="relative h-[400vh] bg-aubergine text-background">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="aurora opacity-60" aria-hidden="true"><span /><span /><span /></div>
        <div className="grain" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid h-full max-w-6xl grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 md:px-12 pt-16 md:pt-0">
          <div>
            <p className="eyebrow text-background/55 mb-4">The quiet lens</p>
            <h2 className="display-serif text-[2.75rem] md:text-[4.5rem] leading-[0.95]">
              Your cycle, <em className="text-[hsl(var(--plum-glow))]">behind</em> every plan.
            </h2>
            <p className="mt-5 max-w-md text-[15px] md:text-[17px] text-background/65">
              No charts to study. Signal simply shifts your meals and training as your hormones do — so the plan always fits the week you're really having.
            </p>

            <AnimatePresence mode="wait">
              <motion.dl
                key={ph.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="mt-8 grid grid-cols-1 gap-4 max-w-md"
              >
                <div className="rounded-2xl border border-background/10 bg-background/[0.04] p-4 backdrop-blur-sm">
                  <dt className="eyebrow text-[10px] text-eat mb-1">Eat</dt>
                  <dd className="text-[14px] md:text-[15px] text-background/85">{ph.eat}</dd>
                </div>
                <div className="rounded-2xl border border-background/10 bg-background/[0.04] p-4 backdrop-blur-sm">
                  <dt className="eyebrow text-[10px] text-move mb-1">Move</dt>
                  <dd className="text-[14px] md:text-[15px] text-background/85">{ph.move}</dd>
                </div>
              </motion.dl>
            </AnimatePresence>
          </div>

          {/* Dial */}
          <div className="relative mx-auto aspect-square w-[78vw] max-w-[480px] md:w-full order-first md:order-last">
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ rotate }}>
              <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(36 33% 97% / 0.08)" strokeWidth="0.6" />
              {PHASES.map((q, qi) => (
                <circle
                  key={q.key}
                  cx="50" cy="50" r={R}
                  fill="none"
                  stroke={`hsl(var(--phase-${q.key}))`}
                  strokeWidth={qi === i ? 2.2 : 1}
                  strokeDasharray={`${C / 4 - 2} ${C}`}
                  strokeDashoffset={-qi * (C / 4)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-width .6s", opacity: qi === i ? 1 : 0.35 }}
                />
              ))}
            </motion.svg>
            <svg viewBox="0 0 100 100" className="absolute inset-[9%] h-[82%] w-[82%] -rotate-90">
              <motion.circle cx="50" cy="50" r={R} fill="none" stroke="hsl(36 33% 97% / 0.25)" strokeWidth="0.4" style={{ strokeDasharray: dash }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ph.key}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex flex-col items-center"
                >
                  <Ink name={ph.ink} draw weight={1.2} className="h-24 w-24 md:h-32 md:w-32 text-background/85" />
                  <p className="font-mono text-[11px] tracking-widest text-background/50 mt-2">{ph.days}</p>
                  <p className="display-serif text-[2.5rem] md:text-[3.5rem] leading-none" style={{ color: `hsl(var(--phase-${ph.key}))` }}>{ph.name}</p>
                  <p className="mt-1 text-[13px] italic text-background/60">{ph.mood}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
