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
import SignalPulse from "@/components/SignalPulse";
import DaySection from "@/components/feed/DaySection";
import FeedTeaserCards from "@/components/feed/FeedTeaserCards";
import type { FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useFeedReadProgress } from "@/hooks/use-feed-read-progress";

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

  const { readPosts, markRead } = useFeedReadProgress();

  const [heldVersion, setHeldVersion] = useState(0);
  const heldPosts = useMemo(() => {
    try {
      const raw = localStorage.getItem("signal_knowledge_hub");
      const list = raw ? JSON.parse(raw) : [];
      const ids = new Set<string>();
      for (const e of list) {
        const m = typeof e?.id === "string" ? e.id.match(/^knowledge-(.+?)-\d+$/) : null;
        if (m) ids.add(m[1]);
      }
      return ids;
    } catch { return new Set<string>(); }
  }, [heldVersion]);



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

  // Build history sections, excluding already-shown posts
  const historySections: { date: Date; posts: FeedPost[]; dayNum: number }[] = [];
  if (showHistory && allPosts) {
    const shownIds = new Set(todayPosts.map(p => p.id));
    for (let d = 1; d <= historyDays; d++) {
      const pastDate = subDays(new Date(), d);
      const pastPosts = pickDailyPosts(allPosts, getDaySeed(d), 5, shownIds);
      const dayNum = todayDayNum - d;
      if (pastPosts.length > 0 && dayNum >= 1) {
        historySections.push({ date: pastDate, posts: pastPosts, dayNum });
        pastPosts.forEach(p => shownIds.add(p.id));
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
      toast.error("This one's for members — come closer when you're ready.");
      navigate("/membership");
      return;
    }
    if (!user) {
      toast.error("Come in first — then we can hold this for you.");
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
    setHeldVersion((v) => v + 1);
    
    toast.success("Held.", {
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
        <SignalPulse />
        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rss className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl italic text-foreground">
            Feed Your Mind
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {feedAccess === "full"
              ? "5 insights a day — sourced from books that matter"
              : "Daily insights sourced from books that matter"}
          </p>
        </div>
      </AtmosphericHero>

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
                onRead={markRead}
                likedPosts={likedPosts}
                readPosts={readPosts}
                heldPosts={heldPosts}
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
                      heldPosts={heldPosts}
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
      </ContentSection>
    </div>
  );
}
