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

// ── Breathwork icon SVGs by practice ID ──
const BreathworkIcon = ({ id }: { id: string }) => {
  const cls = "text-primary/30";
  const size = 36;
  
  if (id === "box-breathing") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <rect x="6" y="6" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="12" y="12" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
  
  if (id === "physiological-sigh") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M4 22c4-8 8 4 12-4s4 2 8-6 4 8 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 26c4-4 8 2 12-2s4 1 8-3 4 4 8 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
  
  if (id === "four-seven-eight") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M26 14a10 10 0 1 0-3.5 7.6A7 7 0 0 1 26 14Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="16" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  );
  
  if (id === "coherent-breathing") return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <path d="M3 20 l4-6 3 4 3-10 3 12 3-8 3 6 3-4 4 6 3-2 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
  
  // Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={cls}>
      <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
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
          className={`card-warm p-5 cursor-pointer touch-card relative ${
            expanded === p.id ? "ring-[1.5px] ring-primary" : ""
          }`}
          onClick={() => setExpanded(expanded === p.id ? null : p.id)}
        >
          {/* Practice type icon */}
          <div className="absolute top-4 left-4">
            <BreathworkIcon id={p.id} />
          </div>

          <div className="pl-11">
          <h3 className="font-display text-lg italic text-foreground mb-1">
            {p.title}
          </h3>
          {p.phases && p.phases.length > 0 && (
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-body text-[28px] font-bold text-primary leading-none">
                {p.phases.map((ph) => ph.seconds).join("-")}
              </span>
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-primary/50"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
              />
            </div>
          )}
          <p className="font-body text-[14px] text-foreground/70 mb-1">
            {p.subtitle}
          </p>

          <div className="flex items-center gap-2 mb-2">
            {p.audio.enabled ? (
              <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
                <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided audio
              </span>
            ) : (
              <span className="flex items-center gap-1 font-body text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" /> timer only
              </span>
            )}
          </div>

          {/* Compact: one-line benefit preview + ghost pill */}
          {expanded !== p.id && (
            <div className="flex items-end justify-between gap-3 mt-1">
              <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">
                {p.benefit}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
              >
                Begin →
              </button>
            </div>
          )}

          {/* Expanded: full description + prominent CTA */}
          {expanded === p.id && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">
                  {p.benefit}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                  className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
                >
                  begin this practice →
                </button>
              </motion.div>
            </AnimatePresence>
          )}
          </div>
        </motion.div>
      ))}
      {!showAll && BREATHWORK_PRACTICES.length > 4 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center font-body text-xs text-primary py-2"
        >
          + show more
        </button>
      )}
    </div>
  );
}

