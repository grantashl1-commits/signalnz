import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Clock, Flame, Snowflake, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

const INTENSITY_COLORS: Record<string, string> = {
  low: "text-green-600", moderate: "text-amber-500", high: "text-red-500", "very-high": "text-red-600",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.3 } }),
};

interface AISessionCardProps {
  session: any;
  trainingWeek: number;
  weekTheme?: string;
  phase: Phase;
  completedExercises: Set<string>;
  onToggleExercise: (name: string) => void;
  onOpenExercise: (ex: any) => void;
}

export default function AISessionCard({
  session, trainingWeek, weekTheme, phase,
  completedExercises, onToggleExercise, onOpenExercise,
}: AISessionCardProps) {
  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const phaseColor = PHASE_HEX[phase];

  // Count all exercises across main_block sections
  const allExercises = session.main_block
    ? session.main_block.flatMap((b: any) => b.exercises || [])
    : session.exercises || [];
  const totalExercises = allExercises.length;
  const completedCount = allExercises.filter((ex: any) => completedExercises.has(ex.name)).length;

  // Support both old format (exercises array) and new format (warm_up/main_block/cool_down)
  const hasNewFormat = Array.isArray(session.warm_up) || Array.isArray(session.main_block);

  return (
    <div className="card-warm p-4 space-y-4 ring-1 ring-primary/20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg italic text-foreground">{session.name}</h3>
        </div>
        <p className="font-body text-[9px] italic text-primary mt-0.5">
          AI Plan · Week {trainingWeek} · {weekTheme || session.phase_label}
        </p>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: phaseColor }}>
            <Clock className="h-3 w-3" /> {session.durationMin || session.duration_minutes} min
          </span>
          <span className="font-body text-[10px] text-muted-foreground capitalize">{session.category || session.type}</span>
          {session.intensity && (
            <span className={`font-mono text-[10px] capitalize ${INTENSITY_COLORS[session.intensity] || "text-muted-foreground"}`}>
              {session.intensity}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalExercises > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedCount / totalExercises) * 100}%` }} />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">{completedCount}/{totalExercises} exercises</p>
        </div>
      )}

      {/* Warm-up section */}
      {hasNewFormat && session.warm_up?.length > 0 && (
        <div className="rounded-xl bg-accent/30 overflow-hidden">
          <button
            onClick={() => { haptic("light"); setShowWarmUp(!showWarmUp); }}
            className="touch-btn w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-body text-xs font-semibold text-foreground">Warm-Up</span>
              <span className="font-mono text-[10px] text-muted-foreground">{session.warm_up.length} exercises</span>
            </div>
            {showWarmUp ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showWarmUp && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1.5">
                  {session.warm_up.map((wu: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="font-body text-xs text-foreground">{wu.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{wu.duration}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main block sections (new format) */}
      {hasNewFormat && session.main_block?.map((block: any, blockIdx: number) => (
        <div key={blockIdx} className="space-y-1.5">
          <button
            onClick={() => { haptic("light"); setExpandedSection(expandedSection === block.section_label ? null : block.section_label); }}
            className="touch-btn flex items-center gap-2 w-full"
          >
            <span className="font-display text-xs font-bold italic" style={{ color: phaseColor }}>{block.section_label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{block.exercises?.length || 0}</span>
            <div className="flex-1" />
            {expandedSection === block.section_label
              ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>

          {(expandedSection === block.section_label || session.main_block.length <= 2) && block.exercises?.map((ex: any, i: number) => {
            const done = completedExercises.has(ex.name);
            return (
              <motion.div key={ex.name + i} custom={i} initial="hidden" animate="visible" variants={cardVariant}
                className={`touch-card flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all min-h-[52px] ${done ? "bg-primary/5" : "bg-secondary/50 active:bg-secondary"}`}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${done ? "bg-primary border-primary" : "border-muted-foreground/30"}`}
                  onClick={(e) => { e.stopPropagation(); onToggleExercise(ex.name); }}
                >
                  {done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0" onClick={() => onOpenExercise(ex)}>
                  <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                  <div className="flex gap-2 flex-wrap mt-0.5">
                    {ex.sets && <span className="font-mono text-[9px]" style={{ color: phaseColor }}>{ex.sets} × {ex.reps_or_duration}</span>}
                    {ex.rest && <span className="font-mono text-[9px] text-muted-foreground">Rest {ex.rest}</span>}
                    {ex.tempo && <span className="font-mono text-[9px] text-muted-foreground">Tempo {ex.tempo}</span>}
                  </div>
                </div>
                <p className="font-body text-[9px] italic text-muted-foreground max-w-[100px] text-right hidden sm:block leading-tight">{ex.form_cue}</p>
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Fallback: old format exercises array */}
      {!hasNewFormat && session.exercises?.length > 0 && (
        <div className="space-y-1.5">
          {session.exercises.map((ex: any, i: number) => {
            const done = completedExercises.has(ex.name);
            const showSection = i === 0 || ex.section !== session.exercises[i - 1]?.section;
            return (
              <div key={ex.name + i}>
                {showSection && ex.section && (
                  <p className="font-display text-xs font-bold italic mt-3 mb-1" style={{ color: phaseColor }}>{ex.section}</p>
                )}
                <motion.div custom={i} initial="hidden" animate="visible" variants={cardVariant}
                  className={`touch-card flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all min-h-[52px] ${done ? "bg-primary/5" : "bg-secondary/50 active:bg-secondary"}`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${done ? "bg-primary border-primary" : "border-muted-foreground/30"}`}
                    onClick={(e) => { e.stopPropagation(); onToggleExercise(ex.name); }}
                  >
                    {done && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => onOpenExercise(ex)}>
                    <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
                    <p className="font-mono text-[9px]" style={{ color: phaseColor }}>
                      {ex.sets && `${ex.sets}×`}{ex.reps}{ex.duration && ` ${ex.duration}`}
                    </p>
                  </div>
                  <p className="font-body text-[9px] italic text-muted-foreground max-w-[90px] text-right hidden sm:block">{ex.formCue || ex.form_cue}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cool-down section */}
      {hasNewFormat && session.cool_down?.length > 0 && (
        <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
          <button
            onClick={() => { haptic("light"); setShowCoolDown(!showCoolDown); }}
            className="touch-btn w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Snowflake className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-body text-xs font-semibold text-foreground">Cool-Down</span>
              <span className="font-mono text-[10px] text-muted-foreground">{session.cool_down.length} stretches</span>
            </div>
            {showCoolDown ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showCoolDown && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1.5">
                  {session.cool_down.map((cd: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="font-body text-xs text-foreground">{cd.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{cd.duration}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Old format cool-down string */}
      {!hasNewFormat && session.coolDown && (
        <div className="flex items-start gap-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 p-3">
          <Snowflake className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground">{session.coolDown}</p>
        </div>
      )}

      {/* Coaching note */}
      {session.coaching_note && (
        <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <MessageCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground leading-relaxed italic">{session.coaching_note}</p>
        </div>
      )}
    </div>
  );
}
