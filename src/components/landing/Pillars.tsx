import { useRef } from "react";
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FadeUp } from "./primitives";
import { Ink, type InkName } from "@/components/ink/Ink";

type Art = { ink: InkName } | { src: string };

const PILLARS = [
  {
    n: "01",
    word: "Eat",
    line: "1,200+ recipes, tuned to your phase.",
    points: ["A week of meals in one tap", "A shopping list that writes itself", "Cook from what's in your fridge", "A kids' version of every dinner"],
    color: "var(--eat)",
    art: [{ src: "/landing/meal-salmon.webp" }, { src: "/landing/meal-miso.webp" }, { src: "/landing/meal-yoghurt.webp" }] as Art[],
  },
  {
    n: "02",
    word: "Move",
    line: "Training that knows your week.",
    points: ["Strength, pilates, running & restore", "Sessions sized to the time you have", "Intensity that follows your energy", "Live heart-rate when you want it"],
    color: "var(--move)",
    art: [{ src: "/landing/move-pilates.webp" }, { src: "/landing/move-run.webp" }, { src: "/landing/move-restore.webp" }] as Art[],
  },
  {
    n: "03",
    word: "Reflect",
    line: "A page that listens back.",
    points: ["One-line entries for busy days", "Mood & gratitude check-ins", "Gentle insights across your cycle", "A vault for what you want to keep"],
    color: "var(--reflect)",
    art: [{ ink: "sprig" }, { ink: "moon" }, { ink: "bird" }] as Art[],
  },
  {
    n: "04",
    word: "Goals",
    line: "Intentions you actually keep.",
    points: ["A vision board for the bigger picture", "Small habits that compound", "A weekly rhythm review", "Progress you can feel, not just see"],
    color: "var(--goals)",
    art: [{ ink: "seedling" }, { ink: "sun" }, { ink: "star" }] as Art[],
  },
];

type P = (typeof PILLARS)[number];

function Panel({ pillar, p, index, parallax = true }: { pillar: P; p: MotionValue<number>; index: number; parallax?: boolean }) {
  // Parallax per image, relative to the horizontal progress.
  const center = index / (PILLARS.length - 1);
  const y1 = useTransform(p, (v) => (center - v) * 230);
  const y2 = useTransform(p, (v) => (v - center) * 140);
  const y3 = useTransform(p, (v) => (center - v) * 340);
  const ys = [y1, y2, y3];

  return (
    <article className="relative flex h-full w-screen flex-none items-center px-6 md:px-16">
      <div
        className="absolute inset-3 md:inset-6 rounded-[32px] md:rounded-[44px]"
        style={{ background: `linear-gradient(150deg, hsl(${pillar.color} / 0.16), hsl(${pillar.color} / 0.05) 60%, transparent)` }}
      />
      <div className="relative z-10 grid w-full max-w-6xl mx-auto grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-6 md:gap-12">
        <div>
          <p className="font-mono text-[12px] tracking-widest" style={{ color: `hsl(${pillar.color})` }}>{pillar.n} / 04</p>
          <h3 className="display-serif mt-2 text-[28vw] md:text-[13rem] leading-[0.8] text-foreground">{pillar.word}</h3>
          <p className="mt-4 display-serif italic text-[1.75rem] md:text-[2.5rem] text-foreground/80">{pillar.line}</p>
          <ul className="mt-6 space-y-2.5">
            {pillar.points.map((pt) => (
              <li key={pt} className="flex items-center gap-3 text-[14px] md:text-[16px] text-muted-foreground">
                <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: `hsl(${pillar.color})` }} />
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative hidden md:block h-[520px]">
          {pillar.art.map((art, i) => {
            const pos = ["left-0 top-6 w-[58%]", "right-0 top-0 w-[40%]", "right-[10%] bottom-0 w-[44%]"][i];
            return "ink" in art ? (
              <motion.div key={art.ink + i} style={{ y: parallax ? ys[i] : 0 }} className={`absolute aspect-square text-foreground/75 ${pos}`}>
                <Ink name={art.ink} draw delay={i * 0.25} weight={i === 0 ? 0.9 : 1.1} className="h-full w-full" />
              </motion.div>
            ) : (
              <motion.img
                key={art.src}
                src={art.src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                style={{ y: parallax ? ys[i] : 0 }}
                className={`absolute object-contain drop-shadow-[0_30px_40px_rgba(31,20,33,0.12)] ${pos}`}
              />
            );
          })}
        </div>
        {"ink" in pillar.art[0] ? (
          <Ink name={pillar.art[0].ink} draw weight={1} className="md:hidden absolute right-[-4%] top-[-4%] w-[40vw] text-foreground/60" />
        ) : (
          <img src={pillar.art[0].src} alt="" aria-hidden="true" loading="lazy" className="md:hidden absolute right-[-8%] top-[-6%] w-[48vw] opacity-90" />
        )}
      </div>
    </article>
  );
}

export default function Pillars() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(p, [0.02, 0.98], ["0%", `-${((PILLARS.length - 1) / PILLARS.length) * 100}%`]);

  const intro = (
    <div className="px-6 md:px-16 pt-24 md:pt-32 pb-10 mx-auto max-w-6xl">
      <FadeUp>
        <p className="eyebrow text-muted-foreground mb-4">Four things, done beautifully</p>
        <h2 className="display-serif max-w-3xl text-[3rem] md:text-[5.5rem] text-foreground">
          We kept what busy women <em>actually</em> use.
        </h2>
      </FadeUp>
    </div>
  );

  if (reduced) {
    return (
      <section className="bg-background">
        {intro}
        {PILLARS.map((pl, i) => (
          <div key={pl.word} className="relative h-[90vh] overflow-hidden"><Panel pillar={pl} p={p} index={i} parallax={false} /></div>
        ))}
      </section>
    );
  }

  return (
    <section className="bg-background">
      {intro}
      <section ref={ref} className="relative" style={{ height: `${PILLARS.length * 100}vh` }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div style={{ x, width: `${PILLARS.length * 100}vw` }} className="flex h-full">
            {PILLARS.map((pl, i) => <Panel key={pl.word} pillar={pl} p={p} index={i} />)}
          </motion.div>
          {/* Progress pips */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {PILLARS.map((pl, i) => <Pip key={pl.word} p={p} i={i} color={pl.color} />)}
          </div>
        </div>
      </section>
    </section>
  );
}

function Pip({ p, i, color }: { p: MotionValue<number>; i: number; color: string }) {
  const c = i / (PILLARS.length - 1);
  const near = useTransform(p, (v) => Math.max(0, 1 - Math.abs(v - c) / 0.2));
  const w = useTransform(near, (n) => 8 + n * 24);
  const o = useTransform(near, (n) => 0.3 + n * 0.7);
  return <motion.span style={{ width: w, opacity: o, backgroundColor: `hsl(${color})` }} className="h-2 rounded-full" />;
}