// ── Somatic fallback icons ──
const SomaticFallbackIcon = ({ id }: { id: string }) => {
  const cls = "text-primary/30";
  const s = 44;
  const icons: Record<string, JSX.Element> = {
    "butterfly-hug": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M22 14c-6-8-16-2-12 8 2 5 8 8 12 10 4-2 10-5 12-10 4-10-6-16-12-8Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    "grounding-54321": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" />
        {[0,1,2,3,4].map(i => <circle key={i} cx={22 + 10*Math.cos((i*72-90)*Math.PI/180)} cy={22 + 10*Math.sin((i*72-90)*Math.PI/180)} r="2" fill="currentColor" opacity="0.4" />)}
      </svg>
    ),
    "somatic-orienting": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <circle cx="22" cy="22" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="22" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M22 6v4M22 34v4M6 22h4M34 22h4" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    "havening-touch": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M16 30c-2-4 0-8 4-10s8-1 10 3 0 8-4 10-8 1-10-3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 20c1-3 3-5 6-4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M18 24c-1-3 0-6 3-7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    "neurogenic-tremoring": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <path d="M8 22c2-4 4 4 6-4s4 4 6-4 4 4 6-4 4 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 28c2-3 4 3 6-3s4 3 6-3 4 3 6-3 4 3 6-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
    "body-scan": (
      <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
        <ellipse cx="22" cy="14" rx="5" ry="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 20v14M27 20v14M14 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[id] || (
    <svg width={s} height={s} viewBox="0 0 44 44" fill="none" className={cls}>
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M22 14v16M14 22h16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
};

// ── Somatic Cards (with show more) ──
function SomaticCards({
  onSelect,
  onFasciaRelease,
}: {
  onSelect: (p: PracticeConfig) => void;
  onFasciaRelease: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedSomatic, setExpandedSomatic] = useState<string | null>(null);
  const visible = showAll ? SOMATIC_PRACTICES : SOMATIC_PRACTICES.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Morning Fascia Release — special card */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariant}
        className="card-warm p-5 cursor-pointer touch-card"
        onClick={() => setExpandedSomatic(expandedSomatic === "fascia" ? null : "fascia")}
      >
        <div className="flex gap-3 items-start mb-3">
          <img
            src={fasciaReleaseImg}
            alt="Morning Fascia Release"
            className="w-[44px] h-[44px] object-contain flex-shrink-0 rounded-lg"
            loading="lazy"
            width={44}
            height={44}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg italic text-foreground mb-1">
              Morning Fascia Release
            </h3>
            <div className="flex gap-1.5 mb-1.5 flex-wrap">
              <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                full body
              </span>
              <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <Clock className="h-3 w-3" /> 7 min
              </span>
              <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
                <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided
              </span>
            </div>

            {expandedSomatic !== "fascia" && (
              <div className="flex items-end justify-between gap-3 mt-1">
                <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">
                  A 7-move morning sequence to wake up the fascia, move the lymph, and reset your nervous system.
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); haptic("medium"); onFasciaRelease(); }}
                  className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
                >
                  Begin →
                </button>
              </div>
            )}

            {expandedSomatic === "fascia" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">
                  A 7-move morning sequence to wake up the fascia, move the lymph, and reset your nervous system.
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); haptic("medium"); onFasciaRelease(); }}
                  className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
                >
                  begin this practice →
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {visible.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i + 1}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className="card-warm p-5 cursor-pointer touch-card"
          onClick={() => setExpandedSomatic(expandedSomatic === p.id ? null : p.id)}
        >
          <div className="flex gap-3 items-start">
            {p.illustrationUrl ? (
              <img src={p.illustrationUrl} alt={p.title} className="w-[44px] h-[44px] object-contain flex-shrink-0 rounded-lg" loading="lazy" width={44} height={44} />
            ) : (
              <SomaticFallbackIcon id={p.id} />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg italic text-foreground mb-1">
                {p.title}
              </h3>
              <div className="flex gap-1.5 mb-1.5 flex-wrap items-center">
                <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {p.subtitle}
                </span>
                <span className="font-body text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(p.durationSec)}
                </span>
                {p.audio.enabled && (
                  <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F4] text-primary border border-primary/15 shadow-sm">
                    <Volume2 className="h-3.5 w-3.5 text-primary" /> Guided
                  </span>
                )}
              </div>

              {/* Compact state */}
              {expandedSomatic !== p.id && (
                <div className="flex items-end justify-between gap-3 mt-1">
                  <p className="font-display text-[12px] italic text-muted-foreground leading-relaxed line-clamp-1 flex-1 min-w-0">
                    {p.benefit}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                    className="shrink-0 rounded-full border border-primary/25 px-3.5 h-9 font-display text-xs italic text-primary active:scale-[0.96] flex items-center gap-1.5 transition-transform hover:bg-primary/5"
                  >
                    Begin →
                  </button>
                </div>
              )}

              {/* Expanded state */}
              {expandedSomatic === p.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-3">
                    {p.benefit}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); haptic("medium"); onSelect(p); }}
                    className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97]"
                  >
                    begin this practice →
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {!showAll && SOMATIC_PRACTICES.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center font-body text-xs text-primary py-2"
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
