import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/hooks/use-mobile";
import {
  SIGNAL_TRAINING_PATHS,
  type TrainingPath,
  type TrainingFocus,
  type DaySession,
  type TrainingWeek,
} from "@/data/signal-training-paths";
import { getExerciseImageForStructureLine } from "@/lib/exercise-image-lookup";

const FOCUS_LABEL: Record<TrainingFocus, string> = {
  strength: "Strength",
  muscle: "Muscle",
  cardio: "Cardio",
  run: "Run",
  pilates: "Pilates",
  restore: "Restore",
  "stress-relief": "Stress relief",
};

function preview(text: string, max = 100): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default function TrainingTab() {
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  if (selectedPath) {
    return (
      <PathDetail
        path={selectedPath}
        expandedWeek={expandedWeek}
        onToggleWeek={(w) => {
          haptic("light");
          setExpandedWeek((prev) => (prev === w ? null : w));
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
          Choose one when you're ready. There's no wrong place to begin — your body already knows
          how to move. We're just going to follow its lead.
        </p>
      </div>

      <div className="grid gap-3">
        {SIGNAL_TRAINING_PATHS.map((path, i) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 * i, ease: "easeOut" }}
          >
            <PathCard path={path} onOpen={() => { haptic("light"); setSelectedPath(path); }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PathCard({ path, onOpen }: { path: TrainingPath; onOpen: () => void }) {
  return (
    <article className="card-warm p-5 space-y-3 relative overflow-hidden">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-extrabold text-foreground leading-tight">
            {path.name}
          </h3>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {FOCUS_LABEL[path.focus]}
          </span>
        </div>
        <p className="font-editorial text-sm italic text-primary/80">{path.subtitle}</p>
      </div>

      <p className="font-body text-sm text-muted-foreground leading-relaxed">
        {preview(path.description, 100)}
      </p>

      <button
        onClick={onOpen}
        className="w-full h-11 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold flex items-center justify-center active:scale-[0.97] transition-transform"
      >
        View this path
      </button>
    </article>
  );
}

function PathDetail({
  path,
  expandedWeek,
  onToggleWeek,
  onBack,
}: {
  path: TrainingPath;
  expandedWeek: number | null;
  onToggleWeek: (week: number) => void;
  onBack: () => void;
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
        <span className="inline-block rounded-full bg-secondary px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {FOCUS_LABEL[path.focus]}
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
          {path.name}
        </h2>
        <p className="font-editorial text-base italic text-primary/80">{path.subtitle}</p>
        <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
          {path.description}
        </p>
      </header>

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
  expanded,
  onToggle,
}: {
  week: TrainingWeek;
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
          </p>
          <h4 className="font-display text-base font-bold text-foreground mt-0.5 leading-snug">
            {week.theme}
          </h4>
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
                  <SessionCard key={session.day} session={session} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionCard({ session }: { session: DaySession }) {
  const meta: string[] = [];
  if (typeof session.durationMin === "number" && session.durationMin > 0) {
    meta.push(`${session.durationMin} min`);
  }
  if (session.equipment) meta.push(session.equipment);

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
        <ul className="space-y-2 pl-4 list-disc marker:text-primary/40">
          {session.structure.map((line, i) => {
            const image = getExerciseImageForStructureLine(line);
            return (
              <li key={i} className="font-body text-xs text-foreground/85 leading-relaxed">
                {image ? (
                  <span className="flex items-start gap-2">
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-md object-contain shrink-0 -ml-1"
                    />
                    <span className="flex-1">{line}</span>
                  </span>
                ) : (
                  line
                )}
              </li>
            );
          })}
        </ul>
      )}

      {session.coachingNote && (
        <p className="font-body text-xs text-foreground/70 italic leading-relaxed border-l-2 border-primary/30 pl-3 mt-2">
          {session.coachingNote}
        </p>
      )}
    </div>
  );
}