/**
 * NourishStreakBadge — counts consecutive days the user opened/used nutrition tracking.
 * Lightweight: marks today via mount, reads back streak from a daily-touched key.
 */
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

const KEY_PREFIX = "signal_nourish_touch_";

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

export default function NourishStreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(todayKey(), "1"); } catch {}
    setStreak(countStreak());
  }, []);

  if (streak < 1) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
      <Sprout className="h-3.5 w-3.5 text-primary/70" />
      <span className="font-hand text-[12px] text-foreground">
        {streak} {streak === 1 ? "day" : "days"} you've nourished
      </span>
    </div>
  );
}
