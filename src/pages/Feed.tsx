import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Rss, BookOpen, ChevronDown, History } from "lucide-react";
import { format, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import DaySection from "@/components/feed/DaySection";
import PostCard, { type FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/**
 * Deterministic seeded shuffle — same seed always produces the same order.
 * Uses a simple LCG (Linear Congruential Generator).
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick 10 posts for a given date-seed, no duplicate books */
function pickDailyPosts(allPosts: FeedPost[], dateSeed: string): FeedPost[] {
  const seedNum = parseInt(dateSeed.replace(/-/g, ""), 10);
  const shuffled = seededShuffle(allPosts, seedNum);

  const picked: FeedPost[] = [];
  const usedBooks = new Set<string>();

  for (const p of shuffled) {
    if (picked.length >= 10) break;
    const bookKey = p.book_title_author.toLowerCase().trim();
    if (!usedBooks.has(bookKey)) {
      usedBooks.add(bookKey);
      picked.push(p);
    }
  }
  return picked;
}

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [historyDays, setHistoryDays] = useState(7); // load 7 more days at a time

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
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });

  // Compute today's 5 + history
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayPosts = allPosts ? pickDailyPosts(allPosts, todayStr) : [];

  // Build history sections (past days)
  const historySections: { date: Date; posts: FeedPost[] }[] = [];
  if (showHistory && allPosts) {
    for (let d = 1; d <= historyDays; d++) {
      const pastDate = subDays(new Date(), d);
      const pastStr = format(pastDate, "yyyy-MM-dd");
      const pastPosts = pickDailyPosts(allPosts, pastStr);
      if (pastPosts.length > 0) {
        historySections.push({ date: pastDate, posts: pastPosts });
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
  }, [user, navigate]);

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
            10 insights a day — sourced from books that matter
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection>
        <div className="max-w-lg mx-auto space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
                  <button
                    onClick={() => setHistoryDays((d) => d + 7)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-muted-foreground hover:text-foreground font-body text-xs transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Load more days</span>
                  </button>
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
      </ContentSection>
    </div>
  );
}
