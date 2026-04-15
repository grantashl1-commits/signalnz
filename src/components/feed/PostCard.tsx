import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { haptic } from "@/hooks/use-mobile";

const THEME_COLORS: Record<string, string> = {
  "Hormones": "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]",
  "Women's Health": "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]",
  "Menopause": "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]",
  "Fertility": "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]",
  "Nutrition": "bg-[hsl(145,40%,45%)]/15 text-[hsl(145,40%,30%)]",
  "Gut Health": "bg-[hsl(145,40%,45%)]/15 text-[hsl(145,40%,30%)]",
  "Mindfulness": "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]",
  "Sleep": "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]",
  "Mental Health": "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]",
  "Anxiety": "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]",
  "Exercise": "bg-[hsl(25,70%,50%)]/15 text-[hsl(25,70%,35%)]",
  "Fitness": "bg-[hsl(25,70%,50%)]/15 text-[hsl(25,70%,35%)]",
  "Spirituality": "bg-[hsl(270,40%,55%)]/15 text-[hsl(270,40%,40%)]",
  "Self-Care": "bg-[hsl(270,40%,55%)]/15 text-[hsl(270,40%,40%)]",
  "Habits": "bg-[hsl(50,60%,45%)]/15 text-[hsl(50,60%,30%)]",
  "Productivity": "bg-[hsl(50,60%,45%)]/15 text-[hsl(50,60%,30%)]",
  "Relationships": "bg-[hsl(0,50%,55%)]/15 text-[hsl(0,50%,40%)]",
  "Leadership": "bg-[hsl(0,50%,55%)]/15 text-[hsl(0,50%,40%)]",
  "Career": "bg-[hsl(180,40%,45%)]/15 text-[hsl(180,40%,30%)]",
  "Finance": "bg-[hsl(180,40%,45%)]/15 text-[hsl(180,40%,30%)]",
  "Parenting": "bg-[hsl(30,50%,50%)]/15 text-[hsl(30,50%,35%)]",
};

function getThemeClass(theme: string): string {
  return THEME_COLORS[theme] || "bg-muted/50 text-muted-foreground";
}

/** Simple markdown-lite renderer: **bold**, *italic* */
function renderMarkdownLite(text: string) {
  const parts: (string | JSX.Element)[] = [];
  // Split by lines first for paragraph handling
  const lines = text.split("\n");
  
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />);
    
    // Process bold and italic
    const regex = /(\*\*(.+?)\*\*|\*"?(.+?)"?\*)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[2]) {
        // Bold
        parts.push(<strong key={`b-${lineIdx}-${match.index}`} className="font-semibold text-foreground">{match[2]}</strong>);
      } else if (match[3]) {
        // Italic (possibly a quote)
        parts.push(<em key={`i-${lineIdx}-${match.index}`} className="text-muted-foreground italic">{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
  });
  
  return parts;
}

export interface FeedPost {
  id: string;
  post_number: number;
  post_title_description: string;
  book_title_author: string;
  themes: string[];
  been_published: boolean;
  publish_date: string | null;
}

interface PostCardProps {
  post: FeedPost;
  onLike?: (postId: string) => void;
  onJournal?: (post: FeedPost) => void;
  isLiked?: boolean;
}

export default function PostCard({ post, onLike, onJournal, isLiked = false }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  
  const shouldTruncate = post.post_title_description.length > 300;
  const displayText = expanded || !shouldTruncate
    ? post.post_title_description
    : post.post_title_description.slice(0, 300) + "...";

  const handleLike = () => {
    setLiked(!liked);
    haptic("light");
    onLike?.(post.id);
  };

  const handleJournal = () => {
    haptic("medium");
    onJournal?.(post);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-card text-card-foreground border-0 overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-soft)" }}
    >
      {/* Journal-style ruled lines background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, hsl(var(--foreground)) 28px)`,
      }} />

      <div className="relative p-5 space-y-3">
        {/* Book source — hand-drawn style */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-hand text-[11px] tracking-wide uppercase leading-snug">
            {post.book_title_author}
          </span>
        </div>

        {/* Theme badges */}
        {post.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.themes.map((theme) => (
              <span
                key={theme}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${getThemeClass(theme)}`}
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Post body — keep readable with body font */}
        <div className="font-body text-sm leading-relaxed text-foreground/90">
          {renderMarkdownLite(displayText)}
        </div>

        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-hand text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Actions — dotted divider */}
        <div className="border-t border-dotted border-foreground/10" />
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[40px] ${
              liked
                ? "text-[hsl(340,60%,50%)] bg-[hsl(340,60%,50%)]/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? "Resonated" : "This resonated"}</span>
          </button>
          
          <button
            onClick={handleJournal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all min-h-[40px] ml-auto"
          >
            <PenLine className="h-4 w-4" />
            <span>Reflect on this</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
