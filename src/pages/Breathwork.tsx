import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Clock, ExternalLink } from "lucide-react";
import { SeedGeometry, BotanicalSprig } from "@/components/BotanicalElements";

import rainImg from "@/assets/meditations/rain-meditation.png";
import lkmImg from "@/assets/meditations/loving-kindness.png";
import mbsrImg from "@/assets/meditations/mbsr-body-scan.png";
import breathImg from "@/assets/meditations/mindful-breathing.png";
import nsdrImg from "@/assets/meditations/nsdr.png";
import innerChildImg from "@/assets/meditations/inner-child.png";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
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

// ── MEDITATIONS ──────────────────────────────────────────────
const MEDITATIONS = [
  {
    id: "rain",
    title: "RAIN Meditation",
    teacher: "Tara Brach",
    dur: "20 min",
    desc: "RAIN is a powerful mindfulness practice for working with difficult emotions.\n\nRecognize what is happening. Allow the experience to be there. Investigate with curiosity. Nurture with compassion.\n\nWidely used in trauma-sensitive mindfulness and self-compassion work.",
    tags: ["emotions", "self-compassion", "IFS-compatible"],
    url: "https://www.tarabrach.com/rain/",
    img: rainImg,
  },
  {
    id: "lkm",
    title: "Loving Kindness Meditation",
    teacher: "Sharon Salzberg",
    dur: "18 min",
    desc: "A classic compassion meditation from the Buddhist metta tradition.\n\nThis practice cultivates warmth and kindness toward yourself and others and has been shown in research to increase positive emotions and resilience.",
    tags: ["compassion", "self-love", "healing"],
    url: "https://www.mindful.org/loving-kindness-meditation/",
    img: lkmImg,
  },
  {
    id: "mbsr",
    title: "MBSR Body Scan",
    teacher: "Jon Kabat-Zinn",
    dur: "45 min",
    desc: "The foundational mindfulness body scan practice from Mindfulness-Based Stress Reduction (MBSR).\n\nThis meditation trains somatic awareness and the ability to observe sensations without judgment.",
    tags: ["body awareness", "MBSR", "mindfulness"],
    url: "https://palousemindfulness.com/meditations/bodyscan.html",
    img: mbsrImg,
  },
  {
    id: "thich",
    title: "Mindful Breathing",
    teacher: "Thich Nhat Hanh Tradition",
    dur: "15 min",
    desc: "A simple but profound meditation returning awareness to the breath.\n\nThis practice develops presence and calm by gently anchoring attention in breathing.",
    tags: ["breath", "presence", "peace"],
    url: "https://plumvillage.org/library/guided-meditation/breathing-meditation/",
    img: breathImg,
  },
  {
    id: "nsdr",
    title: "Non-Sleep Deep Rest (NSDR)",
    teacher: "Huberman Lab Protocol",
    dur: "10 min",
    desc: "A neuroscience-informed practice designed to restore energy and regulate the nervous system.\n\nNSDR protocols are used to accelerate recovery and improve focus.",
    tags: ["nervous system", "rest", "recovery"],
    url: "https://www.hubermanlab.com/nsdr",
    img: nsdrImg,
  },
  {
    id: "self-compassion",
    title: "Self-Compassion Break",
    teacher: "Kristin Neff",
    dur: "8 min",
    desc: "A brief guided practice that helps you respond to difficult moments with kindness rather than self-criticism.\n\nOften used in compassion-focused therapy and emotional resilience training.",
    tags: ["self-compassion", "healing", "emotional regulation"],
    url: "https://self-compassion.org/exercise-2-self-compassion-break/",
    img: compassionImg,
  },
  {
    id: "open-awareness",
    title: "Open Awareness Meditation",
    teacher: "Waking Up Tradition",
    dur: "20 min",
    desc: "Instead of focusing on one object, this meditation invites awareness to open and include all experience.\n\nSounds, sensations, and thoughts are allowed to arise without resistance.",
    tags: ["awareness", "presence", "non-dual"],
    url: "https://dynamic.wakingup.com/course/CO0F1D4",
    img: openImg,
  },
];

