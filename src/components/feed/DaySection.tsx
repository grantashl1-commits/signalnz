import { format } from "date-fns";
import PostCard, { type FeedPost } from "./PostCard";

interface DaySectionProps {
  date: Date;
  posts: FeedPost[];
  onLike?: (postId: string) => void;
  onJournal?: (post: FeedPost) => void;
  likedPosts?: Set<string>;
}

export default function DaySection({ date, posts, onLike, onJournal, likedPosts = new Set() }: DaySectionProps) {
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const label = isToday ? "Today" : format(date, "EEEE d MMMM");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 border-b border-dotted border-foreground/10" />
        <span className="font-hand text-sm text-muted-foreground/60">
          {isToday ? `Today — ${format(date, "EEEE d MMMM")}` : label}
        </span>
        <div className="h-px flex-1 border-b border-dotted border-foreground/10" />
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            onJournal={onJournal}
            isLiked={likedPosts.has(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
