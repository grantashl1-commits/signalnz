import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Clock, Flame, Snowflake, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import MuscleIllustration from "@/components/movement/MuscleIllustration";
import { supabase } from "@/integrations/supabase/client";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E", follicular: "#5C4A9E", ovulatory: "#C47A8A", luteal: "#9B89B4",
};

/** Strip AI-generated filler text like "point! point!" from exercise names/descriptions */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\b(point!\s*)+/gi, "")
    .replace(/\b(finish|move|pull|phase|block|sets)\b(?=\s+(point|finish|move))/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[,\s]+$/, "")
    .trim();
}

const INTENSITY_COLORS: Record<string, string> = {
  low: "text-green-600", moderate: "text-amber-500", high: "text-red-500", "very-high": "text-red-600",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.3 } }),
};

// Cache for stretch lookups
const stretchCache = new Map<string, { hold_duration: string; target_muscle: string }>();

async function lookupStretch(name: string) {
  const key = name.toLowerCase();
  if (stretchCache.has(key)) return stretchCache.get(key)!;

  const searchTerms = key.split(" ").slice(0, 2).join(" ");
  const { data } = await supabase
    .from("stretches")
    .select("hold_duration, target_muscle")
    .ilike("name", `%${searchTerms}%`)
    .limit(1)
    .maybeSingle();

  const result = {
    hold_duration: data?.hold_duration || "",
    target_muscle: data?.target_muscle || ""
  };
  stretchCache.set(key, result);
  return result;
}

// Cache for exercise muscle lookups (AI plan main-block rows)
const exerciseMuscleCache = new Map<string, string>();

async function lookupExerciseMuscle(name: string): Promise<string> {
  const key = name.toLowerCase();
  if (exerciseMuscleCache.has(key)) return exerciseMuscleCache.get(key)!;

  const searchTerms = key.replace(/[^a-z ]/g, "").split(" ").slice(0, 3).join(" ");
  if (!searchTerms) {
    exerciseMuscleCache.set(key, "");
    return "";
  }
  const { data } = await supabase
    .from("exercises")
    .select("target, body_part")
    .ilike("name", `%${searchTerms}%`)
    .limit(1)
    .maybeSingle();

  const target = (data?.target || data?.body_part || "") as string;
  exerciseMuscleCache.set(key, target);
  return target;
}

interface AISessionCardProps {
  session: any;
  trainingWeek: number;
  weekTheme?: string;
  phase: Phase;
  completedExercises: Set<string>;
  onToggleExercise: (name: string) => void;
  onOpenExercise: (ex: any) => void;
}

function StretchRow({ item, showGif }: { item: any; showGif?: boolean }) {
  const [stretchData, setStretchData] = useState<{ hold_duration: string; target_muscle: string } | null>(null);

  useEffect(() => {
    lookupStretch(item.name).then(setStretchData);
  }, [item.name]);

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {showGif && (
        <div className="flex-shrink-0">
          <ExerciseDemonstration
            exerciseName={sanitizeText(item.name)}
            size={36}
            className="rounded-lg"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="font-body text-xs text-foreground">{sanitizeText(item.name)}</span>
        {stretchData?.target_muscle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <MuscleIllustration targetMuscle={stretchData.target_muscle} size={20} />
            <p className="font-body text-[9px] text-muted-foreground">{stretchData.target_muscle}</p>
          </div>
        )}
      </div>
      <span className="font-body text-[10px] text-muted-foreground flex-shrink-0">
        {stretchData?.hold_duration || item.duration || item.hold_duration || ""}
      </span>
    </div>
  );
}

