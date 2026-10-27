import type { DaySession, Superset } from "@/data/signal-training-paths";
import ExerciseDemonstration from "@/components/ExerciseDemonstration";
import { extractExerciseName } from "@/lib/exercise-image-lookup";
import { useExerciseIllustrations } from "@/hooks/useExerciseIllustrations";
import { cn } from "@/lib/utils";

/**
 * One way to show a training session everywhere (Training tab, Today card):
 * warm-up, then each block with its rounds and rest, then the cool-down.
 * Each exercise shows reps, effort (reps in reserve), the suggested weight
 * and a one-line cue. Sessions written as plain lines fall back to a list.
 */
export default function SessionBlocks({ session, className }: { session: DaySession; className?: string }) {
  const lookupIllustration = useExerciseIllustrations();
  const cooldown = session.cooldown ?? session.coolDown;
  const rich = !session.isRestDay && (session.supersets?.length ?? 0) > 0;

  if (!rich) {
    const lines = (session.structure ?? []).filter(l => !/^\s*(warm[\s-]?up|cool[\s-]?down)\s*:/i.test(l) && l !== "Rest");
    if (!lines.length) return null;
    return (
      <ul className={cn("space-y-2", className)}>
        {lines.map((line, i) => {
          const name = extractExerciseName(line);
          return (
            <li key={i} className="flex items-start gap-2 font-body text-xs text-foreground/85 leading-relaxed">
              {name ? (
                <ExerciseDemonstration exerciseName={name} imageUrl={lookupIllustration(name)} size={36} className="shrink-0" />
              ) : (
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
              )}
              <span className="flex-1 pt-1">{line}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {session.warmup && session.warmup.length > 0 && <Steps title="Warm up" items={session.warmup} />}
      {session.supersets!.map((block, i) => (
        <Block key={i} block={block} index={i} lookup={lookupIllustration} />
      ))}
      {cooldown && cooldown.length > 0 && <Steps title="Cool down" items={cooldown} />}
    </div>
  );
}

function Steps({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-primary/[0.04] border border-primary/15 px-3 py-2.5">
      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-primary/80 font-semibold mb-1">{title}</p>
      <p className="font-body text-xs text-foreground/80 leading-relaxed">{items.join(" · ")}</p>
    </div>
  );
}

function blockLabel(block: Superset, index: number): string {
  if (block.label) return block.label;
  const letter = String.fromCharCode(65 + index);
  return block.exercises.length >= 2 ? `Superset ${letter}` : `Main lift ${letter}`;
}

function Block({ block, index, lookup }: { block: Superset; index: number; lookup: (name: string) => string | undefined }) {
  const rounds = block.rounds ?? 1;
  const meta = [
    rounds > 1 ? `${rounds} rounds` : null,
    block.restAfterSuperset ? `rest ${block.restAfterSuperset >= 90 ? `${Math.round((block.restAfterSuperset / 60) * 2) / 2} min` : `${block.restAfterSuperset} s`}` : null,
  ].filter(Boolean);
  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-secondary/40 border-b border-border">
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-foreground/70 font-semibold">{blockLabel(block, index)}</p>
        {meta.length > 0 && <p className="font-body text-[10px] text-muted-foreground">{meta.join(" · ")}</p>}
      </div>
      <div className="divide-y divide-border/50">
        {block.exercises.map((ex, i) => (
          <div key={i} className="flex items-start gap-3 px-3 py-2.5">
            <ExerciseDemonstration exerciseName={ex.name} imageUrl={lookup(ex.name)} size={40} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-body text-sm font-medium text-foreground leading-tight">{ex.name}</p>
                <p className="shrink-0 font-body text-xs font-semibold text-foreground/80 tabular-nums">{ex.reps}</p>
              </div>
              {(ex.weight || ex.rir || ex.tempo) && (
                <p className="mt-0.5 font-body text-[11px] text-muted-foreground leading-snug">
                  {[ex.weight, ex.rir ? `${ex.rir} in reserve` : null, ex.tempo ? `tempo ${ex.tempo}` : null].filter(Boolean).join(" · ")}
                </p>
              )}
              {ex.notes && <p className="mt-0.5 font-body text-[11px] text-primary/80 leading-snug">{ex.notes}</p>}
              {ex.cue && <p className="mt-0.5 font-editorial text-[11px] italic text-foreground/60 leading-snug">{ex.cue}</p>}
              {ex.alt && <p className="mt-0.5 font-body text-[10px] text-muted-foreground">Swap: {ex.alt}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
