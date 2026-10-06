import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FadeUp, RevealLines, SignalRing } from "./primitives";

const MARQUEE = [
  "Bircher with poached pear", "28-min strength", "Coconut dhal", "One line tonight", "Pilates, 20 min",
  "Miso tofu & soba", "Walk & breathe", "Salmon, greens, potatoes", "Goals: 3 of 4", "Seed cycling",
];

const PRINCIPLES = [
  { k: "Under 10 seconds", v: "to know what to eat, how to move and what matters today." },
  { k: "One plan", v: "for meals, movement and reflection — not three apps arguing." },
  { k: "Built for women", v: "and the hormones, schedules and families that come with them." },
];

export function Marquee() {
  const row = [...MARQUEE, ...MARQUEE];
  return (
    <div className="relative overflow-hidden border-y border-border bg-background py-6" aria-hidden="true">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 motion-reduce:animate-none">
        {row.map((m, i) => (
          <span key={i} className="flex items-center gap-10 display-serif text-[2rem] md:text-[3rem] text-foreground/80 whitespace-nowrap">
            {m}
            <span className="h-2 w-2 rounded-full bg-primary/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Principles() {
  return (
    <section className="bg-background px-6 md:px-12 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <RevealLines
          className="display-serif max-w-4xl text-[2.75rem] md:text-[5rem] text-foreground"
          lines={["Designed for the woman", <>with <em className="text-primary">no spare time.</em></>]}
        />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px overflow-hidden rounded-[28px] border border-border bg-border">
          {PRINCIPLES.map((pr, i) => (
            <FadeUp key={pr.k} delay={i * 0.08} className="bg-card p-8 md:p-10">
              <p className="display-serif text-[2.25rem] md:text-[2.75rem] text-foreground">{pr.k}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{pr.v}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-60, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-aubergine text-background">
      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="grain" aria-hidden="true" />
      <motion.div style={{ scale, rotate }} className="pointer-events-none absolute left-1/2 top-[38%] w-[130vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2">
        <SignalRing className="w-full h-auto" color="hsl(36 33% 97% / 0.08)" />
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <RevealLines as="h2" className="display-serif text-[24vw] md:text-[14rem] leading-[0.82]" lines={["Tune in."]} />
        <FadeUp delay={0.2}>
          <p className="mx-auto mt-6 max-w-md text-[16px] md:text-[18px] text-background/70">
            Start free. Your first week of meals, movement and a page to reflect on — ready in two minutes.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full bg-background px-7 py-4 text-[15px] font-semibold text-foreground transition-transform hover:scale-[1.03]">
              Create my plan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/membership" className="inline-flex items-center rounded-full border border-background/25 px-7 py-4 text-[15px] font-medium text-background/90 hover:bg-background/10">
              See membership
            </Link>
          </div>
        </FadeUp>
      </div>

      <footer className="relative z-10 border-t border-background/10">
        <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-4 px-6 py-8 text-[12px] text-background/50">
          <p>© {new Date().getFullYear()} Signal. Made in Aotearoa New Zealand.</p>
          <nav className="flex flex-wrap justify-center gap-5">
            <Link to="/terms" className="hover:text-background">Terms</Link>
            <Link to="/privacy-policy" className="hover:text-background">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-background">Refunds</Link>
            <Link to="/contact" className="hover:text-background">Contact</Link>
          </nav>
        </div>
      </footer>
    </section>
  );
}
