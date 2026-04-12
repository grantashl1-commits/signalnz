const STORAGE_KEY = "signal-wisdom-draws";

interface DrawRecord {
  cardId: string;
  drawnAt: number; // timestamp
}

export function getDrawnCards(): DrawRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DrawRecord[];
  } catch {
    return [];
  }
}

export function recordDraw(cardId: string) {
  const records = getDrawnCards();
  records.push({ cardId, drawnAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getAvailableCardIds(allIds: string[]): string[] {
  const records = getDrawnCards();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const recentlyDrawn = new Set(
    records
      .filter(r => now - r.drawnAt < fourteenDaysMs)
      .map(r => r.cardId)
  );

  const available = allIds.filter(id => !recentlyDrawn.has(id));
  // If all cards are on cooldown, reset and return all
  return available.length > 0 ? available : allIds;
}

export function getLastDrawDate(): Date | null {
  const records = getDrawnCards();
  if (records.length === 0) return null;
  const last = records.reduce((a, b) => (a.drawnAt > b.drawnAt ? a : b));
  return new Date(last.drawnAt);
}

export function canDrawToday(): boolean {
  const last = getLastDrawDate();
  if (!last) return true;
  const now = new Date();
  return (
    now.getFullYear() !== last.getFullYear() ||
    now.getMonth() !== last.getMonth() ||
    now.getDate() !== last.getDate()
  );
}
