import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, BookOpen, Rss, ChevronDown, History } from "lucide-react";
import { JournalSection, DottedDivider, CelestialHeader } from "@/components/JournalBorders";
import HomePlannerCard from "@/components/HomePlannerCard";
import HomeCalendarCard from "@/components/HomeCalendarCard";
import HomeHabitsDisplay from "@/components/HomeHabitsDisplay";
import HomeWeekAtAGlance from "@/components/HomeWeekAtAGlance";
import HomeMoodPulse from "@/components/home/HomeMoodPulse";
import HomeReturnRibbon from "@/components/home/HomeReturnRibbon";
import TodayBoard from "@/components/home/TodayBoard";
import HomeTodoList from "@/components/HomeTodoList";
import { WildStar } from "@/components/BotanicalElements";
import { PeriodDueReminder } from "@/components/DailySignal";
import { useCycle } from "@/contexts/CycleContext";
import { Phase } from "@/lib/cycle-utils";
import { ContentSection } from "@/components/AtmosphericSection";
import { useProfile } from "@/hooks/useProfile";
import NPSSurvey from "@/components/NPSSurvey";
import DaySection from "@/components/feed/DaySection";
import { type FeedPost } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/PullToRefresh";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { pickDailyPosts } from "@/lib/feed-utils";


import menstrualHero from "@/assets/phases/menstrual-hero.png";
import follicularHero from "@/assets/phases/follicular-hero.png";
import ovulatoryHero from "@/assets/phases/ovulatory-hero.png";
import lutealHero from "@/assets/phases/luteal-hero.png";
import { toLocalDateStr } from "@/lib/local-date";

const PHASE_HERO_IMAGE: Record<Phase, string> = {
  menstrual: menstrualHero,
  follicular: follicularHero,
  ovulatory: ovulatoryHero,
  luteal: lutealHero,
};



