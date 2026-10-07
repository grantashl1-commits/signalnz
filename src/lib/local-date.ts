/**
 * Calendar-day keys in the member's own timezone.
 *
 * `date.toISOString().split("T")[0]` returns the UTC date — in New Zealand
 * (UTC+12/13) that is *yesterday* until midday, so habits, journal entries and
 * cycle days were landing on the wrong day. Use this everywhere a YYYY-MM-DD
 * "day" key is needed.
 */
export function toLocalDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
