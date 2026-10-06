import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, SignalRing, useRamp } from "./primitives";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ringScale = useRamp(scrollYProgress, [0, 1], [1, 2.6]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const ringOpacity = useRamp(scrollYProgress, [0, 0.9], [0.9, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const titleOpacity = useRamp(scrollYProgress, [0, 0.7], [1, 0]);
  const bouquetY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  const word = (w: string, i: number, italic = false) => (
    <span key={w} className="block overflow-hidden pb-[0.06em] pr-[0.2em]">
      <motion.span
        className={`block ${italic ? "italic text-[hsl(var(--plum-glow))]" : ""}`}
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.3, delay: 0.35 + i * 0.08, ease: EASE }}
      >
        {w}
      </motion.span>
    </span>
  );

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-aubergine text-background">
      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>

      {/* Scroll-scrubbed Signal ring */}
      <motion.div
        style={{ scale: ringScale, rotate: ringRotate, opacity: ringOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] max-w-[1100px] md:w-[80vw]"
      >
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: EASE }}>
          <SignalRing className="w-full h-auto sketch-rotate" color="hsl(36 33% 97% / 0.10)" />
        </motion.div>
      </motion.div>

      <motion.img
        src="/landing/bouquet.webp"
        alt=""
        aria-hidden="true"
        style={{ y: bouquetY }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ duration: 1.8, delay: 0.2, ease: EASE }}
        className="pointer-events-none absolute right-[-12%] bottom-[-6%] w-[70vw] max-w-[560px] md:right-[4%] md:bottom-[2%] md:w-[34vw] mix-blend-luminosity opacity-90"
      />

      <div className="grain" aria-hidden="true" />

      <motion.div style={{ y: titleY, opacity: titleOpacity }} className="relative z-10 flex h-full flex-col justify-end md:justify-center px-6 md:px-12 pb-28 md:pb-0 max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="eyebrow text-background/60 mb-6"
        >
          Food · Movement · Reflection — tuned to your cycle
        </motion.p>
        <h1 className="display-serif text-[19vw] md:text-[10.5vw] lg:text-[9.5rem] leading-[0.86]">
          <span className="flex flex-wrap">{["Less", "noise."].map((w, i) => word(w, i))}</span>
          <span className="flex flex-wrap">{word("More", 2)}{word("signal.", 3, true)}</span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: EASE }}
          className="mt-8 max-w-md text-[16px] md:text-[18px] leading-relaxed text-background/70"
        >
          Everything a busy woman needs to eat well, move well and think clearly — planned around your actual week, in one calm place.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.05, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-[14px] font-semibold text-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#story"
            className="inline-flex items-center gap-2 rounded-full border border-background/25 px-6 py-3.5 text-[14px] font-medium text-background/90 backdrop-blur-sm transition-colors hover:bg-background/10"
          >
            See a day with Signal
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-background/50">
        <span className="eyebrow text-[10px]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-background/20">
          <motion.span
            className="absolute left-0 top-0 h-1/2 w-full bg-background"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
