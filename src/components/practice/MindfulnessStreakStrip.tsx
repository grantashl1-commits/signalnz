/**
 * MindfulnessStreakStrip — "N days you've returned" header for mindfulness practice.
 * Counts days a mindfulness session was opened (touch-tracked in localStorage).
 */
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const KEY_PREFIX = "signal_mindfulness_touch_";

function todayKey() {
  return KEY_PREFIX + new Date().toISOString().split("T")[0];
}

function countStreak(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (localStorage.getItem(KEY_PREFIX + ds)) count++;
    else if (i > 0) break;
  }
  return count;
}

export function markMindfulnessTouch() {
  try { localStorage.setItem(todayKey(), "1"); } catch {}
}

export default function MindfulnessStreakStrip() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    markMindfulnessTouch();
    setStreak(countStreak());
  }, []);

  if (streak < 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mb-3">
      <Flame className="h-3.5 w-3.5 text-primary/70" />
      <span className="font-hand text-[12px] text-foreground">
        {streak} {streak === 1 ? "day" : "days"} you've returned
      </span>
    </div>
  );
}
