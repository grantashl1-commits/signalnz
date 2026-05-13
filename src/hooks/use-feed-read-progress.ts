import { useCallback, useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";

const KEY_PREFIX = "signal_feed_read_";
const KEEP_DAYS = 14;

function dayKey(d: Date) {
  return KEY_PREFIX + format(d, "yyyy-MM-dd");
}
function todayKey() {
  return dayKey(new Date());
}

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useFeedReadProgress() {
  const [read, setRead] = useState<Set<string>>(() => readSet(todayKey()));
  const [tick, setTick] = useState(0);

  // Cleanup keys older than KEEP_DAYS
  useEffect(() => {
    const keep = new Set<string>();
    for (let i = 0; i < KEEP_DAYS; i++) keep.add(dayKey(subDays(new Date(), i)));
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(KEY_PREFIX) && !keep.has(k)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }, []);

  const markRead = useCallback((postId: string) => {
    setRead((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      try {
        localStorage.setItem(todayKey(), JSON.stringify([...next]));
      } catch {}
      return next;
    });
    setTick((t) => t + 1);
  }, []);

  // Last-7-days stats: number of posts read, and number of distinct days returned
  const weekStats = useMemo(() => {
    let postsRead = 0;
    const daysReturned = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const k = dayKey(subDays(new Date(), i));
      const s = readSet(k);
      if (s.size > 0) {
        postsRead += s.size;
        daysReturned.add(k);
      }
    }
    return { postsRead, daysReturned: daysReturned.size };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, read]);

  return { readPosts: read, markRead, weekStats };
}
