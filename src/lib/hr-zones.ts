/**
 * Lightweight HR-zone summarisation for completed sessions.
 * Zones use the classic %-of-max model. If we don't know the user's age,
 * we assume HRmax = 190 (close to a 30y/o female estimate of 220 - 30).
 */
export interface HRSample { t: number; bpm: number }

export interface HRZoneSummary {
  totalSeconds: number;
  avgBpm: number;
  maxBpm: number;
  hrMax: number;
  zones: { name: string; range: [number, number]; seconds: number; pct: number }[];
}

const ZONES: { name: string; lo: number; hi: number }[] = [
  { name: "Recovery", lo: 0,    hi: 0.60 },
  { name: "Easy",     lo: 0.60, hi: 0.70 },
  { name: "Aerobic",  lo: 0.70, hi: 0.80 },
  { name: "Threshold",lo: 0.80, hi: 0.90 },
  { name: "Peak",     lo: 0.90, hi: 1.10 },
];

export function summariseSamples(samples: HRSample[], hrMax = 190): HRZoneSummary | null {
  if (!samples || samples.length < 2) return null;
  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const zoneSecs = ZONES.map(() => 0);
  let sumBpm = 0;
  let max = 0;

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    const dt = next ? Math.min((next.t - cur.t) / 1000, 30) : 1;
    const pct = cur.bpm / hrMax;
    const z = ZONES.findIndex(zn => pct >= zn.lo && pct < zn.hi);
    if (z >= 0) zoneSecs[z] += dt;
    sumBpm += cur.bpm;
    if (cur.bpm > max) max = cur.bpm;
  }
  const total = zoneSecs.reduce((a, b) => a + b, 0);
  return {
    totalSeconds: Math.round(total),
    avgBpm: Math.round(sumBpm / sorted.length),
    maxBpm: max,
    hrMax,
    zones: ZONES.map((zn, i) => ({
      name: zn.name,
      range: [Math.round(zn.lo * hrMax), Math.round(zn.hi * hrMax)],
      seconds: Math.round(zoneSecs[i]),
      pct: total > 0 ? Math.round((zoneSecs[i] / total) * 100) : 0,
    })),
  };
}

export function fmtMinSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
