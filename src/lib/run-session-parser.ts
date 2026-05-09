/**
 * Parses Run programme `session.structure` strings (from
 * src/data/signal-training-paths.ts) into a flat list of TimerIntervals
 * for the IntervalTimer.
 *
 * Handles patterns like:
 *   "5 min brisk walk"
 *   "5 min walk cool‑down"
 *   "Repeat 5×: 1 min light jog / 2 min walk"
 *   "5×: 90 sec jog / 2 min walk, then finish with 3 min jog"
 *   "1×: 15 min jog continuous"
 *   "Run 20 min continuous"
 *   "Run 30 min (or as long as feels good)"
 *   "Easy 20 min run – enjoy it"
 *
 * Walk segments are tagged "rest" (recovery), jog/run are "work".
 * Lines that don't contain a parsable duration are skipped.
 */
import type { TimerInterval } from "@/components/movement/IntervalTimer";

function parseDurationSec(text: string): number | null {
  // "90 sec", "30s", "5 min", "1.5 min"
  const min = text.match(/(\d+(?:\.\d+)?)\s*min/i);
  if (min) return Math.round(parseFloat(min[1]) * 60);
  const sec = text.match(/(\d+)\s*s(?:ec(?:onds?)?)?\b/i);
  if (sec) return parseInt(sec[1]);
  return null;
}

function classifySegment(text: string): "work" | "rest" {
  const t = text.toLowerCase();
  // walk wins if both present (very rare); pure recovery
  if (/\bwalk(ing)?\b/.test(t) && !/\b(jog|run)\b/.test(t)) return "rest";
  if (/\b(jog|run)\b/.test(t)) return "work";
  if (/\bwalk(ing)?\b/.test(t)) return "rest";
  // default to work for unlabeled (e.g. "Easy 20 min")
  return "work";
}

function labelFor(text: string, position: "warmup" | "cooldown" | "interval" | "finisher"): string {
  const t = text.toLowerCase();
  const isWalk = /\bwalk(ing)?\b/.test(t) && !/\b(jog|run)\b/.test(t);
  const isJog = /\b(jog|run)\b/.test(t);
  if (position === "warmup") return isWalk ? "Walk warm‑up" : "Warm‑up";
  if (position === "cooldown") return isWalk ? "Walk cool‑down" : "Cool‑down";
  if (position === "finisher") return isJog ? "Final jog" : isWalk ? "Walk" : "Finish";
  return isWalk ? "Walk" : isJog ? "Jog" : "Move";
}

interface ParseLineResult {
  intervals: TimerInterval[];
  /** True if this line is a structured session step (warm-up, intervals, cool-down). */
  matched: boolean;
}

function parseSingleSegment(
  text: string,
  position: "warmup" | "cooldown" | "interval" | "finisher",
): TimerInterval | null {
  const dur = parseDurationSec(text);
  if (!dur || dur <= 0) return null;
  return {
    label: labelFor(text, position),
    durationSec: dur,
    type: classifySegment(text),
  };
}

function parseRepeatLine(line: string): ParseLineResult {
  // "Repeat 5×: 1 min jog / 2 min walk"  or  "5×: 90 sec jog / 2 min walk, then finish with 3 min jog"
  const m = line.match(/(\d+)\s*[×x]\s*[:.]?\s*(.+)/i);
  if (!m) return { intervals: [], matched: false };

  const rounds = parseInt(m[1]);
  let inner = m[2];

  // Split off trailing "then ..." finisher
  let finisher: string | null = null;
  const thenSplit = inner.split(/,?\s*then\s+(?:finish\s+with\s+)?/i);
  if (thenSplit.length > 1) {
    inner = thenSplit[0];
    finisher = thenSplit.slice(1).join(" then ");
  }

  // Split inner segments by "/" (jog / walk)
  const segments = inner.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
  const segIntervals = segments
    .map(s => parseSingleSegment(s, "interval"))
    .filter((x): x is TimerInterval => !!x);

  if (segIntervals.length === 0) return { intervals: [], matched: false };

  const intervals: TimerInterval[] = [];
  for (let r = 0; r < rounds; r++) {
    for (const seg of segIntervals) {
      intervals.push({
        ...seg,
        label: rounds > 1 ? `${seg.label} (${r + 1}/${rounds})` : seg.label,
      });
    }
  }

  if (finisher) {
    const fin = parseSingleSegment(finisher, "finisher");
    if (fin) intervals.push(fin);
  }

  return { intervals, matched: true };
}

export function parseRunStructure(structure: string[] | undefined): TimerInterval[] {
  if (!structure || structure.length === 0) return [];

  const out: TimerInterval[] = [];
  const lower = (s: string) => s.toLowerCase();

  structure.forEach((line, idx) => {
    if (!line || !line.trim()) return;

    // Try repeat pattern first
    const rep = parseRepeatLine(line);
    if (rep.matched) {
      out.push(...rep.intervals);
      return;
    }

    // Single-segment line — decide warm-up / cool-down / standalone run by position + keywords.
    const isCooldown =
      /cool[\s-‑]?down/i.test(line) ||
      (idx === structure.length - 1 && /walk/i.test(line) && !/jog|run/i.test(line));
    const isWarmup =
      idx === 0 && /walk/i.test(line) && !/jog|run/i.test(line);
    const position: "warmup" | "cooldown" | "interval" =
      isWarmup ? "warmup" : isCooldown ? "cooldown" : "interval";

    const seg = parseSingleSegment(line, position);
    if (seg) out.push(seg);
  });

  return out;
}

export function isRunSessionPlayable(structure: string[] | undefined): boolean {
  return parseRunStructure(structure).length >= 2;
}