const PHASE_SUBTEXT: Record<Phase, string> = {
  menstrual: "Your body is asking for rest today. That counts as enough.",
  follicular: "Something is returning. Let it begin small.",
  ovulatory: "You're open and bright today. Let yourself be met.",
  luteal: "Things are turning inward. Be tender with the small.",
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
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== "#calendar") return;
    const timer = setTimeout(() => document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { displayName, onboardingComplete, loading: profileLoading, refetch, mealPrepDay } = useProfile();
  const queryClient = useQueryClient();
  const todayIsPrepDay = isTodayPrepDay(mealPrepDay);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const todayStr = toLocalDateStr(new Date());
  const [prepDismissed, setPrepDismissed] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(`prep_dismissed_${todayStr}`) === "true"
  );

  // Cycle-silence nudge: no mood/symptom/period log in last 3 days
  const cycleSilent = useMemo(() => {
    if (typeof window === "undefined") return false;
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = toLocalDateStr(d);
      if (
        localStorage.getItem(`mindcast_moods_${ds}`) ||
        localStorage.getItem(`mindcast_symptoms_${ds}`) ||
        localStorage.getItem(`mindcast_symptoms_new_${ds}`) ||
        localStorage.getItem(`mindcast_weight_${ds}`)
      ) return false;
    }
    return true;
  }, [todayStr]);

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

  // Mirror the same user-anchor seeding as Feed.tsx so home + feed show identical posts
  const userCreatedAt = user?.created_at;
  const feedAnchor = useMemo(() => {
    if (!userCreatedAt) return new Date();
    return new Date(userCreatedAt);
  }, [userCreatedAt]);

  const todayFeedDayNum = useMemo(() => {
    return differenceInDays(new Date(), feedAnchor) + 1;
  }, [feedAnchor]);

  const todaySeed = useMemo(() => {
    const anchorStr = format(feedAnchor, "yyyyMMdd");
    return `${anchorStr}-${todayFeedDayNum}`;
  }, [feedAnchor, todayFeedDayNum]);

  const displayPosts = allFeedPosts
    ? pickDailyPosts(allFeedPosts, todaySeed)
    : MOCK_POSTS;

  const shownPostIds = new Set(displayPosts.map((p: FeedPost) => p.id));
  const historySections: { date: Date; posts: FeedPost[] }[] = [];
  if (showFeedHistory && allFeedPosts) {
    for (let d = 1; d <= historyDays; d++) {
      const pastDate = subDays(new Date(), d);
      const dayNum = todayFeedDayNum - d;
      if (dayNum < 1) break;
      const anchorStr = format(feedAnchor, "yyyyMMdd");
      const pastSeed = `${anchorStr}-${dayNum}`;
      const pastPosts = pickDailyPosts(allFeedPosts, pastSeed, 5, shownPostIds);
      if (pastPosts.length > 0) {
        historySections.push({ date: pastDate, posts: pastPosts });
        pastPosts.forEach((p: FeedPost) => shownPostIds.add(p.id));
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
    if (!user) { toast.error("Come in first — then we can hold this for you."); return; }
    const journalPrompt = {
      id: `knowledge-${post.id}-${Date.now()}`, source: "feed",
      post_title: post.book_title_author, content: post.post_title_description,
      themes: post.themes, created_at: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem("signal_knowledge_hub") || "[]");
    existing.unshift(journalPrompt);
    localStorage.setItem("signal_knowledge_hub", JSON.stringify(existing));
    toast.success("Held.", {
      description: "It's waiting in your Memories when you want to return.",
      action: { label: "Open Journal", onClick: () => navigate("/journal") },
    });
  }, [user, navigate]);

  // Visitors get the story first; members get their day.
  if (!authLoading && !user) return <Navigate to="/welcome" replace />;
  if (showOnboarding) return <OnboardingFlow onComplete={handleOnboardingComplete} />;

  return (
    <div className="relative">
      <PullToRefresh
        onRefresh={async () => {
          await Promise.all([
            refetch?.(),
            queryClient.invalidateQueries({ queryKey: ["home-feed"] }).catch(() => {}),
          ]);
        }}
      />
      <NPSSurvey />
      {/* ═══ SECTION 1 — TODAY ═══ */}
      <TodayBoard greeting={greeting} firstName={firstName} />

      <PeriodDueReminder />


      {/* ═══ PREP DAY REMINDER (dismissible) ═══ */}
      {todayIsPrepDay && !prepDismissed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }} className="px-5 md:px-8 pt-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 rounded-[16px] px-4 py-3.5 bg-primary/10 border border-primary/20">
              <Link to="/nutrition" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-foreground leading-tight">Today is the day you prep 🥗</p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">Your list and plan are waiting — a small kindness to your week.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem(`prep_dismissed_${todayStr}`, "true");
                  setPrepDismissed(true);
                }}
                className="flex-shrink-0 font-hand text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors px-2 py-1 border-l border-primary/20"
              >
                not today
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ SECTION 2 — HABITS, TO-DO, CALENDAR ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
          {user && <HomeHabitsDisplay />}
          {user && <HomeTodoList />}
          {user && <div id="calendar"><HomeCalendarCard /></div>}
        </div>
      </ContentSection>

      {/* ═══ SECTION 3 — FEED YOUR MIND ═══ */}
      <ContentSection className="px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp(0.15)}>
            <div className="flex items-center gap-2 mb-2">
              <Rss className="h-4 w-4 text-primary/60" />
              <p className="font-hand text-[10px] uppercase tracking-wider" style={{ color: 'hsl(var(--label-color))' }}>
                a little to feed your mind
              </p>
            </div>
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
                    <span>Look back over the days</span>
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
                      <span>A little further back</span>
                    </button>
                  </>
                )}

                <div className="text-center py-4">
                  <p className="font-body text-xs text-muted-foreground/50">
                    Something new arrives each morning.
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
