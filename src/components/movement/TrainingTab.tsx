import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  SIGNAL_TRAINING_PATHS,
  type TrainingPath,
  type TrainingFocus,
  type DaySession,
  type TrainingWeek,
} from "@/data/signal-training-paths";
import { enrichAllTrainingPaths } from "@/lib/training-csv-enrichment";
import {
  getSelectedPathId,
  setSelectedPathId,
} from "@/lib/training-path-utils";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { extractExerciseName } from "@/lib/exercise-image-lookup";
import { parseRunStructure, isRunSessionPlayable } from "@/lib/run-session-parser";
import IntervalTimer from "@/components/movement/IntervalTimer";
import { Timer, Play } from "lucide-react";

// Hero illustrations for each focus
import strengthArt from "@/assets/training-paths/strength.png";
import muscleArt from "@/assets/training-paths/muscle.png";
import cardioArt from "@/assets/training-paths/cardio.png";
import runArt from "@/assets/training-paths/run.png";
import pilatesArt from "@/assets/training-paths/pilates.png";
import restoreArt from "@/assets/training-paths/restore.png";
import stressReliefArt from "@/assets/training-paths/stress-relief.png";
import glutePowerArt from "@/assets/training-paths/glute-power.png";

const FOCUS_ART: Record<TrainingFocus, string> = {
  strength: strengthArt,
  muscle: muscleArt,
  cardio: cardioArt,
  run: runArt,
  pilates: pilatesArt,
  restore: restoreArt,
  "stress-relief": stressReliefArt,
  "glute-power": glutePowerArt,
};

const FOCUS_LABEL: Record<TrainingFocus, string> = {
  strength: "Strength",
  muscle: "Muscle",
  cardio: "Cardio",
  run: "Run",
  pilates: "Pilates",
  restore: "Restore",
  "stress-relief": "Stress Relief",
  "glute-power": "Glute Power",
};

/** Big punchy display title shown on each card, instead of the long
 *  copywriting name. The full `path.name` becomes the subtitle. */
const FOCUS_DISPLAY_TITLE: Record<TrainingFocus, string> = {
  strength: "Strength",
  muscle: "Muscle",
  cardio: "Cardio",
  run: "Run",
  pilates: "Pilates",
  restore: "Restore",
  "stress-relief": "Stress Relief",
  "glute-power": "Glute Power",
};

const ENRICHED_PATHS = enrichAllTrainingPaths(SIGNAL_TRAINING_PATHS);

