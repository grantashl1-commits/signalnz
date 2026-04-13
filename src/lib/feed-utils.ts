export interface FeedPostSource {
  book_title_author: string;
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
): T[] {
  const seedNum = hashSeed(dateSeed);
  const shuffled = seededShuffle(allPosts, seedNum);
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
