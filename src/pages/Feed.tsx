import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Rss, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import DaySection from "@/components/feed/DaySection";
import PostCard, { type FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ── Mock data fallback ───────────────────────────────────────
const MOCK_POSTS: FeedPost[] = [
  {
    id: "mock-1",
    post_number: 1,
    post_title_description: "**Your nervous system remembers everything.**\n\nEven when your mind moves on, your body keeps the score. That tension in your shoulders? The knot in your stomach before a meeting? These aren't random — they're your nervous system replaying old patterns of stress. The good news: neuroplasticity means you can rewire these responses. Start with 90 seconds of slow exhale breathing when you notice tension. Over time, you're literally teaching your body a new default.\n\n**Takeaway:** Your body is always communicating — learn to listen before it starts shouting.\n\n*\"The body keeps the score. If you don't process your stress, your stress will process you.\"*",
    book_title_author: "The Body Keeps the Score — Bessel van der Kolk",
    themes: ["Mental Health", "Mindfulness"],
    been_published: true,
    publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-2",
    post_number: 2,
    post_title_description: "**Protein timing matters more than you think.**\n\nMost women under-eat protein at breakfast and overload at dinner. Research shows distributing 25-30g of protein across each meal optimises muscle protein synthesis throughout the day. This is especially important during the luteal phase when progesterone increases protein breakdown. A simple fix: add Greek yoghurt to breakfast, include legumes at lunch, and you're already halfway there.\n\n**Takeaway:** Spread your protein across the day — your muscles are listening at every meal, not just dinner.\n\n*\"Nutrition isn't about perfection. It's about patterns.\"*",
    book_title_author: "ROAR — Stacy Sims",
    themes: ["Nutrition", "Hormones"],
    been_published: true,
    publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-3",
    post_number: 3,
    post_title_description: "**The 2-minute rule can change your life.**\n\nWhen a new habit feels overwhelming, scale it down to just two minutes. Want to meditate? Start with two minutes of sitting quietly. Want to journal? Write one sentence. The point isn't the two minutes — it's showing up. Identity change happens through repetition, not intensity. You don't need to run a marathon to become a runner. You just need to put on your shoes.\n\n**Takeaway:** Make starting so easy that saying no feels harder than saying yes.\n\n*\"You do not rise to the level of your goals. You fall to the level of your systems.\"*",
    book_title_author: "Atomic Habits — James Clear",
    themes: ["Habits", "Productivity"],
    been_published: true,
    publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-4",
    post_number: 4,
    post_title_description: "**Sleep is the foundation, not the ceiling.**\n\nEvery major system in your body — immune, metabolic, hormonal, cognitive — deteriorates without adequate sleep. Yet we treat it as negotiable. One night of poor sleep reduces insulin sensitivity by 30%, impairs emotional regulation, and weakens immune response. The fix isn't complicated: consistent wake time, morning light exposure, and a cool dark room. Prioritise sleep the way you'd prioritise a meeting with your most important client — because that client is your future self.\n\n**Takeaway:** Sleep isn't luxury. It's the single most effective thing you can do for your health.\n\n*\"The best bridge between despair and hope is a good night's sleep.\"*",
    book_title_author: "Why We Sleep — Matthew Walker",
    themes: ["Sleep", "Self-Care"],
    been_published: true,
    publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-5",
    post_number: 5,
    post_title_description: "**Strength training isn't optional for women over 30.**\n\nAfter 30, women lose approximately 3-5% of muscle mass per decade. By menopause, this accelerates dramatically. Resistance training isn't just about aesthetics — it's about bone density, metabolic health, hormone regulation, and longevity. Even two sessions per week can reverse age-related muscle loss. Focus on compound movements: squats, deadlifts, rows, and presses. Progressive overload is the key — your muscles need to be challenged to adapt.\n\n**Takeaway:** The weight room isn't intimidating — sarcopenia is. Pick up something heavy.\n\n*\"Strong women aren't made in comfort zones.\"*",
    book_title_author: "Next Level — Stacy Sims",
    themes: ["Exercise", "Women's Health"],
    been_published: true,
    publish_date: format(new Date(), "yyyy-MM-dd"),
  },
];

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("signal_feed_likes");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Fetch today's 5 posts (random selection by themes/authors)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed-posts", format(new Date(), "yyyy-MM-dd")],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Try fetching posts with today's publish_date
      const { data: todayPosts, error } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("publish_date", today)
        .order("post_number")
        .limit(5);
      
      if (error) throw error;
      
      if (todayPosts && todayPosts.length > 0) {
        return todayPosts as FeedPost[];
      }

      // Fallback: get total count then pick 5 random
      const { count } = await supabase
        .from("feed_posts")
        .select("*", { count: "exact", head: true });

      if (!count || count === 0) return MOCK_POSTS;

      // Use a deterministic seed based on today's date for consistent daily selection
      const seed = today.split("-").join("");
      const seedNum = parseInt(seed) % count;
      
      // Pick 5 spread-out posts
      const offsets = Array.from({ length: 5 }, (_, i) => 
        (seedNum + Math.floor((i * count) / 5)) % count
      );

      const results: FeedPost[] = [];
      for (const offset of offsets) {
        const { data } = await supabase
          .from("feed_posts")
          .select("*")
          .order("post_number")
          .range(offset, offset);
        if (data?.[0]) results.push(data[0] as FeedPost);
      }

      // Deduplicate by author — swap duplicates
      const seen = new Set<string>();
      const deduped: FeedPost[] = [];
      for (const p of results) {
        if (!seen.has(p.book_title_author)) {
          seen.add(p.book_title_author);
          deduped.push(p);
        }
      }

      return deduped.length >= 3 ? deduped : results.slice(0, 5);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

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
    // Save post to localStorage for the journal to pick up
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

  const displayPosts = posts || MOCK_POSTS;

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
            5 insights a day — sourced from books that matter
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
            <DaySection
              date={new Date()}
              posts={displayPosts}
              onLike={handleLike}
              onJournal={handleJournal}
              likedPosts={likedPosts}
            />
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