// ── Breathwork Cards ─────────────────────────────────────────
function BreathworkCards({
  onSelect,
}: {
  onSelect: (p: PracticeConfig) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {BREATHWORK_PRACTICES.map((p, i) => (
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
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-display text-lg italic text-foreground">
              {p.title}
            </h3>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">
              strong evidence
            </span>
          </div>
          <p className="font-mono text-[13px] text-muted-foreground mb-1">
            {p.phases?.map((ph) => ph.seconds).join("-")}
          </p>
          <p className="font-body text-[15px] text-foreground/70 mb-1">
            {p.subtitle}
          </p>

          {/* Audio badge */}
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
    </div>
  );
}

// ── Somatic Cards ────────────────────────────────────────────
function SomaticCards({
  onSelect,
}: {
  onSelect: (p: PracticeConfig) => void;
}) {
  return (
    <div className="space-y-3">
      {SOMATIC_PRACTICES.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i}
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
    </div>
  );
}

// ── Meditations Section ──────────────────────────────────────
function MeditationsSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="font-display text-2xl italic text-foreground mb-1">Meditation Library</h2>
        <p className="font-hand text-sm font-bold text-primary mb-2">Practices drawn from the world's most respected mindfulness traditions.</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          These guided meditations come from teachers and traditions widely used in mindfulness research and therapeutic settings.
          Each practice offers a different pathway into awareness, emotional balance, and nervous system regulation.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {MEDITATIONS.map((m, i) => (
          <motion.div
            key={m.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariant}
            className="card-warm overflow-hidden"
          >
            <div className="flex gap-4 p-5">
              <img
                src={m.img}
                alt={m.title}
                className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-display text-lg italic text-foreground leading-snug">{m.title}</h3>
                  <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">{m.dur}</span>
                </div>
                <p className="font-mono text-xs text-primary mt-0.5 mb-2">{m.teacher}</p>
                <p className="font-body text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{m.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-btn flex items-center justify-center gap-2 w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground hover:opacity-90 active:scale-[0.97] transition-all"
              >
                watch meditation
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <p className="font-body text-xs text-muted-foreground/60 text-center leading-relaxed mt-6 max-w-md mx-auto">
        These meditations are shared from publicly available teachings by respected mindfulness teachers.
        Links open on their original platforms to ensure proper attribution and licensing.
      </p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function BreathworkPage() {
  const [section, setSection] = useState<
    "breathwork" | "somatic" | "meditations"
  >("breathwork");
  const [activePractice, setActivePractice] = useState<PracticeConfig | null>(
    null
  );

  const sections = [
    { id: "breathwork" as const, label: "Breathwork" },
    { id: "somatic" as const, label: "Somatic" },
    { id: "meditations" as const, label: "Meditations" },
  ];

  const titles = {
    breathwork: "Breathwork & Regulation",
    somatic: "Somatic Practices",
    meditations: "Meditation Library",
  };

  const icons = {
    breathwork: "≈",
    somatic: "◎",
    meditations: "♩",
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Background */}
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 pointer-events-none">
        <SeedGeometry size={160} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={250} opacity={0.08} className="hidden md:block" />
      </div>

      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl text-primary">{icons[section]}</span>
          <h1 className="font-display text-[1.5rem] md:text-3xl font-bold italic text-foreground">
            {titles[section]}
          </h1>
        </div>
      </div>

      {/* Sub-nav pill */}
      <div className="sticky top-[52px] md:static z-20 bg-background/95 backdrop-blur-sm pb-4 md:pb-6 -mx-5 px-5 md:mx-0 md:px-0 pt-2 md:pt-0">
        <div className="flex bg-muted/60 rounded-2xl p-1">
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
            <SomaticCards onSelect={setActivePractice} />
          )}
          {section === "meditations" && <MeditationsSection />}
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
    </div>
  );
}