export default function AISessionCard({
  session, trainingWeek, weekTheme, phase,
  completedExercises, onToggleExercise, onOpenExercise,
}: AISessionCardProps) {
  const [showWarmUp, setShowWarmUp] = useState(false);
  const [showCoolDown, setShowCoolDown] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const phaseColor = PHASE_HEX[phase];

  const allExercises = session.main_block
    ? session.main_block.flatMap((b: any) => b.exercises || [])
    : session.exercises || [];
  const totalExercises = allExercises.length;
  const completedCount = allExercises.filter((ex: any) => completedExercises.has(ex.name)).length;

  const hasNewFormat = Array.isArray(session.warm_up) || Array.isArray(session.main_block);

  return (
    <div className="card-warm p-4 space-y-4 ring-1 ring-primary/20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg italic text-foreground">{sanitizeText(session.name)}</h3>
        </div>
        <p className="font-body text-[9px] italic text-primary mt-0.5">
          Week {trainingWeek} · {weekTheme || session.phase_label}
        </p>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: phaseColor }}>
            <Clock className="h-3 w-3" /> {session.durationMin || session.duration_minutes} min
          </span>
          <span className="font-body text-[10px] text-muted-foreground capitalize">{session.category || session.type}</span>
          {session.intensity && (
            <span className={`font-body text-[10px] capitalize ${INTENSITY_COLORS[session.intensity] || "text-muted-foreground"}`}>
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
          <p className="font-body text-[10px] text-muted-foreground">{completedCount}/{totalExercises} exercises</p>
        </div>
      )}

      {/* Warm-up section with GIFs */}
      {hasNewFormat && session.warm_up?.length > 0 && (
        <div className="rounded-xl bg-accent/30 overflow-hidden">
          <button
            onClick={() => { haptic("light"); setShowWarmUp(!showWarmUp); }}
            className="touch-btn w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="font-body text-xs font-semibold text-foreground">Warm-Up</span>
              <span className="font-body text-[10px] text-muted-foreground">{session.warm_up.length} movements</span>
            </div>
            {showWarmUp ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showWarmUp && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1">
                  {session.warm_up.map((wu: any, i: number) => (
                    <StretchRow key={i} item={wu} showGif />
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
            <span className="font-display text-xs font-bold italic" style={{ color: phaseColor }}>{sanitizeText(block.section_label)}</span>
            <span className="font-body text-[10px] text-muted-foreground">{block.exercises?.length || 0}</span>
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
                {/* Anatomy illustration */}
                <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); onOpenExercise(ex); }}>
                  <ExerciseDemonstration exerciseName={sanitizeText(ex.name)} size={42} className="rounded-lg" showLabel />
                </div>
                <div className="flex-1 min-w-0" onClick={() => onOpenExercise(ex)}>
                  <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{sanitizeText(ex.name)}</p>
                  <div className="flex gap-2 flex-wrap mt-0.5">
                    {ex.sets && <span className="font-body text-[9px]" style={{ color: phaseColor }}>{ex.sets} × {sanitizeText(ex.reps_or_duration)}</span>}
                    {ex.rest && <span className="font-body text-[9px] text-muted-foreground">Rest {sanitizeText(ex.rest)}</span>}
                  </div>
                  {ex.form_cue && (
                    <p className="font-body text-[9px] italic text-muted-foreground mt-0.5 leading-tight">{sanitizeText(ex.form_cue)}</p>
                  )}
                </div>
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
                  <p className="font-display text-xs font-bold italic mt-3 mb-1" style={{ color: phaseColor }}>{sanitizeText(ex.section)}</p>
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
                  <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); onOpenExercise(ex); }}>
                    <ExerciseDemonstration exerciseName={sanitizeText(ex.name)} size={42} className="rounded-lg" showLabel />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => onOpenExercise(ex)}>
                    <p className={`font-body text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{sanitizeText(ex.name)}</p>
                    <p className="font-body text-[9px]" style={{ color: phaseColor }}>
                      {ex.sets && `${ex.sets}×`}{sanitizeText(ex.reps)}{ex.duration && ` ${sanitizeText(ex.duration)}`}
                    </p>
                    {(ex.formCue || ex.form_cue) && (
                      <p className="font-body text-[9px] italic text-muted-foreground mt-0.5">{sanitizeText(ex.formCue || ex.form_cue)}</p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cool-down section with GIFs */}
      {hasNewFormat && session.cool_down?.length > 0 && (
        <div className="rounded-xl bg-secondary/40 overflow-hidden">
          <button
            onClick={() => { haptic("light"); setShowCoolDown(!showCoolDown); }}
            className="touch-btn w-full flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Snowflake className="h-3.5 w-3.5 text-primary" />
              <span className="font-body text-xs font-semibold text-foreground">Cool-Down</span>
              <span className="font-body text-[10px] text-muted-foreground">{session.cool_down.length} stretches</span>
            </div>
            {showCoolDown ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showCoolDown && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-3 pb-3 space-y-1">
                  {session.cool_down.map((cd: any, i: number) => (
                    <StretchRow key={i} item={cd} showGif />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Old format cool-down string */}
      {!hasNewFormat && session.coolDown && (
        <div className="flex items-start gap-2 rounded-xl bg-secondary/40 p-3">
          <Snowflake className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground">{session.coolDown}</p>
        </div>
      )}

      {/* Coaching note */}
      {session.coaching_note && (
        <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <MessageCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground leading-relaxed italic">{sanitizeText(session.coaching_note)}</p>
        </div>
      )}
    </div>
  );
}
