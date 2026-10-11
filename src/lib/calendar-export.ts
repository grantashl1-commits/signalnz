type CalendarEvent = { id: string; title: string; start: Date; end: Date };
function escapeText(value: string) { return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); }
function stamp(date: Date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function fold(line: string) {
 const result: string[] = []; let current = ''; let bytes = 0;
 for (const char of line) { const length = new TextEncoder().encode(char).length; if (bytes + length > 75) { result.push(current); current = ' '; bytes = 1; } current += char; bytes += length; }
 result.push(current); return result.join('\r\n');
}
export function exportCalendar(events: CalendarEvent[], now = new Date()) {
 const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Signal//Calendar//EN'];
 for (const event of events) {
  if (!Number.isFinite(event.start.getTime()) || !Number.isFinite(event.end.getTime())) continue;
  lines.push('BEGIN:VEVENT', `UID:${encodeURIComponent(event.id)}@signal`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(event.start)}`, `DTEND:${stamp(event.end)}`, `SUMMARY:${escapeText(event.title)}`, 'END:VEVENT');
 }
 lines.push('END:VCALENDAR'); return lines.map(fold).join('\r\n') + '\r\n';
}
