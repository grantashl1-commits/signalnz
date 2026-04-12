import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, BookOpen, Rss, ChevronDown, History } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";
import { PeriodDueReminder } from "@/components/DailySignal";
import { useCycle } from "@/contexts/CycleContext";
import { Phase, PHASE_SHORT } from "@/lib/cycle-utils";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { useProfile } from "@/hooks/useProfile";
import NPSSurvey from "@/components/NPSSurvey";
import DaySection from "@/components/feed/DaySection";
import { type FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { pickDailyPosts } from "@/lib/feed-utils";
import { useTodayFocus } from "@/hooks/useTodayFocus";




const PHASE_SUBTEXT: Record<Phase, string> = {
  menstrual: "Your body is in its Menstrual phase — rest and restoration are your focus.",
  follicular: "Your body is in its Follicular phase — energy and clarity are rising.",
  ovulatory: "Your body is in its Ovulatory phase — you're at your peak.",
  luteal: "Your body is in its Luteal phase — slow down and turn inward.",
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" as const },
});

// Mock feed data fallback
const MOCK_POSTS: FeedPost[] = [
  {
    id: "mock-1", post_number: 1,
    post_title_description: "**Your nervous system remembers everything.**\n\nEven when your mind moves on, your body keeps the score. That tension in your shoulders? The knot in your stomach before a meeting? These aren't random — they're your nervous system replaying old patterns of stress.\n\n**Takeaway:** Your body is always communicating — learn to listen before it starts shouting.\n\n*\"The body keeps the score.\"*",
    book_title_author: "The Body Keeps the Score — Bessel van der Kolk",
    themes: ["Mental Health", "Mindfulness"], been_published: true, publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-2", post_number: 2,
    post_title_description: "**Protein timing matters more than you think.**\n\nMost women under-eat protein at breakfast and overload at dinner. Distributing 25-30g across each meal optimises muscle protein synthesis throughout the day.\n\n**Takeaway:** Spread your protein across the day — your muscles are listening at every meal.\n\n*\"Nutrition isn't about perfection. It's about patterns.\"*",
    book_title_author: "ROAR — Stacy Sims",
    themes: ["Nutrition", "Hormones"], been_published: true, publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-3", post_number: 3,
    post_title_description: "**The 2-minute rule can change your life.**\n\nWhen a new habit feels overwhelming, scale it down to just two minutes. The point isn't the two minutes — it's showing up.\n\n**Takeaway:** Make starting so easy that saying no feels harder than saying yes.\n\n*\"You fall to the level of your systems.\"*",
    book_title_author: "Atomic Habits — James Clear",
    themes: ["Habits", "Productivity"], been_published: true, publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-4", post_number: 4,
    post_title_description: "**Sleep is the foundation, not the ceiling.**\n\nOne night of poor sleep reduces insulin sensitivity by 30%, impairs emotional regulation, and weakens immune response.\n\n**Takeaway:** Sleep isn't luxury. It's the single most effective thing you can do for your health.\n\n*\"The best bridge between despair and hope is a good night's sleep.\"*",
    book_title_author: "Why We Sleep — Matthew Walker",
    themes: ["Sleep", "Self-Care"], been_published: true, publish_date: format(new Date(), "yyyy-MM-dd"),
  },
  {
    id: "mock-5", post_number: 5,
    post_title_description: "**Strength training isn't optional for women over 30.**\n\nAfter 30, women lose approximately 3-5% of muscle mass per decade. Resistance training is about bone density, metabolic health, and longevity.\n\n**Takeaway:** The weight room isn't intimidating — sarcopenia is.\n\n*\"Strong women aren't made in comfort zones.\"*",
    book_title_author: "Next Level — Stacy Sims",
    themes: ["Exercise", "Women's Health"], been_published: true, publish_date: format(new Date(), "yyyy-MM-dd"),
  },
];

