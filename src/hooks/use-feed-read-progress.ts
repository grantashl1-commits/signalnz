import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";

const KEY_PREFIX = "signal_feed_read_";

function todayKey() {
  return KEY_PREFIX + format(new Date(), "yyyy-MM-dd");
}

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useFeedReadProgress() {
  const [read, setRead] = useState<Set<string>>(() => readSet());

  // Cleanup older day keys (keep only today)
  useEffect(() => {
    const keep = todayKey();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(KEY_PREFIX) && k !== keep) {
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
  }, []);

  return { readPosts: read, markRead };
}
