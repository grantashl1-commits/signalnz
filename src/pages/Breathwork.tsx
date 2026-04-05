import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Clock } from "lucide-react";
import fasciaReleaseImg from "@/assets/somatic/morning-fascia-release.png";
import FasciaReleasePlayer from "@/components/practice/FasciaReleasePlayer";
import { BotanicalSprig } from "@/components/BotanicalElements";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useCycle } from "@/contexts/CycleContext";
import { haptic } from "@/hooks/use-mobile";
import {
  BREATHWORK_PRACTICES,
  SOMATIC_PRACTICES,
  formatDuration,
  type PracticeConfig,
} from "@/data/practices";
import BreathworkPlayer from "@/components/practice/BreathworkPlayer";
import SomaticPlayer from "@/components/practice/SomaticPlayer";

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ── Breathwork Cards (no evidence badge, with show more) ──
function BreathworkCards({
  onSelect,
}: {
  onSelect: (p: PracticeConfig) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? BREATHWORK_PRACTICES : BREATHWORK_PRACTICES.slice(0, 4);

  return (
    <div className="space-y-3">
      {visible.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className={`card-warm p-5 cursor-pointer touch-card ${
            expanded === p.id ? "ring-[1.5px] ring-primary" : ""
          }`}
          onClick={() => setExpanded(expanded === p.id ? null : p.id)}
        >
          <h3 className="font-display text-lg italic text-foreground mb-0.5">
            {p.title}
          </h3>
          <p className="font-mono text-[13px] text-muted-foreground mb-1">
            {p.phases?.map((ph) => ph.seconds).join("-")}
          </p>
          <p className="font-body text-[15px] text-foreground/70 mb-1">
            {p.subtitle}
          </p>

          <div className="flex items-center gap-2 mb-2">
            {p.audio.enabled ? (
              <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Volume2 className="h-3 w-3" /> guided audio
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" /> timer only
              </span>
            )}
          </div>

          {expanded === p.id && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-2.5"
            >
              {p.benefit}
            </motion.p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              haptic("medium");
              onSelect(p);
            }}
            className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97] mt-1"
          >
            begin this practice →
          </button>
        </motion.div>
      ))}
      {!showAll && BREATHWORK_PRACTICES.length > 4 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center font-mono text-xs text-primary py-2"
        >
          + show more
        </button>
      )}
    </div>
  );
}

// ── Somatic Cards (with show more) ──
function SomaticCards({
  onSelect,
  onFasciaRelease,
}: {
  onSelect: (p: PracticeConfig) => void;
  onFasciaRelease: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? SOMATIC_PRACTICES : SOMATIC_PRACTICES.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Morning Fascia Release — special card */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariant}
        className="card-warm p-5"
      >
        <div className="flex gap-3 items-start mb-3">
          <img
            src={fasciaReleaseImg}
            alt="Morning Fascia Release"
            className="w-[42px] h-[42px] object-contain flex-shrink-0 rounded-lg"
            loading="lazy"
            width={42}
            height={42}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg italic text-foreground mb-1">
              Morning Fascia Release
            </h3>
            <div className="flex gap-1.5 mb-1.5 flex-wrap">
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">
                full body
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                7 min
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                <Volume2 className="h-3 w-3" /> guided
              </span>
            </div>
            <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed">
              A 7-move morning sequence to wake up the fascia, move the lymph, and reset your nervous system.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            haptic("medium");
            onFasciaRelease();
          }}
          className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
        >
          begin this practice →
        </button>
      </motion.div>

      {visible.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i + 1}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className="card-warm p-5"
        >
          <div className="flex gap-3 items-start mb-3">
            {p.illustrationUrl ? (
              <img src={p.illustrationUrl} alt={p.title} className="w-[42px] h-[42px] object-contain flex-shrink-0 rounded-lg" />
            ) : (
              <div className="w-[42px] h-[42px] rounded-lg bg-secondary/60 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-sm italic text-muted-foreground">✦</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg italic text-foreground mb-1">
                {p.title}
              </h3>
              <div className="flex gap-1.5 mb-1.5 flex-wrap">
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">
                  {p.subtitle}
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {formatDuration(p.durationSec)}
                </span>
                {p.audio.enabled && (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    <Volume2 className="h-3 w-3" /> guided
                  </span>
                )}
              </div>
              <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed">
                {p.benefit}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptic("medium");
              onSelect(p);
            }}
            className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
          >
            begin this practice →
          </button>
        </motion.div>
      ))}
      {!showAll && SOMATIC_PRACTICES.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center font-mono text-xs text-primary py-2"
        >
          + show more
        </button>
      )}
    </div>
  );
}

// ── MAIN PAGE ──
export default function BreathworkPage() {
  const [section, setSection] = useState<"breathwork" | "somatic">("breathwork");
  const [activePractice, setActivePractice] = useState<PracticeConfig | null>(null);
  const [showFasciaRelease, setShowFasciaRelease] = useState(false);

  const sections = [
    { id: "breathwork" as const, label: "Breathwork" },
    { id: "somatic" as const, label: "Somatic" },
  ];

  const titles = {
    breathwork: "Breathwork & Regulation",
    somatic: "Somatic Practices",
  };

  return (
    <GatedPage requiredTier="nourished">
    <div className="relative">
      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Mindfulness</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">
            {titles[section]}
          </h1>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4">
      {/* Sub-nav pill */}
      <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
        <div className="flex bg-muted/60 rounded-2xl p-1 max-w-md mx-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                haptic("light");
                setSection(s.id);
              }}
              className={`touch-tab flex-1 py-2.5 rounded-xl font-display text-sm transition-all ${
                section === s.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground italic"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {section === "breathwork" && (
            <BreathworkCards onSelect={setActivePractice} />
          )}
          {section === "somatic" && (
            <SomaticCards onSelect={setActivePractice} onFasciaRelease={() => setShowFasciaRelease(true)} />
          )}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />

      {/* Players */}
      {activePractice?.mode === "timed-breath" && (
        <BreathworkPlayer
          practice={activePractice}
          onClose={() => setActivePractice(null)}
        />
      )}
      {activePractice?.mode === "narrated-sequence" && (
        <SomaticPlayer
          practice={activePractice}
          onClose={() => setActivePractice(null)}
        />
      )}
      {showFasciaRelease && (
        <FasciaReleasePlayer onClose={() => setShowFasciaRelease(false)} />
      )}
      </ContentSection>
    </div>
    </GatedPage>
  );
}