export default function TrainingTab() {
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(getSelectedPathId());

  useEffect(() => {
    const handler = () => setActivePathId(getSelectedPathId());
    window.addEventListener("signal:training-path-changed", handler);
    return () => window.removeEventListener("signal:training-path-changed", handler);
  }, []);

  if (selectedPath) {
    return (
      <PathDetail
        path={selectedPath}
        active={activePathId === selectedPath.id}
        expandedWeek={expandedWeek}
        onToggleWeek={(w) => {
          haptic("light");
          setExpandedWeek((prev) => (prev === w ? null : w));
        }}
        onChooseAsToday={() => {
          haptic("light");
          setSelectedPathId(selectedPath.id);
          setActivePathId(selectedPath.id);
          toast.success(`${FOCUS_DISPLAY_TITLE[selectedPath.focus]} is now your Today plan.`);
        }}
        onBack={() => {
          haptic("light");
          setSelectedPath(null);
          setExpandedWeek(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <p className="font-hand text-sm text-primary">A few paths home</p>
        <p className="font-editorial text-base italic text-foreground/80 leading-relaxed">
          Choose one when you're ready. Your Today tab follows whichever you pick.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-fr">
        {ENRICHED_PATHS.map((path, i) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
            className="h-full"
          >
            <PathCard
              path={path}
              active={activePathId === path.id}
              onOpen={() => { haptic("light"); setSelectedPath(path); }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PathCard({
  path,
  active,
  onOpen,
}: {
  path: TrainingPath;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={cn(
        "group relative w-full h-full flex flex-col overflow-hidden rounded-2xl text-left bg-card border transition-all active:scale-[0.98]",
        active
          ? "border-primary ring-2 ring-primary/30 shadow-md"
          : "border-border hover:shadow-md hover:border-primary/30",
      )}
    >
      {active && (
        <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-body text-[9px] uppercase tracking-wider font-bold">
          <Check className="h-2.5 w-2.5" /> Today
        </span>
      )}
      <div className="aspect-square w-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
        <img
          src={FOCUS_ART[path.focus]}
          alt={FOCUS_DISPLAY_TITLE[path.focus]}
          loading="lazy"
          width={768}
          height={768}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3 md:p-4 space-y-1.5 flex-1 flex flex-col">
        <h3 className="font-display text-base md:text-lg font-extrabold text-foreground leading-tight min-h-[1.5rem]">
          {FOCUS_DISPLAY_TITLE[path.focus]}
        </h3>
        <p className="font-editorial text-[11px] md:text-xs italic text-primary/80 line-clamp-2 leading-snug min-h-[2.25rem]">
          {path.subtitle}
        </p>
        <p className="font-body text-[10px] md:text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
          {path.description.split(".")[0]}.
        </p>
      </div>
    </button>
  );
}

function PathDetail({
  path,
  active,
  expandedWeek,
  onToggleWeek,
  onBack,
  onChooseAsToday,
}: {
  path: TrainingPath;
  active: boolean;
  expandedWeek: number | null;
  onToggleWeek: (week: number) => void;
  onBack: () => void;
  onChooseAsToday: () => void;
}) {
  return (
    <div className="space-y-6 pb-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        All paths
      </button>

      <header className="space-y-3">
        <div className="flex items-start gap-4">
          <img
            src={FOCUS_ART[path.focus]}
            alt={FOCUS_DISPLAY_TITLE[path.focus]}
            className="h-24 w-24 md:h-32 md:w-32 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <span className="inline-block rounded-full bg-secondary px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {FOCUS_LABEL[path.focus]}
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
              {FOCUS_DISPLAY_TITLE[path.focus]}
            </h2>
            <p className="font-editorial text-sm md:text-base italic text-primary/80">
              {path.name}
            </p>
          </div>
        </div>
        <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
          {path.description}
        </p>
      </header>

      <button
        onClick={onChooseAsToday}
        disabled={active}
        className={cn(
          "w-full h-12 rounded-full font-display text-sm font-semibold transition-all",
          active
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-primary text-primary-foreground active:scale-[0.97]",
        )}
      >
        {active ? "✓ Following this path on Today" : "Follow this path on Today"}
      </button>

      <section className="card-warm p-4 space-y-1.5">
        <p className="font-hand text-xs uppercase tracking-[0.2em] text-primary">Who it's for</p>
        <p className="font-body text-sm text-foreground leading-relaxed">{path.whoItIsFor}</p>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
          Eight weeks, one slow returning
        </h3>
        <div className="space-y-2">
          {path.weeks.map((week) => (
            <WeekRow
              key={week.week}
              week={week}
              focus={path.focus}
              expanded={expandedWeek === week.week}
              onToggle={() => onToggleWeek(week.week)}
            />
          ))}
          {path.weeks.length === 0 && (
            <p className="font-body text-sm text-muted-foreground italic">
              The weeks for this path are still being written. Check back soon.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function WeekRow({
  week,
  focus,
  expanded,
  onToggle,
}: {
  week: TrainingWeek;
  focus: TrainingFocus;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-body text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Week {week.week}
            {week.rpeMin != null && week.rpeMax != null && (
              <span className="font-body normal-case tracking-normal text-muted-foreground/70 ml-2 font-medium">
                · RPE {week.rpeMin}–{week.rpeMax}
              </span>
            )}
          </p>
          <h4 className="font-display text-base font-bold text-foreground mt-0.5 leading-snug">
            {week.theme}
          </h4>
          {week.phaseGoal && (
            <p className="font-editorial text-xs italic text-foreground/65 mt-1 leading-relaxed">
              {week.phaseGoal}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              {week.progression && (
                <p className="font-body text-xs text-primary/80 italic leading-relaxed">
                  {week.progression}
                </p>
              )}
              <div className="space-y-2.5">
                {week.sessions.map((session) => (
                  <SessionCard key={session.day} session={session} focus={focus} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionCard({ session, focus }: { session: DaySession; focus: TrainingFocus }) {
  const [timerOpen, setTimerOpen] = useState(false);
  const meta: string[] = [];
  if (typeof session.durationMin === "number" && session.durationMin > 0) {
    meta.push(`${session.durationMin} min`);
  }
  if (session.equipment) meta.push(session.equipment);

  const runIntervals = focus === "run" ? parseRunStructure(session.structure) : [];
  const playable = runIntervals.length >= 2;
  const totalSec = runIntervals.reduce((s, i) => s + i.durationSec, 0);
  const totalMin = Math.round(totalSec / 60);

  return (
    <div className="rounded-lg bg-secondary/40 border border-border/60 p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-body text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Day {session.day}
          </p>
          <h5 className="font-display text-sm font-bold text-foreground mt-0.5 leading-snug">
            {session.name}
          </h5>
        </div>
        {meta.length > 0 && (
          <p className="font-body text-[11px] text-muted-foreground shrink-0 text-right">
            {meta.join(" · ")}
          </p>
        )}
      </div>

      {session.focus && (
        <p className="font-body text-xs text-muted-foreground">{session.focus}</p>
      )}

      {session.feel && (
        <p className="font-editorial text-xs italic text-primary/70">
          Feels like: {session.feel}
        </p>
      )}

      {session.structure && session.structure.length > 0 && (
        <ul className="space-y-2">
          {session.structure.map((line, i) => {
            const exerciseName = extractExerciseName(line);
            return (
              <li key={i} className="font-body text-xs text-foreground/85 leading-relaxed">
                {exerciseName ? (
                  <span className="flex items-start gap-2">
                    <ExerciseDemonstration
                      exerciseName={exerciseName}
                      size={40}
                      className="shrink-0"
                    />
                    <span className="flex-1 pt-1">{line}</span>
                  </span>
                ) : (
                  <span className="pl-1 before:content-['•'] before:text-primary/40 before:mr-2">
                    {line}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {session.warmupNotes && (
        <div className="mt-2 pl-3 border-l border-primary/20">
          <p className="font-body text-[10px] text-primary/80 uppercase tracking-[0.18em] font-semibold">Warm up</p>
          <p className="font-body text-xs text-foreground/75 leading-relaxed mt-0.5">{session.warmupNotes}</p>
        </div>
      )}

      {session.sessionNotes && (
        <div className="mt-2 pl-3 border-l border-primary/20">
          <p className="font-body text-[10px] text-primary/80 uppercase tracking-[0.18em] font-semibold">During the session</p>
          <p className="font-body text-xs text-foreground/75 leading-relaxed mt-0.5">{session.sessionNotes}</p>
        </div>
      )}

      {session.cooldownNotes && (
        <div className="mt-2 pl-3 border-l border-primary/20">
          <p className="font-body text-[10px] text-primary/80 uppercase tracking-[0.18em] font-semibold">Land softly</p>
          <p className="font-body text-xs text-foreground/75 leading-relaxed mt-0.5">{session.cooldownNotes}</p>
        </div>
      )}

      {session.coachingNote && (
        <p className="font-body text-xs text-foreground/70 italic leading-relaxed border-l-2 border-primary/30 pl-3 mt-2">
          {session.coachingNote}
        </p>
      )}
    </div>
  );
}
