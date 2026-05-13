import { format } from "date-fns";
import { motion } from "framer-motion";
import PostCard, { type FeedPost } from "./PostCard";

interface DaySectionProps {
  date: Date;
  posts: FeedPost[];
  onLike?: (postId: string) => void;
  onJournal?: (post: FeedPost) => void;
  onRead?: (postId: string) => void;
  likedPosts?: Set<string>;
  readPosts?: Set<string>;
  heldPosts?: Set<string>;
}

export default function DaySection({
  date,
  posts,
  onLike,
  onJournal,
  onRead,
  likedPosts = new Set(),
  readPosts = new Set(),
  heldPosts = new Set(),
}: DaySectionProps) {
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const label = isToday ? "Today" : format(date, "EEEE d MMMM");

  const readCount = posts.filter((p) => readPosts.has(p.id)).length;
  const total = posts.length;
  const pct = total ? Math.round((readCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 border-b border-dotted border-foreground/10" />
        <span className="font-hand text-sm text-muted-foreground/60">
          {isToday ? `Today — ${format(date, "EEEE d MMMM")}` : label}
        </span>
        <div className="h-px flex-1 border-b border-dotted border-foreground/10" />
      </div>

      {isToday && total > 0 && (
        <div className="px-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-hand text-xs text-muted-foreground/70">
              {readCount === 0
                ? "A fresh page"
                : readCount === total
                ? "All taken in"
                : `${readCount} of ${total} taken in`}
            </span>
            <span className="font-body text-[10px] text-muted-foreground/50 tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-[3px] w-full rounded-full bg-foreground/5 overflow-hidden">
            <motion.div
              className="h-full bg-primary/60 rounded-full"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onJournal={onJournal}
            onRead={onRead}
            isLiked={likedPosts.has(post.id)}
            isRead={readPosts.has(post.id)}
            isHeld={heldPosts.has(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
