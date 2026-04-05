import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";
import { CymatiSketch, SeedGeometry } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { haptic } from "@/hooks/use-mobile";

const MODULES = [
  { title: "Cycle Literacy", sessions: 4, desc: "Understand your hormonal blueprint", unlocked: true, phase: "follicular" as const },
  { title: "Vegan Hormonal Nutrition", sessions: 4, desc: "Eat for your cycle, not against it", unlocked: false, phase: "ovulatory" as const },
  { title: "Strength Foundations", sessions: 4, desc: "Build a body that supports your hormones", unlocked: false, phase: "follicular" as const },
  { title: "Nervous System Reset", sessions: 4, desc: "Regulate from the inside out", unlocked: false, phase: "luteal" as const },
  { title: "Seed Cycling & Phytoestrogens", sessions: 3, desc: "Harness plant power for hormonal balance", unlocked: false, phase: "ovulatory" as const },
  { title: "Sleep & Cortisol", sessions: 3, desc: "The foundation everything else depends on", unlocked: false, phase: "menstrual" as const },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function ModulesPage() {
  const [showComingSoon, setShowComingSoon] = useState(false);

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

        <ContentSection className="px-5 md:px-4 max-w-3xl mx-auto">
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariant}
                whileTap={m.unlocked ? { scale: 0.98 } : undefined}
                className="card-warm p-5 md:p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 w-12 h-12 md:w-16 md:h-16 pointer-events-none">
                  <CymatiSketch phase={m.phase} size={48} opacity={0.06} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <BookOpen className="h-5 w-5 text-phase-follicular" />
                    {!m.unlocked && (
                      <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">coming soon</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-base md:text-lg italic text-foreground">{m.title}</h3>
                  <p className="font-hand text-sm text-primary mt-1">{m.sessions} sessions</p>
                  <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
                </div>
                <button
                  onClick={() => {
                    haptic("medium");
                    if (m.unlocked) {
                      setShowComingSoon(true);
                    }
                  }}
                  disabled={!m.unlocked}
                  className={`touch-btn mt-4 w-full rounded-xl px-4 py-3 min-h-[52px] font-body text-sm font-bold transition-opacity ${
                    m.unlocked ? "bg-primary text-primary-foreground active:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {m.unlocked ? "Enter Module" : "Coming soon"}
                </button>
              </motion.div>
            ))}
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
              <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-2">coming soon</p>
              <h3 className="font-display text-2xl italic text-foreground/90 mb-3">Module in progress</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                This module is being built. You'll receive an in-app notification when it's ready.
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-mono text-xs tracking-wide"
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