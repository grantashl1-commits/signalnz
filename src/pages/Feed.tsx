<<<<<<< Updated upstream
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Rss, BookOpen, ChevronDown, History } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import DaySection from "@/components/feed/DaySection";
import FeedTeaserCards from "@/components/feed/FeedTeaserCards";
import type { FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { pickDailyPosts } from "@/lib/feed-utils";

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFeatureAccess } = useFeatureGate();
  const feedAccess = getFeatureAccess("feed_access");
  const canSave = getFeatureAccess("feed_save") === "full";

  const [showHistory, setShowHistory] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("signal_feed_likes");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Fetch ALL posts once (they're small text records)
  const { data: allPosts, isLoading } = useQuery({
    queryKey: ["feed-posts-all"],
    queryFn: async () => {
      const results: FeedPost[] = [];
      let from = 0;
      const pageSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from("feed_posts")
          .select("*")
          .order("post_number")
          .range(from, from + pageSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        results.push(...(data as FeedPost[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return results;
    },
    staleTime: 1000 * 60 * 60 * 4,
    enabled: feedAccess === "full", // Only fetch if user has access
  });

  // Use signup date as feed anchor (deterministic timeline)
  const userCreatedAt = user?.created_at;
  const feedAnchor = useMemo(() => {
    if (!userCreatedAt) return new Date();
    return new Date(userCreatedAt);
  }, [userCreatedAt]);

  // Compute today's feed day number (days since signup)
  const todayDayNum = useMemo(() => {
    return differenceInDays(new Date(), feedAnchor) + 1; // Day 1 = signup day
  }, [feedAnchor]);

  // Generate a date seed based on user's feed day
  const getDaySeed = useCallback((dayOffset: number) => {
    const dayNum = todayDayNum - dayOffset;
    // Use a stable seed: combine user creation date + day number
    const anchorStr = format(feedAnchor, "yyyyMMdd");
    return `${anchorStr}-${dayNum}`;
  }, [todayDayNum, feedAnchor]);

  const todayPosts = allPosts ? pickDailyPosts(allPosts, getDaySeed(0)) : [];

  // Build history sections
  const historySections: { date: Date; posts: FeedPost[]; dayNum: number }[] = [];
  if (showHistory && allPosts) {
    for (let d = 1; d <= historyDays; d++) {
      const pastDate = subDays(new Date(), d);
      const pastPosts = pickDailyPosts(allPosts, getDaySeed(d));
      const dayNum = todayDayNum - d;
      if (pastPosts.length > 0 && dayNum >= 1) {
        historySections.push({ date: pastDate, posts: pastPosts, dayNum });
      }
    }
  }

  const handleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      localStorage.setItem("signal_feed_likes", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleJournal = useCallback((post: FeedPost) => {
    if (!canSave) {
      toast.error("Upgrade to save posts to your Knowledge Hub");
      navigate("/membership");
      return;
    }
    if (!user) {
      toast.error("Sign in to save to your journal");
      return;
    }
    const journalPrompt = {
      id: `knowledge-${post.id}-${Date.now()}`,
      source: "feed",
      post_title: post.book_title_author,
      content: post.post_title_description,
      themes: post.themes,
      created_at: Date.now(),
    };
    
    const existing = JSON.parse(localStorage.getItem("signal_knowledge_hub") || "[]");
    existing.unshift(journalPrompt);
    localStorage.setItem("signal_knowledge_hub", JSON.stringify(existing));
    
    toast.success("Saved to Knowledge Hub", {
      description: "Find it in your Memories tab to reflect on later",
      action: {
        label: "Go to Journal",
        onClick: () => navigate("/journal"),
      },
    });
  }, [user, navigate, canSave]);

  return (
    <div className="pb-28">
      <AtmosphericHero>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rss className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl italic text-foreground">
            Knowledge Incoming
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {feedAccess === "full"
              ? "5 insights a day — sourced from books that matter"
              : "Daily insights sourced from books that matter"}
=======
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar } from "lucide-react";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  post_number: number;
  post_title_description: string;
  book_title_author: string;
  themes: string[];
  been_published: boolean;
  publish_date: string | null;
}

// ─── Mock data (used until real posts are imported) ───────────────────────────

const MOCK_POSTS: FeedPost[] = [
  {
    id: "mock-1",
    post_number: 1,
    post_title_description: `**The Quiet Power of Morning Rituals**

Many high-performing women underestimate the compound effect of small, consistent morning rituals. A five-minute breathing exercise, a glass of water before coffee, or three lines of journaling might seem trivial in isolation — but stacked daily across months, they fundamentally rewire how your nervous system greets the day. The body thrives on predictable cues: cortisol peaks naturally in the first hour of waking, and how you meet that peak shapes your energy, focus, and emotional resilience for everything that follows.

Research consistently shows that women who anchor their mornings with even one intentional practice report higher satisfaction, less reactive stress responses, and greater clarity in decision-making. You don't need a 90-minute routine. You need a ritual that's yours.

**Takeaway:** A five-minute morning ritual, repeated daily, is more powerful than an hour-long routine done sporadically.

*"The secret of your future is hidden in your daily routine."*`,
    book_title_author: "The Miracle Morning — Hal Elrod",
    themes: ["Mindset", "Energy & Vitality", "Stress & Nervous System"],
    been_published: false,
    publish_date: null,
  },
  {
    id: "mock-2",
    post_number: 2,
    post_title_description: `**Why Your Body Keeps the Score**

Unprocessed emotions don't disappear — they live in the body. Tension in the jaw, chronic tightness in the shoulders, a stomach that knots under pressure: these are not random afflictions. They are the body's fluent language for what the mind hasn't finished processing. Understanding this isn't about finding something to fix. It's about learning to listen.

Somatic awareness — the practice of noticing physical sensations without immediately trying to resolve them — is one of the most underrated tools for emotional regulation. Women, in particular, are often conditioned to override body signals in service of productivity or caregiving. Reclaiming that internal dialogue is an act of radical self-knowing. It doesn't require a therapist's couch or a meditation retreat. It starts with one honest question: where in my body do I feel this?

**Takeaway:** The body holds memory and emotion — learning to listen to physical signals is the first step in genuine healing.

*"The body keeps the score — brain, mind, and body in the healing of trauma."*`,
    book_title_author: "The Body Keeps the Score — Bessel van der Kolk",
    themes: ["Mental Health", "Stress & Nervous System", "Mindset"],
    been_published: false,
    publish_date: null,
  },
  {
    id: "mock-3",
    post_number: 3,
    post_title_description: `**Eating With Your Cycle, Not Against It**

Most nutritional advice was designed around male physiology — a roughly 24-hour hormonal cycle. Women operate on a 28-day cycle, which means our nutritional needs, energy levels, and metabolic rates shift meaningfully across four distinct phases. Eating the same foods in the same quantities every day is working against your own biology.

In the follicular phase, lighter, fresher foods support rising estrogen. The luteal phase calls for more complex carbohydrates and magnesium-rich foods to buffer progesterone shifts and reduce PMS symptoms. Iron-rich foods matter most in the menstrual phase to replenish what's lost. These aren't restrictive rules — they're invitations to eat in alignment with what your body actually needs, week by week.

**Takeaway:** Matching your food choices to your hormonal phase isn't a diet — it's a way of working with your body's natural intelligence.

*"Food is information for your hormones — and your hormones are listening."*`,
    book_title_author: "In the Flo — Alisa Vitti",
    themes: ["Hormones & Cycle", "Nutrition", "Energy & Vitality"],
    been_published: false,
    publish_date: null,
  },
  {
    id: "mock-4",
    post_number: 4,
    post_title_description: `**The Myth of the Hustle**

Somewhere along the way, exhaustion became a badge of honour. Busyness was confused with purpose, and rest was reframed as laziness. For many women, this cultural programming runs so deep that slowing down feels genuinely threatening — as though stopping, even briefly, might reveal that the productivity was masking something hollow underneath.

But the research on sustainable performance tells a very different story. Rest is not recovery from work. Rest is part of the work. The brain consolidates learning during sleep. Creativity surfaces in idle moments. Emotional regulation depends on adequate downtime. The women who sustain meaningful impact over decades are not the ones who never stop — they're the ones who've learned the discipline of strategic renewal.

**Takeaway:** Rest is not the opposite of productivity — it is one of its essential conditions.

*"Almost everything will work again if you unplug it for a few minutes — including you."*`,
    book_title_author: "Burnout — Emily & Amelia Nagoski",
    themes: ["Stress & Nervous System", "Sleep & Recovery", "Mindset"],
    been_published: false,
    publish_date: null,
  },
  {
    id: "mock-5",
    post_number: 5,
    post_title_description: `**Strength Is Not Size**

The conversation around strength training for women has, for too long, been filtered through aesthetics. Lift weights to tone. Avoid heavy loads so you don't bulk up. Train for the body you want. But this framing misses the profound, whole-life benefits of building genuine physical strength — benefits that have nothing to do with appearance and everything to do with autonomy, longevity, and confidence.

Strong women are more metabolically resilient, with better insulin sensitivity and bone density that matters deeply in perimenopause and beyond. They move through the world with greater ease and less injury. They report higher self-efficacy — the deeply felt belief that their body is capable and trustworthy. Strength training, done consistently, rewires not just muscle fibres but self-perception.

**Takeaway:** Strength training isn't about how you look — it's about building a body and a confidence that carries you through decades.

*"The strongest thing you can do is show up, consistently, for yourself."*`,
    book_title_author: "Strong Women Stay Young — Miriam Nelson",
    themes: ["Strength & Fitness", "Hormones & Cycle", "Mindset"],
    been_published: false,
    publish_date: null,
  },
];

// ─── Theme colour mapping ──────────────────────────────────────────────────────

const THEME_COLOURS: Record<string, string> = {
  "Mindset": "bg-purple-100 text-purple-800",
  "Stress & Nervous System": "bg-blue-100 text-blue-800",
  "Sleep & Recovery": "bg-indigo-100 text-indigo-800",
  "Hormones & Cycle": "bg-pink-100 text-pink-800",
  "Nutrition": "bg-green-100 text-green-800",
  "Energy & Vitality": "bg-yellow-100 text-yellow-800",
  "Strength & Fitness": "bg-orange-100 text-orange-800",
  "Mental Health": "bg-teal-100 text-teal-800",
  "Relationships": "bg-rose-100 text-rose-800",
  "Purpose & Identity": "bg-violet-100 text-violet-800",
  "Creativity": "bg-amber-100 text-amber-800",
  "Movement & Yoga": "bg-lime-100 text-lime-800",
  "Spirituality": "bg-sky-100 text-sky-800",
  "Finance & Abundance": "bg-emerald-100 text-emerald-800",
  "Leadership": "bg-slate-100 text-slate-800",
  "Gut Health": "bg-stone-100 text-stone-800",
  "Immune & Longevity": "bg-cyan-100 text-cyan-800",
  "Boundaries & Saying No": "bg-red-100 text-red-800",
  "Parenting & Family": "bg-fuchsia-100 text-fuchsia-800",
  "Self-Compassion": "bg-pink-50 text-pink-700",
};

const themeColour = (theme: string) =>
  THEME_COLOURS[theme] ?? "bg-secondary text-secondary-foreground";

// ─── Markdown-lite renderer ────────────────────────────────────────────────────
// Handles **bold**, *italic*, and newlines only — no library needed.

function renderPostBody(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    // Split on **bold** and *italic* patterns
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      const raw = match[0];
      if (raw.startsWith("**")) {
        parts.push(<strong key={match.index}>{raw.slice(2, -2)}</strong>);
      } else {
        parts.push(<em key={match.index}>{raw.slice(1, -1)}</em>);
      }
      last = match.index + raw.length;
    }
    if (last < line.length) parts.push(line.slice(last));

    return <p key={i} className="mb-2 leading-relaxed">{parts}</p>;
  });
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

export async function getFeedForDate(date: Date): Promise<FeedPost[]> {
  const dateStr = date.toISOString().split("T")[0];

  try {
    const { data, error } = await supabase
      .from("feed_posts" as any)
      .select("*")
      .eq("publish_date", dateStr)
      .order("post_number", { ascending: true })
      .limit(5);

    if (error || !data || data.length === 0) {
      // Fall back to post_number ordering if dates aren't set yet
      const { data: fallback } = await supabase
        .from("feed_posts" as any)
        .select("*")
        .order("post_number", { ascending: true })
        .limit(5);
      return (fallback as FeedPost[]) ?? MOCK_POSTS;
    }

    return data as FeedPost[];
  } catch {
    return MOCK_POSTS;
  }
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: FeedPost; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Card header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-body text-xs">{post.book_title_author}</span>
          </div>
          <span className="font-body text-[11px] text-muted-foreground/60">#{post.post_number}</span>
        </div>
        {/* Themes */}
        {post.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.themes.map((theme) => (
              <span
                key={theme}
                className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${themeColour(theme)}`}
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        <div
          className={`font-body text-sm text-foreground overflow-hidden transition-all duration-300 ${
            expanded ? "" : "max-h-[160px] relative"
          }`}
        >
          {renderPostBody(post.post_title_description)}
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 font-display text-xs italic text-primary hover:underline transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>
    </motion.article>
  );
}

// ─── Day section ──────────────────────────────────────────────────────────────

function DaySection({
  label,
  posts,
  isToday,
}: {
  label: string;
  posts: FeedPost[];
  isToday: boolean;
}) {
  return (
    <section className="mb-8">
      <div className={`flex items-center gap-2 mb-4 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
        <Calendar className="h-3.5 w-3.5" />
        <span className={`font-display text-xs tracking-widest uppercase ${isToday ? "font-semibold" : ""}`}>
          {label}
        </span>
        {isToday && (
          <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Today
          </span>
        )}
      </div>
      <div className="space-y-4">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Feed page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [todayPosts, setTodayPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  useEffect(() => {
    getFeedForDate(today).then((posts) => {
      setTodayPosts(posts.length > 0 ? posts : MOCK_POSTS);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="relative">
      {/* Hero */}
      <AtmosphericHero size="sm">
        <div className="text-center relative z-10">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-3">
            Signal NZ
          </p>
          <h1 className="font-display text-[2.5rem] font-extrabold text-primary-foreground leading-tight mb-2">
            The Feed
          </h1>
          <p className="font-editorial text-sm italic text-primary-foreground/60">
            5 insights a day, from 175 books
>>>>>>> Stashed changes
          </p>
        </div>
      </AtmosphericHero>

<<<<<<< Updated upstream
      <ContentSection>
        <div className="max-w-lg mx-auto space-y-6">
          {/* Teaser for non-subscribers */}
          {feedAccess !== "full" ? (
            <FeedTeaserCards />
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-5 space-y-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Today's posts */}
              <DaySection
                date={new Date()}
                posts={todayPosts}
                onLike={handleLike}
                onJournal={handleJournal}
                likedPosts={likedPosts}
              />

              {/* Expand to see history */}
              {!showHistory ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowHistory(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all font-body text-sm"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <History className="h-4 w-4" />
                  <span>View past insights</span>
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              ) : (
                <>
                  {historySections.map((section) => (
                    <DaySection
                      key={format(section.date, "yyyy-MM-dd")}
                      date={section.date}
                      posts={section.posts}
                      onLike={handleLike}
                      onJournal={handleJournal}
                      likedPosts={likedPosts}
                    />
                  ))}

                  {/* Load more */}
                  {todayDayNum > historyDays && (
                    <button
                      onClick={() => setHistoryDays((d) => d + 7)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-muted-foreground hover:text-foreground font-body text-xs transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>Load more days</span>
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* Footer note */}
          <div className="text-center py-6 space-y-2">
            <BookOpen className="h-5 w-5 text-muted-foreground/30 mx-auto" />
            <p className="font-body text-xs text-muted-foreground/50">
              New insights every day at midnight
            </p>
          </div>
        </div>
=======
      {/* Content */}
      <ContentSection>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <DaySection
              label={formatDate(today)}
              posts={todayPosts}
              isToday={true}
            />

            {/* Placeholder for past days — will be wired when posts have publish_date */}
            <div className="text-center py-6 text-muted-foreground">
              <p className="font-editorial text-sm italic">
                Past insights will appear here once posts go live.
              </p>
            </div>
          </>
        )}
>>>>>>> Stashed changes
      </ContentSection>
    </div>
  );
}
