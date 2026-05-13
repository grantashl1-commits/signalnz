import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Bookmark, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { haptic } from "@/hooks/use-mobile";

function formatTag(tag: string): string {
  return tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getThemeClass(tag: string): string {
  const t = tag.toLowerCase();
  if (/hormone|menstrual|fertility|menopause|reproductive|ovulat|period|uterus|ivf|egg-retrieval/.test(t))
    return "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]";
  if (/women|female|feminist|sacred-feminin/.test(t))
    return "bg-[hsl(340,50%,55%)]/15 text-[hsl(340,50%,40%)]";
  if (/nutrition|diet|food|eating|gut|digestive|microbiome|protein|omega|plant-based|nourish|spices/.test(t))
    return "bg-[hsl(145,40%,45%)]/15 text-[hsl(145,40%,30%)]";
  if (/health|holistic|wellness|well-being|wellbeing|immune|chronic|disease|medical|healing|recovery|longevity/.test(t))
    return "bg-[hsl(145,40%,45%)]/15 text-[hsl(145,40%,30%)]";
  if (/sleep|insomnia|circadian|restorative/.test(t))
    return "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]";
  if (/mental|anxiety|depression|stress|emotion|mood|psycho|trauma|grief|shame|fear|burnout|addiction/.test(t))
    return "bg-[hsl(210,50%,50%)]/15 text-[hsl(210,50%,35%)]";
  if (/exercise|fitness|workout|strength|movement|cardio|sport|endurance|yoga|breath/.test(t))
    return "bg-[hsl(25,70%,50%)]/15 text-[hsl(25,70%,35%)]";
  if (/mindful|meditation|spiritual|conscious|present|soul|sacred|awakening|purpose|meaning/.test(t))
    return "bg-[hsl(270,40%,55%)]/15 text-[hsl(270,40%,40%)]";
  if (/self-care|self-love|self-compassion|self-worth|self-esteem|inner-peace|solitude/.test(t))
    return "bg-[hsl(270,40%,55%)]/15 text-[hsl(270,40%,40%)]";
  if (/habit|productiv|focus|routine|system|efficien|priorit|goal|discipline|motivation/.test(t))
    return "bg-[hsl(50,60%,45%)]/15 text-[hsl(50,60%,30%)]";
  if (/relationship|love|partner|intimacy|marriage|dating|attachment|connection|heartbreak/.test(t))
    return "bg-[hsl(0,50%,55%)]/15 text-[hsl(0,50%,40%)]";
  if (/family|parenting|child|parent|sibling|co-parent/.test(t))
    return "bg-[hsl(30,50%,50%)]/15 text-[hsl(30,50%,35%)]";
  if (/finance|money|wealth|invest|budget|financial|income|debt|saving/.test(t))
    return "bg-[hsl(180,40%,45%)]/15 text-[hsl(180,40%,30%)]";
  if (/career|leadership|work|business|management|professional|entrepreneur/.test(t))
    return "bg-[hsl(180,40%,45%)]/15 text-[hsl(180,40%,30%)]";
  return "bg-muted/50 text-muted-foreground";
}

interface ParsedPost {
  title: string | null;
  body: string;
  takeaway: string | null;
  quote: string | null;
}

function parsePostContent(text: string): ParsedPost {
  // Extract bold title on its own first line
  const titleMatch = text.match(/^\*\*(.+?)\*\*/);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const afterTitle = titleMatch ? text.slice(titleMatch[0].length).replace(/^\n+/, "") : text;

  // Extract **Takeaway:** section
  const takeawayMatch = afterTitle.match(/\*\*Takeaway:\*\*\s*(.+?)(?=\n\n\*"|^\*"|$)/s);
  const takeaway = takeawayMatch ? takeawayMatch[1].replace(/\n/g, " ").trim() : null;

  // Extract *"quote"* — allow optional attribution after the closing quote
  const quoteMatch = afterTitle.match(/\*"(.+?)"\*/s);
  const quote = quoteMatch ? quoteMatch[1].trim() : null;

  // Body: everything between title and takeaway (or end)
  let body = afterTitle;
  if (takeawayMatch && takeawayMatch.index !== undefined) {
    body = afterTitle.slice(0, takeawayMatch.index).trim();
  } else if (quoteMatch && quoteMatch.index !== undefined) {
    body = afterTitle.slice(0, quoteMatch.index).trim();
  }

  return { title, body: body.trim(), takeaway, quote };
}

function renderBody(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const lines = text.split("\n");
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />);
    const regex = /(\*\*(.+?)\*\*|\*"?(.+?)"?\*)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      if (match[2]) {
        parts.push(<strong key={`b-${lineIdx}-${match.index}`} className="font-semibold text-foreground">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={`i-${lineIdx}-${match.index}`} className="text-muted-foreground italic">{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
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
  onRead?: (postId: string) => void;
  isLiked?: boolean;
  isRead?: boolean;
  isHeld?: boolean;
}

export default function PostCard({ post, onLike, onJournal, onRead, isLiked = false, isRead = false, isHeld = false }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [held, setHeld] = useState(isHeld);
  const cardRef = useRef<HTMLDivElement>(null);

  const parsed = parsePostContent(post.post_title_description);

  // Mark as read once it's been visible long enough
  useEffect(() => {
    if (isRead || !onRead || !cardRef.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.6) {
            if (!timer) timer = setTimeout(() => onRead(post.id), 1200);
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(cardRef.current);
    return () => {
      obs.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [isRead, onRead, post.id]);

  // Truncate body only
  const BODY_LIMIT = 280;
  const shouldTruncate = parsed.body.length > BODY_LIMIT;
  const displayBody = expanded || !shouldTruncate
    ? parsed.body
    : parsed.body.slice(0, BODY_LIMIT) + "...";

  const handleLike = () => {
    setLiked(!liked);
    haptic("light");
    onLike?.(post.id);
  };

  const handleJournal = () => {
    haptic("medium");
    setHeld(true);
    onJournal?.(post);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-card text-card-foreground border-0 overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-soft)" }}
    >
      {/* Read indicator — soft accent bar on the left edge */}
      {isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/30" aria-hidden />
      )}
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
                {formatTag(theme)}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {parsed.title && (
          <h3 className="font-body text-base font-semibold text-foreground leading-snug">
            {parsed.title}
          </h3>
        )}

        {/* Body paragraph */}
        <div className="font-body text-sm leading-relaxed text-foreground/85">
          {renderBody(displayBody)}
        </div>

        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-hand text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Takeaway */}
        {parsed.takeaway && (
          <p className="font-body text-xs text-muted-foreground border-l-2 border-primary/25 pl-3 leading-relaxed">
            <span className="font-semibold text-primary/90">Takeaway: </span>
            {parsed.takeaway}
          </p>
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
            disabled={held}
            className={`ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px] shadow-sm ${
              held
                ? "bg-primary/15 text-primary"
                : "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98]"
            }`}
          >
            {held ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span>{held ? "Held" : "Hold this"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