function isTodayPrepDay(mealPrepDay: string | null): boolean {
  if (!mealPrepDay || mealPrepDay === "No set day") return false;
  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long" });
  return today.toLowerCase() === mealPrepDay.toLowerCase();
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayName, onboardingComplete, loading: profileLoading, refetch, mealPrepDay } = useProfile();
  const { currentPhase, currentCycleDay } = useCycle();
  const todayIsPrepDay = isTodayPrepDay(mealPrepDay);
  const info = { phase: currentPhase, cycleDay: currentCycleDay };
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { focus } = useTodayFocus();

  useEffect(() => {
    const localDone = localStorage.getItem("signal_onboarding_complete") === "true";
    if (user && !profileLoading && onboardingComplete === false && !localDone) {
      setShowOnboarding(true);
    }
  }, [user, profileLoading, onboardingComplete]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refetch();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hasSetCycle = !!useCycle().cycleStartDate;

  const firstName = (() => {
    const meta = user?.user_metadata;
    if (displayName) return displayName.split(" ")[0];
    if (meta?.full_name) return (meta.full_name as string).split(" ")[0];
    if (meta?.name) return (meta.name as string).split(" ")[0];
    return null;
  })();

  // ── Feed data ──
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("signal_feed_likes");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [showFeedHistory, setShowFeedHistory] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);

  const { data: allFeedPosts, isLoading: feedLoading } = useQuery({
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

      return results.length > 0 ? results : MOCK_POSTS;
    },
    staleTime: 1000 * 60 * 60 * 4,
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const displayPosts = allFeedPosts ? (() => {
    const pinned = allFeedPosts.filter(p => [2, 3, 4].includes(p.post_number));
    const picked = pickDailyPosts(allFeedPosts, todayStr);
    const pinnedIds = new Set(pinned.map(p => p.id));
    const rest = picked.filter(p => !pinnedIds.has(p.id));
    return [...pinned, ...rest].slice(0, 10);
  })() : MOCK_POSTS;

  const historySections: { date: Date; posts: FeedPost[] }[] = [];
  if (showFeedHistory && allFeedPosts) {
    for (let d = 1; d <= historyDays; d++) {
      const pastDate = subDays(new Date(), d);
      const pastStr = format(pastDate, "yyyy-MM-dd");
      const pastPosts = pickDailyPosts(allFeedPosts, pastStr);
      if (pastPosts.length > 0) {
        historySections.push({ date: pastDate, posts: pastPosts });
      }
    }
  }

  const handleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      localStorage.setItem("signal_feed_likes", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleJournal = useCallback((post: FeedPost) => {
    if (!user) { toast.error("Sign in to save to your journal"); return; }
    const journalPrompt = {
      id: `knowledge-${post.id}-${Date.now()}`, source: "feed",
      post_title: post.book_title_author, content: post.post_title_description,
      themes: post.themes, created_at: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem("signal_knowledge_hub") || "[]");
    existing.unshift(journalPrompt);
    localStorage.setItem("signal_knowledge_hub", JSON.stringify(existing));
    toast.success("Saved to Knowledge Hub", {
      description: "Find it in your Memories tab to reflect on later",
      action: { label: "Go to Journal", onClick: () => navigate("/journal") },
    });
  }, [user, navigate]);

  if (showOnboarding) return <OnboardingFlow onComplete={handleOnboardingComplete} />;

  return (
    <div className="relative">
      <NPSSurvey />
      {/* ═══ SECTION 1 — HERO / CONTEXT ═══ */}
      <AtmosphericHero size="lg">
        <SignalPulse />
        <div className="text-center max-w-xl mx-auto relative z-10">
          <motion.p {...fadeUp(0.1)} className="font-body text-section-label uppercase text-primary-foreground/80 mb-8">
            {greeting}, {firstName || "you"}.
          </motion.p>
          <motion.p {...fadeUp(0.35)} className="font-body text-[1.75rem] md:text-[2rem] font-bold text-primary-foreground leading-tight max-w-md mx-auto mb-6">
            {PHASE_SUBTEXT[info.phase]}
          </motion.p>
          <motion.p {...fadeUp(0.45)} className="font-body text-section-label text-primary-foreground/60 uppercase mb-10">
            Day {info.cycleDay} · {PHASE_SHORT[info.phase]}
          </motion.p>
          {!hasSetCycle && (
            <motion.div {...fadeUp(0.5)} className="mb-8">
              <Link to="/cycle" className="inline-flex items-center gap-2 rounded-full bg-card/20 backdrop-blur-sm border border-primary-foreground/20 px-5 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-card/30 transition-colors">
                Set up your cycle <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </AtmosphericHero>

      <PeriodDueReminder />

      {/* ═══ PREP DAY REMINDER ═══ */}
      {todayIsPrepDay && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }} className="px-5 md:px-8 pt-4">
          <div className="max-w-2xl mx-auto">
            <Link to="/nutrition" className="flex items-center gap-3 rounded-[16px] px-4 py-3.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-foreground leading-tight">Today is your meal prep day 🥗</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">Your shopping list and weekly plan are ready — tap to view.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ═══ SECTION 2 — TODAY'S FOCUS ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
          <motion.div {...fadeUp(0.1)} className="card-warm space-y-3">
            <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>today</p>
            {[
              { label: "eat", value: focus.eat, href: "/nutrition" },
              { label: "move", value: focus.move, href: "/movement" },
              { label: "rest", value: focus.rest, href: "/practice" },
              { label: "cycle", value: focus.cycle, href: "/cycle" },
            ].map(({ label, value, href }) => (
              <Link key={label} to={href} className="flex gap-3 items-start group hover:bg-foreground/[0.03] -mx-2 px-2 py-1 rounded-lg transition-colors">
                <span className="font-body text-section-label w-10 pt-0.5" style={{ color: 'hsl(var(--label-color))' }}>{label}</span>
                <p className="text-body-lg text-foreground/70 leading-snug flex-1 group-hover:text-foreground transition-colors">{value}</p>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all mt-1 flex-shrink-0" />
              </Link>
            ))}
          </motion.div>
        </div>
      </ContentSection>

      {/* ═══ SECTION 3 — KNOWLEDGE FEED ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp(0.15)}>
            <div className="flex items-center gap-2 mb-2">
              <Rss className="h-4 w-4 text-primary" />
              <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
                knowledge incoming
              </p>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-4">
              10 insights a day — sourced from books that matter
            </p>
            {feedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-5 space-y-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <DaySection
                  date={new Date()}
                  posts={displayPosts}
                  onLike={handleLike}
                  onJournal={handleJournal}
                  likedPosts={likedPosts}
                />

                {!showFeedHistory ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowFeedHistory(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all font-body text-sm"
                    style={{ boxShadow: "var(--shadow-soft)" }}
                  >
                    <History className="h-4 w-4" />
                    <span>View past insights</span>
                    <ChevronDown className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <>
                    <div className="mt-6 space-y-6">
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
                    </div>

                    <button
                      onClick={() => setHistoryDays((d) => d + 7)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-muted-foreground hover:text-foreground font-body text-xs transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>Load more days</span>
                    </button>
                  </>
                )}

                <div className="text-center py-4">
                  <p className="font-body text-xs text-muted-foreground/50">
                    New insights every day at midnight
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </ContentSection>

      <div style={{ height: 'var(--section-gap)' }} />
    </div>
  );
}
