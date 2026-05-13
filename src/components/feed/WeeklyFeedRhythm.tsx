import { motion } from "framer-motion";
import type { FeedPost } from "@/components/feed/PostCard";

interface Props {
  postsRead: number;
  daysReturned: number;
  heldCount: number;
  topThemes: string[];
  onThemeClick?: (theme: string) => void;
  activeTheme?: string | null;
}

/** Weekly rhythm strip — top of Feed. Soft acknowledgment of return + held. */
export default function WeeklyFeedRhythm({
  postsRead,
  daysReturned,
  heldCount,
  topThemes,
  onThemeClick,
  activeTheme,
}: Props) {
  const summary =
    daysReturned === 0
      ? "A blank page is a beginning."
      : `You returned ${daysReturned} ${daysReturned === 1 ? "day" : "days"} · read ${postsRead}${heldCount ? ` · held ${heldCount}` : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-secondary/40 border border-border/30 px-4 py-3 space-y-2"
    >
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        This week
      </p>
      <p className="font-display italic text-sm text-foreground leading-snug">
        {summary}
      </p>
      {topThemes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {topThemes.slice(0, 4).map((t) => (
            <button
              key={t}
              onClick={() => onThemeClick?.(t)}
              className={`px-2.5 py-1 rounded-full font-body text-[11px] border transition-colors ${
                activeTheme === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/40 hover:text-foreground"
              }`}
            >
              {activeTheme === t ? `× ${t}` : t}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function pickTopThemes(posts: FeedPost[]): string[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.themes || []) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}
