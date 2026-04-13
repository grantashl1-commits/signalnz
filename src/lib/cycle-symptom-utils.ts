/**
 * Structured symptom tracking with severity ratings (0–3).
 * Stored in localStorage to match existing cycle-utils pattern.
 */

export interface SymptomEntry {
  name: string;
  severity: number; // 0=none, 1=mild, 2=moderate, 3=severe
}

export interface StructuredCheckin {
  symptoms: SymptomEntry[];
  mood?: number;          // 0=low, 1=below avg, 2=stable, 3=elevated
  sleepQuality?: number;  // 1–5
  nightWaking?: boolean;
  sleepHours?: string;
  bedtime?: string;       // HH:mm
  wakeTime?: string;      // HH:mm
  bbt?: string;
  notes?: string;
}

const KEY_PREFIX = "structuredCheckin:";

export function getStructuredSymptoms(date: string): StructuredCheckin | null {
  const val = localStorage.getItem(`${KEY_PREFIX}${date}`);
  return val ? JSON.parse(val) : null;
}

export function setStructuredSymptoms(date: string, data: StructuredCheckin): void {
  localStorage.setItem(`${KEY_PREFIX}${date}`, JSON.stringify(data));
  // Also write to legacy format for backward compat with calendar indicators
  const legacySymptoms = data.symptoms.map((s) => s.name);
  localStorage.setItem(`symptoms:${date}`, JSON.stringify(legacySymptoms));
}

export function getRecentStructuredCheckins(days: number = 7): { date: string; data: StructuredCheckin }[] {
  const results: { date: string; data: StructuredCheckin }[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const data = getStructuredSymptoms(dateStr);
    if (data) results.push({ date: dateStr, data });
  }
  return results;
}

/**
 * Aggregate symptom frequency with severity across a date range.
 */
export function getSymptomSeverityAggregates(
  startDate: string,
  endDate: string
): Record<string, { count: number; avgSeverity: number }> {
  const result: Record<string, { count: number; totalSev: number }> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const checkin = getStructuredSymptoms(dateStr);
    if (!checkin) continue;

    for (const s of checkin.symptoms) {
      if (!result[s.name]) result[s.name] = { count: 0, totalSev: 0 };
      result[s.name].count++;
      result[s.name].totalSev += s.severity;
    }
  }

  const final: Record<string, { count: number; avgSeverity: number }> = {};
  for (const [name, { count, totalSev }] of Object.entries(result)) {
    final[name] = { count, avgSeverity: totalSev / count };
  }
  return final;
}
