export interface FeedPostSource {
  book_title_author: string;
  themes?: string[];
}

export const DEFAULT_DAILY_FEED_COUNT = 5;

function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;

  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function pickDailyPosts<T extends FeedPostSource>(
  allPosts: T[],
  dateSeed: string,
  targetCount = DEFAULT_DAILY_FEED_COUNT,
  excludeIds?: Set<string>,
  themeWeights?: Record<string, number>,
): T[] {
  const seedNum = hashSeed(dateSeed);
  let shuffled = seededShuffle(allPosts, seedNum);

  // Apply user theme weights as a stable score boost — keeps determinism per day
  // by sorting only ties broken by weight, leaving the seeded order intact otherwise.
  if (themeWeights && Object.keys(themeWeights).length > 0) {
    shuffled = shuffled
      .map((p, idx) => {
        const themes = (p as any).themes as string[] | undefined;
        let score = 0;
        if (themes) for (const t of themes) score += themeWeights[t] || 0;
        return { p, idx, score };
      })
      // Higher score first; original seeded index breaks ties to preserve daily stability
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .map((x) => x.p);
  }

  const picked: T[] = [];
  const usedBooks = new Set<string>();

  for (const post of shuffled) {
    if (picked.length >= targetCount) break;

    if (excludeIds && excludeIds.has((post as any).id)) continue;

    const bookKey = post.book_title_author.toLowerCase().trim();
    if (usedBooks.has(bookKey)) continue;

    usedBooks.add(bookKey);
    picked.push(post);
  }

  return picked;
}
