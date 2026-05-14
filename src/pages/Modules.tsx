import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, BookOpen, ArrowRight } from "lucide-react";
import { CymatiSketch } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { haptic } from "@/hooks/use-mobile";

type Phase = "follicular" | "ovulatory" | "luteal" | "menstrual";

interface ModuleDef {
  key: string;
  title: string;
  sessions: number;
  desc: string;
  unlocked: boolean;
  phase: Phase;
  peek: string[]; // lesson titles you'd see inside
}

const MODULES: ModuleDef[] = [
  {
    key: "cycle-literacy",
    title: "Cycle Literacy",
    sessions: 4,
    desc: "Understand your hormonal blueprint",
    unlocked: true,
    phase: "follicular",
    peek: ["The four phases, simply", "What your hormones are doing", "Reading your own signals", "Charting without obsession"],
  },
  {
    key: "vegan-hormonal-nutrition",
    title: "Vegan Hormonal Nutrition",
    sessions: 4,
    desc: "Eat for your cycle, not against it",
    unlocked: false,
    phase: "ovulatory",
    peek: ["Plant proteins that hold you", "Iron without the slump", "Phase-by-phase plates", "When supplements help"],
  },
  {
    key: "strength-foundations",
    title: "Strength Foundations",
    sessions: 4,
    desc: "Build a body that supports your hormones",
    unlocked: false,
    phase: "follicular",
    peek: ["Why strength matters now", "Your first lifts", "Loading without burning out", "Tracking that feels kind"],
  },
  {
    key: "nervous-system-reset",
    title: "Nervous System Reset",
    sessions: 4,
    desc: "Regulate from the inside out",
    unlocked: false,
    phase: "luteal",
    peek: ["What dysregulation feels like", "The vagus nerve, gently explained", "Daily resets", "When to seek deeper support"],
  },
  {
    key: "seed-cycling",
    title: "Seed Cycling & Phytoestrogens",
    sessions: 3,
    desc: "Harness plant power for hormonal balance",
    unlocked: false,
    phase: "ovulatory",
    peek: ["The seed-cycling rhythm", "Phytoestrogens, demystified", "Building it into your week"],
  },
  {
    key: "sleep-cortisol",
    title: "Sleep & Cortisol",
    sessions: 3,
    desc: "The foundation everything else depends on",
    unlocked: false,
    phase: "menstrual",
    peek: ["Your cortisol curve", "Wind-down that actually works", "Reclaiming morning"],
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

const RESUME_KEY = "signal_modules_resume";
const PROGRESS_KEY = "signal_modules_progress"; // { [moduleKey]: numCompletedSessions }

export default function ModulesPage() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [activePeekKey, setActivePeekKey] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      setResumeKey(localStorage.getItem(RESUME_KEY));
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {/* noop */}
  }, []);

  const resumeModule = resumeKey ? MODULES.find(m => m.key === resumeKey && m.unlocked) : null;

  const openModule = (m: ModuleDef) => {
    haptic("medium");
    if (!m.unlocked) {
      setShowComingSoon(true);
      return;
    }
    try {
      localStorage.setItem(RESUME_KEY, m.key);
      const next = { ...progress, [m.key]: Math.min((progress[m.key] ?? 0) + 1, m.sessions) };
      setProgress(next);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      setResumeKey(m.key);
    } catch {/* noop */}
    // Real lesson player not yet built; surface coming-soon for now.
    setShowComingSoon(true);
  };

  return (
    <GatedPage requiredTier="thriving">
      <div className="relative">
        <AtmosphericHero size="sm">
          <SignalPulse />
          <div className="text-center relative z-10">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">learning</p>
            <h1 className="font-display text-[2.5rem] md:text-[3rem] font-extrabold text-primary-foreground leading-[1.02]">
              Modules
            </h1>
            <p className="font-body text-sm text-primary-foreground/50 mt-2">education rooted in your cycle</p>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4 max-w-3xl mx-auto space-y-5">
          {/* Resume card */}
          {resumeModule && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => openModule(resumeModule)}
              className="w-full card-warm p-4 flex items-center gap-3 text-left border border-primary/15"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[10px] uppercase tracking-widest text-primary/70">pick up where you left</p>
                <p className="font-display text-base italic text-foreground truncate">{resumeModule.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          )}

          <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
            {MODULES.map((m, i) => {
              const done = progress[m.key] ?? 0;
              const peekOpen = activePeekKey === m.key;
              return (
                <motion.div
                  key={m.title}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariant}
                  className="card-warm p-5 md:p-6 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 w-12 h-12 md:w-16 md:h-16 pointer-events-none">
                    <CymatiSketch phase={m.phase} size={48} opacity={0.06} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {!m.unlocked && (
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground/50">coming soon</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-base md:text-lg italic text-foreground">{m.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>

                    {/* Progress dots */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {Array.from({ length: m.sessions }).map((_, idx) => (
                        <span
                          key={idx}
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: idx < done ? 16 : 8,
                            backgroundColor: idx < done ? "hsl(var(--primary))" : "hsl(var(--border))",
                            opacity: m.unlocked ? 1 : 0.5,
                          }}
                        />
                      ))}
                      <span className="font-hand text-xs text-primary ml-1">
                        {m.unlocked && done > 0 ? `${done}/${m.sessions}` : `${m.sessions} sessions`}
                      </span>
                    </div>

                    {/* Peek toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); haptic("light"); setActivePeekKey(peekOpen ? null : m.key); }}
                      className="mt-3 font-body text-[11px] uppercase tracking-widest text-muted-foreground/70 hover:text-primary transition-colors"
                    >
                      {peekOpen ? "hide preview" : "peek inside"}
                    </button>
                    <AnimatePresence initial={false}>
                      {peekOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-2 space-y-1"
                        >
                          {m.peek.map((p, idx) => (
                            <li key={idx} className="font-body text-xs text-foreground/70 flex items-start gap-2">
                              <span className="font-hand text-primary/60 flex-shrink-0">{idx + 1}.</span>
                              <span className={!m.unlocked ? "blur-[1.5px] select-none" : ""}>{p}</span>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => openModule(m)}
                    className={`touch-btn mt-4 w-full rounded-xl px-4 py-3 min-h-[52px] font-body text-sm font-bold transition-opacity ${
                      m.unlocked ? "bg-primary text-primary-foreground active:opacity-90" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m.unlocked ? (done > 0 ? "Continue" : "Begin") : "Notify me"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </ContentSection>
      </div>

      {/* Coming Soon bottom sheet */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowComingSoon(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
              className="relative w-full max-w-sm bg-card rounded-t-3xl p-6 border-t border-border"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 h-1 rounded-full bg-muted mx-auto mb-5" />
              <p className="font-body text-[10px] tracking-widest uppercase text-primary mb-2">in the studio</p>
              <h3 className="font-display text-2xl italic text-foreground/90 mb-3">Being shaped</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                This module is still being written. We'll send a quiet nudge in-app the day it opens.
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-body text-xs tracking-wide"
              >
                got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GatedPage>
  );
}
