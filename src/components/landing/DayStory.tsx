import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Check, Clock, Flame, ShoppingBasket } from "lucide-react";
import { EASE } from "./primitives";

/**
 * Pinned phone + captions: a single day with Signal, told in four beats.
 */

const STEPS = [
  {
    time: "6:58 am",
    title: "Breakfast is already decided.",
    body: "Your week of meals is planned around your phase, your goals and what's in the fridge. The shopping list wrote itself on Sunday.",
    accent: "var(--eat)",
  },
  {
    time: "12:30 pm",
    title: "A workout that fits the gap you have.",
    body: "Twenty-eight minutes, not ninety. Strength when your energy rises, mobility when it doesn't — the plan adapts.",
    accent: "var(--move)",
  },
  {
    time: "5:40 pm",
    title: "Dinner — and the kids' version.",
    body: "Every family dinner comes with a little-people swap, so you cook once and everyone eats.",
    accent: "var(--goals)",
  },
  {
    time: "9:15 pm",
    title: "One line. That's the whole journal.",
    body: "Reflect in a sentence, see your goals move, and let Signal notice the patterns you're too busy to.",
    accent: "var(--reflect)",
  },
];

function Screen({ step }: { step: number }) {
  const card = "rounded-2xl bg-white/90 p-3 shadow-[0_8px_24px_-12px_rgba(45,32,48,0.25)]";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="absolute inset-0 flex flex-col gap-2.5 px-3.5 pt-12 pb-4"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/45">{STEPS[step].time}</p>
        {step === 0 && (
          <>
            <p className="display-serif text-[26px] leading-none text-foreground">Good morning, Aroha.</p>
            <div className={`${card} flex items-center gap-3`}>
              <img src="/landing/meal-bircher.webp" alt="" className="h-16 w-16 object-contain" />
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-eat">Breakfast · 8 min</p>
                <p className="text-[12px] font-semibold leading-tight text-foreground">Bircher with poached pear & pistachio</p>
              </div>
            </div>
            <div className={card}>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-foreground"><ShoppingBasket className="h-3 w-3" /> This week's list</p>
              {["Rolled oats", "Pears ×4", "Greek yoghurt", "Pistachios"].map((it, i) => (
                <p key={it} className="flex items-center gap-2 py-0.5 text-[10px] text-foreground/70">
                  <span className={`flex h-3 w-3 items-center justify-center rounded-full ${i < 3 ? "bg-eat text-white" : "border border-foreground/20"}`}>
                    {i < 3 && <Check className="h-2 w-2" />}
                  </span>
                  <span className={i < 3 ? "line-through opacity-50" : ""}>{it}</span>
                </p>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="display-serif text-[26px] leading-none text-foreground">Today's session</p>
            <div className={`${card} relative overflow-hidden`}>
              <img src="/landing/move-strength.webp" alt="" className="mx-auto h-36 object-contain" />
              <p className="text-[8px] font-semibold uppercase tracking-wider text-move">Follicular · build</p>
              <p className="text-[13px] font-semibold text-foreground">Full-body strength</p>
              <div className="mt-1 flex gap-3 text-[9px] text-foreground/60">
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> 28 min</span>
                <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5" /> Go a little heavier</span>
              </div>
            </div>
            <div className="mt-auto rounded-full bg-foreground py-2.5 text-center text-[11px] font-semibold text-background">Start session</div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="display-serif text-[26px] leading-none text-foreground">Tonight</p>
            <div className={card}>
              <img src="/landing/meal-dhal.webp" alt="" className="mx-auto h-32 object-contain" />
              <p className="text-[8px] font-semibold uppercase tracking-wider text-goals">Dinner · 25 min</p>
              <p className="text-[13px] font-semibold text-foreground">Coconut dhal with spinach</p>
            </div>
            <div className={`${card} flex items-center gap-2`}>
              <span className="rounded-full bg-[hsl(var(--goals)/0.15)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-goals">Kids</span>
              <p className="text-[10px] text-foreground/75">Mild dhal "dippers" with naan soldiers</p>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <p className="display-serif text-[26px] leading-none text-foreground">One line for today</p>
            <div className={`${card} min-h-[80px]`}>
              <p className="display-serif text-[16px] italic leading-snug text-foreground/80">
                Felt strong at lunch. Said no to the extra meeting.<span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground" />
              </p>
            </div>
            <div className={card}>
              <p className="mb-2 text-[10px] font-semibold text-foreground">This week's goals</p>
              {[["Move 4×", 0.75, "var(--move)"], ["Cook at home 5×", 0.6, "var(--eat)"], ["Phone down by 10", 0.4, "var(--reflect)"]].map(([l, v, c]) => (
                <div key={l as string} className="mb-1.5">
                  <div className="mb-0.5 flex justify-between text-[9px] text-foreground/65"><span>{l as string}</span><span>{Math.round((v as number) * 100)}%</span></div>
                  <div className="h-1 rounded-full bg-foreground/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: `hsl(${c})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(v as number) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: EASE }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function DayStory() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)))));
  const phoneRotate = useTransform(p, [0, 1], [-4, 4]);
  const progress = useTransform(p, [0, 1], ["0%", "100%"]);

  return (
    <section id="story" ref={ref} className="relative bg-secondary" style={{ height: `${STEPS.length * 90 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-16 px-6 md:px-12">
          {/* Caption column */}
          <div className="order-2 md:order-1 relative min-h-[190px] md:min-h-[320px]">
            <p className="eyebrow mb-4 hidden md:block text-muted-foreground">A day with Signal</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="mb-3 font-mono text-[12px] tracking-wider" style={{ color: `hsl(${STEPS[step].accent})` }}>
                  {String(step + 1).padStart(2, "0")} — {STEPS[step].time}
                </p>
                <h3 className="display-serif text-[2.25rem] md:text-[4rem] text-foreground">{STEPS[step].title}</h3>
                <p className="mt-4 max-w-md text-[15px] md:text-[17px] leading-relaxed text-muted-foreground">{STEPS[step].body}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 hidden md:block h-px w-full max-w-md bg-foreground/10">
              <motion.div className="h-full bg-foreground" style={{ width: progress }} />
            </div>
          </div>

          {/* Phone */}
          <div className="order-1 md:order-2 flex justify-center">
            <motion.div
              style={{ rotate: phoneRotate }}
              className="relative h-[52svh] md:h-[74svh] max-h-[720px] min-h-[380px] aspect-[9/19] rounded-[44px] bg-foreground p-[7px] shadow-[0_40px_80px_-30px_rgba(31,20,33,0.55)]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-background">
                <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />
                <Screen step={step} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
