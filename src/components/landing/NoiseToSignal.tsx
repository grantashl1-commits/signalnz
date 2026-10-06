import { useRef } from "react";
import { motion, type MotionValue, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { SignalRing, useRamp } from "./primitives";

/**
 * Scrollytelling beat: the scattered noise of wellness advice collapses,
 * as you scroll, into a single point — the Signal.
 */

// [text, x(vw), y(vh), rotate, scale]
const FRAGMENTS: [string, number, number, number, number][] = [
  ["10 superfoods you need now", -34, -30, -6, 1.1],
  ["Fasted cardio?", 30, -34, 4, 1],
  ["Cortisol belly", -38, 6, 3, 0.95],
  ["75 Hard", 36, 2, -5, 1.2],
  ["Seed cycling", -18, 34, -3, 0.9],
  ["Zone 2, every day", 22, 32, 6, 1],
  ["Track every macro", -6, -40, 2, 0.95],
  ["Cold plunge at 5am", 8, 40, -2, 1.05],
  ["Gut reset in 3 days", -44, -14, 5, 0.9],
  ["Protein. More protein.", 42, -16, -4, 0.95],
  ["Hormone-balancing tea", -26, 20, 7, 0.85],
  ["Journal 3 pages, longhand", 28, 18, -6, 0.9],
  ["No carbs after 6", -12, -22, -7, 0.85],
  ["Pilates or weights?", 14, -24, 5, 0.9],
  ["Meal prep Sundays", -36, 40, 2, 0.8],
  ["Morning routine of a CEO", 38, 40, -3, 0.8],
  ["Adrenal fatigue", -4, 22, 4, 0.8],
  ["What I eat in a day", 4, -12, -2, 0.85],
];

function Fragment({ p, f, i }: { p: MotionValue<number>; f: (typeof FRAGMENTS)[number]; i: number }) {
  const [text, x, y, r, s] = f;
  const end = 0.42 + (i % 6) * 0.025;
  const tx = useTransform(p, [0.05, end], [`${x}vw`, "0vw"]);
  const ty = useTransform(p, [0.05, end], [`${y}vh`, "0vh"]);
  const rot = useTransform(p, [0.05, end], [r, 0]);
  const sc = useTransform(p, [0.05, end], [s, 0.2]);
  const op = useRamp(p, [0, 0.04, end - 0.06, end], [0, 1, 0.9, 0]);
  const blur = useTransform(p, [0.05, end], [0, 6], { clamp: true });
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span
      style={{ x: tx, y: ty, rotate: rot, scale: sc, opacity: op, filter }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-foreground/10 bg-card/90 px-4 py-2 text-[13px] md:text-[15px] font-medium text-foreground/70 shadow-soft"
    >
      {text}
    </motion.span>
  );
}

export default function NoiseToSignal() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const introOpacity = useRamp(p, [0, 0.18, 0.3], [1, 1, 0]);
  const dotScale = useRamp(p, [0.4, 0.55, 0.7], [0, 1, 1]);
  const ringScale = useRamp(p, [0.5, 0.75], [0.2, 1]);
  const ringOpacity = useRamp(p, [0.5, 0.62], [0, 1]);
  const outroOpacity = useRamp(p, [0.62, 0.74], [0, 1]);
  const outroY = useRamp(p, [0.62, 0.78], [40, 0]);

  if (reduced) {
    return (
      <section className="bg-background px-6 py-32 text-center">
        <SignalRing className="mx-auto mb-10 h-40 w-40 text-primary" />
        <h2 className="display-serif text-[3rem] md:text-[5rem] text-foreground">One calm signal.</h2>
        <p className="mx-auto mt-6 max-w-md text-[16px] text-muted-foreground">
          Signal filters the noise into what actually matters for you, this week.
        </p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh] bg-background">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ opacity: introOpacity }} className="absolute inset-x-0 top-[12vh] z-20 px-6 text-center">
          <p className="eyebrow text-muted-foreground mb-4">The problem</p>
          <h2 className="display-serif mx-auto max-w-3xl text-[2.75rem] md:text-[5rem] text-foreground">
            A hundred tabs open about your health.
          </h2>
        </motion.div>

        {FRAGMENTS.map((f, i) => <Fragment key={f[0]} p={p} f={f} i={i} />)}

        <motion.span
          style={{ scale: dotScale }}
          className="absolute left-1/2 top-1/2 -ml-3 -mt-3 h-6 w-6 rounded-full bg-primary shadow-[0_0_60px_hsl(var(--primary)/0.6)]"
        />
        <motion.div
          style={{ scale: ringScale, opacity: ringOpacity }}
          className="absolute left-1/2 top-1/2 -ml-[min(40vw,220px)] -mt-[min(40vw,220px)] h-[min(80vw,440px)] w-[min(80vw,440px)]"
        >
          <SignalRing className="h-full w-full text-primary sketch-rotate-fast" />
        </motion.div>

        <motion.div style={{ opacity: outroOpacity, y: outroY }} className="absolute inset-x-0 bottom-[10vh] z-20 px-6 text-center">
          <h2 className="display-serif text-[3rem] md:text-[5.5rem] text-foreground">
            One calm <em className="text-primary">signal.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] md:text-[17px] text-muted-foreground">
            We filter the noise into what matters for you — this week, this phase, this kitchen.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
