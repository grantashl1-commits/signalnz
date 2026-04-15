import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Zap, Plus, LogIn, Settings, Sparkles, Sprout, Brain, Utensils, Dumbbell, BookOpen, Users, Leaf, Heart, Moon, Tag, ShoppingBag, Baby, GraduationCap, Loader2 } from "lucide-react";
import TierComparisonTable from "@/components/TierComparisonTable";
import { SeedGeometry, BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

const STRIPE_TIERS = {
  rooted: {
    priceId: "price_1TElEOEAvaJHDMD4nbJ489js",
    productId: "prod_UDBbsFCvpYtvUN",
    annualPriceId: "price_annual_rooted",
  },
  nourished: {
    priceId: "price_1TB71HEAvaJHDMD49yoKtzpf",
    productId: "prod_U9Pqh2vkb2wrNR",
    annualPriceId: "price_annual_nourished",
  },
  thriving: {
    priceId: "price_1TB71pEAvaJHDMD4gkBPg6Vt",
    productId: "prod_U9Pr8k3iP6Bler",
    annualPriceId: "price_annual_thriving",
  },
  topup: {
    priceId: "price_1TB729EAvaJHDMD4kgzSS7JM",
    productId: "prod_U9PrdS82rTl5Bw",
  },
};

/* ─── AI credit cost reference (shown to users) ─── */
const CREDIT_COSTS = [
  { feature: "Daily Signal", credits: 1, icon: <Zap className="h-3.5 w-3.5" /> },
  { feature: "Ask Me Anything", credits: 2, icon: <Brain className="h-3.5 w-3.5" /> },
  { feature: "Journal Insights", credits: 1, icon: <BookOpen className="h-3.5 w-3.5" /> },
  { feature: "Cycle Intelligence", credits: 1, icon: <Heart className="h-3.5 w-3.5" /> },
  { feature: "AI Meal Plan", credits: 3, icon: <Utensils className="h-3.5 w-3.5" /> },
  { feature: "Fridge → Recipe", credits: 2, icon: <Leaf className="h-3.5 w-3.5" /> },
  { feature: "Dream Board Image", credits: 3, icon: <Moon className="h-3.5 w-3.5" /> },
  { feature: "Give a Signal", credits: 1, icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const TIERS = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualSub: "",
    period: "forever",
    annualPeriod: "forever",
    popular: false,
    key: "free" as const,
    annualSavings: "",
    accent: undefined,
    creditLabel: "5 AI credits/mo",
    sections: [
      {
        title: "Included",
        features: [
          "Cycle phase graph & log period",
          "Browse recipes & exercises (titles only)",
          "Journal writing (nothing saves)",
          "Habit tracking",
          "Browse community groups",
        ],
      },
    ],
  },
  {
    name: "Rooted",
    monthlyPrice: "$9",
    annualPrice: "$72",
    annualSub: "just $6/mo",
    period: "/mo",
    annualPeriod: "/yr",
    popular: false,
    key: "rooted" as const,
    annualSavings: "$36/yr",
    accent: "#C8647A",
    creditLabel: "30 AI credits/mo",
    sections: [
      {
        title: "Everything in Free, plus",
        features: [],
      },
      {
        title: "Unlocked",
        features: [
          "5 knowledge posts per day",
          "Full cycle logging & phase guidance",
          "Hormone Education Hub",
          "Seed cycling & irregular period support",
          "Perimenopause mode",
          "AI Signal, AMA & Give",
          "Daily philosophical readings & journal prompts",
          "Save to Knowledge Hub",
        ],
      },
    ],
  },
  {
    name: "Nourished",
    monthlyPrice: "$19",
    annualPrice: "$152",
    annualSub: "just $12.67/mo",
    period: "/mo",
    annualPeriod: "/yr",
    popular: true,
    key: "nourished" as const,
    annualSavings: "$76/yr",
    accent: undefined,
    creditLabel: "150 AI credits/mo",
    sections: [
      {
        title: "Everything in Rooted, plus",
        features: [],
      },
      {
        title: "Nutrition",
        features: [
          "Full recipes, meal plans & shopping list",
          "Fridge-to-recipe & plant tracker",
          "Meal prep guide & kids recipes",
          "Supplement recommender",
          "AI-generated recipes",
        ],
      },
      {
        title: "Movement",
        features: [
          "AI training plans & workout sessions",
          "Body visualiser & heart rate monitor",
        ],
      },
      {
        title: "Mind & Body",
        features: [
          "Journal with AI insights & Dream Studio",
          "Gratitude & one-line journal",
          "Breathwork & somatic exercises",
          "Fascia release player",
          "Dosha quiz",
        ],
      },
      {
        title: "Connect (Couples)",
        features: [
          "AI reflection room & shared space",
          "13-module couples course",
          "AI relationship coach",
          "Appreciation messages & weekly check-in",
          "Attachment & love language quizzes",
        ],
      },
    ],
  },
  {
    name: "Thriving",
    monthlyPrice: "$39",
    annualPrice: "$312",
    annualSub: "just $26/mo",
    period: "/mo",
    annualPeriod: "/yr",
    popular: false,
    key: "thriving" as const,
    annualSavings: "$156/yr",
    accent: undefined,
    creditLabel: "500 AI credits/mo",
    sections: [
      {
        title: "Everything in Nourished, plus",
        features: [],
      },
      {
        title: "Community",
        features: [
          "Community groups, chat & challenges",
          "Nearby members map",
        ],
      },
      {
        title: "Parenting",
        features: [
          "Parenting course & age-based guides",
          "Baby sleep schedule",
        ],
      },
      {
        title: "Wellness",
        features: [
          "Full mindfulness with audio",
          "Sleep tracking",
          "Personalised recommendations",
        ],
      },
    ],
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" as const } }),
};

export default function MembershipPage() {
  const { user, session, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const { creditsRemaining, tier: creditTier } = useAICredits();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated!");
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment" = "subscription") => {
    if (!session) {
      navigate("/auth");
      return;
    }
    haptic("medium");
    try {
      const body: any = { priceId, mode };
      if (couponCode.trim() && mode === "subscription") {
        body.couponId = couponCode.trim();
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Could not start checkout");
    }
  };

  const handleManage = async () => {
    if (!session) return;
    haptic("medium");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Could not open portal");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const isCurrentTier = (key: string) => subscription.tier === key;

  const getPriceId = (key: "rooted" | "nourished" | "thriving") => {
    return isAnnual ? STRIPE_TIERS[key].annualPriceId : STRIPE_TIERS[key].priceId;
  };

  const phaseForIndex = (i: number) => {
    const phases = ["menstrual", "luteal", "follicular", "ovulatory"] as const;
    return phases[i] ?? "menstrual";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-10 relative">
      <div className="absolute top-0 right-0 -translate-y-6 md:-translate-y-10 translate-x-6 md:translate-x-10 pointer-events-none">
        <SeedGeometry size={120} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={180} opacity={0.08} className="hidden md:block" />
      </div>

      <div className="text-center">
        <p className="font-hand text-base md:text-lg text-primary mb-2">join the journey</p>
        <h1 className="font-display text-[1.75rem] md:text-5xl font-bold italic text-foreground">Membership</h1>
        <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">Choose the level of support that feels right for your season</p>
      </div>

      {/* Auth status */}
      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center"
        >
          <p className="font-body text-sm text-muted-foreground mb-3">Sign in to subscribe and manage your membership</p>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-bold text-primary-foreground"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-display text-sm italic text-foreground">
              {subscription.tier === "free" ? "Free tier" : `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} plan`}
            </span>
          </div>
          <p className="font-body text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-body text-xs font-semibold text-foreground">
              {creditTier === "unlimited" ? "Unlimited" : creditsRemaining} AI credits remaining
            </span>
          </div>
          {subscription.subscribed && (
            <button
              onClick={handleManage}
              className="mt-3 block mx-auto inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-body text-xs font-semibold text-foreground"
            >
              <Settings className="h-3.5 w-3.5" /> Manage subscription
            </button>
          )}
          <button onClick={handleSignOut} className="block mx-auto mt-2 font-body text-xs text-muted-foreground underline">
            Sign out
          </button>
        </motion.div>
      )}

      <BotanicalSprig width={160} className="mx-auto md:hidden" />
      <BotanicalSprig width={200} className="mx-auto hidden md:block" />

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => { haptic("light"); setIsAnnual(false); }}
          className={`font-body text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
            !isAnnual ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => {
            haptic("light");
            setIsAnnual(true);
            toast.info("Annual billing is coming soon. Monthly plans are available now.");
          }}
          className={`font-body text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            isAnnual ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Annual <span className="text-muted-foreground/50">(soon)</span>
        </button>
      </div>

      {/* Coupon code */}
      <div className="flex justify-center">
        {!showCoupon ? (
          <button
            onClick={() => { haptic("light"); setShowCoupon(true); }}
            className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Tag className="h-3.5 w-3.5" /> Have a promo code?
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 max-w-xs w-full"
          >
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {couponCode && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-full bg-primary/10 px-2.5 py-1 font-body text-[11px] font-semibold text-primary"
              >
                Applied ✓
              </motion.span>
            )}
          </motion.div>
        )}
      </div>

      {/* Tier cards */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex gap-4 md:gap-5 md:grid md:grid-cols-4 min-w-max md:min-w-0">
          {TIERS.map((t, i) => {
            const isCurrent = isCurrentTier(t.key);
            const displayPrice = isAnnual ? t.annualPrice : t.monthlyPrice;
            const displayPeriod = isAnnual ? t.annualPeriod : t.period;
            const isRooted = t.key === "rooted";
            const accentRing = isRooted ? "ring-[#C8647A]" : "ring-primary";
            return (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariant}
                whileTap={{ scale: 0.98 }}
                className={`card-warm p-5 md:p-6 flex flex-col relative overflow-hidden w-[280px] md:w-auto flex-shrink-0 md:flex-shrink ${
                  t.popular ? "ring-1 ring-primary" : ""
                } ${isCurrent ? `ring-2 ${accentRing}` : ""}`}
              >
                {isCurrent && (
                  <span
                    className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 font-hand text-[11px] font-bold ${
                      isRooted ? "" : "bg-primary/10 text-primary"
                    }`}
                    style={isRooted ? { backgroundColor: "#C8647A20", color: "#C8647A" } : undefined}
                  >
                    Your plan
                  </span>
                )}
                {t.popular && !isCurrent && (
                  <span className="absolute -top-0 left-0 right-0 h-[2px] bg-primary" />
                )}
                {t.popular && !isCurrent && (
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 font-hand text-[11px] font-bold text-primary-foreground">
                    Popular
                  </span>
                )}

                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 pointer-events-none opacity-[0.05]">
                  <CymatiSketch phase={phaseForIndex(i)} size={64} opacity={1} />
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {t.name === "Thriving" && <Crown className="h-5 w-5 text-primary" />}
                    {t.name === "Rooted" && <Sprout className="h-5 w-5" style={{ color: "#C8647A" }} />}
                    <h3 className="font-display text-lg md:text-xl italic text-foreground">{t.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayPrice}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="font-body text-3xl md:text-4xl text-foreground"
                      >
                        {displayPrice}
                      </motion.span>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={displayPeriod}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-body text-sm text-muted-foreground"
                      >
                        {displayPeriod}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  {isAnnual && t.annualSub && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`font-body text-xs mt-1 ${isRooted ? "" : "text-primary"}`}
                      style={isRooted ? { color: "#C8647A" } : undefined}
                    >
                      {t.annualSub}
                    </motion.p>
                  )}
                  {/* Credit badge */}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-0.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="font-body text-[11px] font-semibold text-foreground">{t.creditLabel}</span>
                  </div>
                </div>

                {/* Feature sections */}
                <div className="space-y-3 flex-1">
                  {t.sections.map((section) => (
                    <div key={section.title}>
                      {section.features.length > 0 ? (
                        <>
                          <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{section.title}</p>
                          <ul className="space-y-1.5">
                            {section.features.map((f) => (
                              <li key={f} className="flex items-start gap-2 font-body text-[13px] text-foreground/80">
                                <Check
                                  className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${isRooted ? "" : "text-primary"}`}
                                  style={isRooted ? { color: "#C8647A" } : undefined}
                                />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="font-body text-[11px] font-semibold text-primary italic">{section.title}</p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (t.key === "free") {
                      if (!user) navigate("/auth");
                      return;
                    }
                    if (isAnnual) {
                      toast.info("Annual billing is coming soon. Monthly plans are available now.");
                      setIsAnnual(false);
                      return;
                    }
                    handleCheckout(getPriceId(t.key));
                  }}
                  disabled={isCurrent}
                  className={`touch-btn mt-5 w-full rounded-xl px-4 py-3 min-h-[52px] font-body text-sm font-bold transition-opacity disabled:opacity-50 ${
                    t.popular
                      ? "bg-primary text-primary-foreground active:opacity-90"
                      : isRooted
                      ? "text-white active:opacity-90"
                      : "bg-secondary text-foreground active:bg-secondary/80"
                  }`}
                  style={isRooted && !isCurrent ? { backgroundColor: "#C8647A" } : undefined}
                >
                  {isCurrent
                    ? "Current plan"
                    : t.key === "free"
                    ? (user ? "Start free" : "Get started")
                    : "Subscribe"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tier Comparison Table */}
      <TierComparisonTable />

      {/* AI Credit Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card-warm p-5 md:p-6 max-w-lg mx-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg italic text-foreground">AI Credit Usage</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Each AI-powered feature uses a specific number of credits. Here's what each call costs:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CREDIT_COSTS.map((item) => (
            <div key={item.feature} className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2">
              <span className="text-primary">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-body text-xs text-foreground truncate block">{item.feature}</span>
              </div>
              <span className="font-body text-xs font-bold text-foreground">{item.credits}×</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top-up card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-warm p-5 md:p-6 max-w-sm mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg italic text-foreground">Top up credits</h3>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Need more AI power? Add 50 credits instantly — works on any plan.
        </p>
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="font-body text-2xl text-foreground">$5</span>
          <span className="font-body text-sm text-muted-foreground">one-off</span>
        </div>
        <button
          onClick={() => handleCheckout(STRIPE_TIERS.topup.priceId, "payment")}
          className="touch-btn w-full rounded-xl px-4 py-3 min-h-[52px] bg-secondary text-foreground font-body text-sm font-bold active:bg-secondary/80 transition-opacity"
        >
          Top up 50 credits
        </button>
      </motion.div>

      {/* One-off course purchases */}
      <CourseCards session={session} />
    </div>
  );
}

const ONE_OFF_COURSES = [
  {
    key: "connect_course",
    title: "Connect — Couples Course",
    description: "13-module relationship course with AI coaching, reflection room, attachment & love language quizzes",
    price: "$79",
    detail: "3 months AI coaching · course content forever",
    icon: Heart,
    priceId: "price_1TMVazEAvaJHDMD4refQpKGS",
    includedIn: "Nourished",
    successPath: "/connect?purchase=success",
    accent: "#E879A0",
  },
  {
    key: "parenting_baby_toddler",
    title: "Parenting — Baby & Toddler",
    description: "Sleep schedules, developmental milestones, evidence-based guidance for ages 0-4",
    price: "$49",
    detail: "Lifetime access",
    icon: Baby,
    priceId: "price_1TMVb2EAvaJHDMD4VM8LcrqU",
    includedIn: "Thriving",
    successPath: "/modules?purchase=parenting_baby_toddler",
    accent: "#8B9CF7",
  },
  {
    key: "parenting_kids",
    title: "Parenting — Kids (5-12)",
    description: "Emotional regulation, boundaries, communication strategies for school-age children",
    price: "$49",
    detail: "Lifetime access",
    icon: GraduationCap,
    priceId: "price_1TMVb3EAvaJHDMD4nhlIzWFd",
    includedIn: "Thriving",
    successPath: "/modules?purchase=parenting_kids",
    accent: "#6DC4A0",
  },
  {
    key: "parenting_teens",
    title: "Parenting — Teens (13-17)",
    description: "Navigating adolescence, digital safety, independence, and maintaining connection",
    price: "$49",
    detail: "Lifetime access",
    icon: Users,
    priceId: "price_1TMVb3EAvaJHDMD4xcf6OA1D",
    includedIn: "Thriving",
    successPath: "/modules?purchase=parenting_teens",
    accent: "#E8A838",
  },
];

function CourseCards({ session }: { session: any }) {
  const navigate = useNavigate();
  const { hasOneOffPurchase } = useFeatureGate();
  const { subscription } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleCoursePurchase = async (course: typeof ONE_OFF_COURSES[0]) => {
    if (!session) { navigate("/auth"); return; }
    setLoadingKey(course.key);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: course.priceId, mode: "payment", successPath: course.successPath },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Could not start checkout");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-5"
    >
      <div className="text-center">
        <p className="font-hand text-base text-primary mb-1">no subscription needed</p>
        <h2 className="font-display text-xl md:text-2xl italic text-foreground">Individual Courses</h2>
        <p className="font-body text-xs text-muted-foreground mt-1">Purchase standalone access — no monthly commitment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {ONE_OFF_COURSES.map((course) => {
          const owned = hasOneOffPurchase(course.key);
          const includedViaSub = (course.includedIn === "Nourished" && ["nourished", "thriving"].includes(subscription.tier))
            || (course.includedIn === "Thriving" && subscription.tier === "thriving");
          const IconComp = course.icon;

          return (
            <div
              key={course.key}
              className={`card-warm p-5 relative overflow-hidden ${owned ? "ring-2 ring-primary" : ""}`}
            >
              {owned && (
                <span className="absolute top-3 right-3 rounded-full bg-primary/10 px-2.5 py-0.5 font-hand text-[11px] font-bold text-primary">
                  Purchased ✓
                </span>
              )}
              {includedViaSub && !owned && (
                <span className="absolute top-3 right-3 rounded-full bg-primary/10 px-2.5 py-0.5 font-hand text-[11px] font-bold text-primary">
                  Included
                </span>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${course.accent}20` }}
                >
                  <IconComp className="w-5 h-5" style={{ color: course.accent }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm italic text-foreground leading-tight">{course.title}</h3>
                  <p className="font-body text-[11px] text-muted-foreground mt-0.5 leading-snug">{course.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-body text-xl font-bold text-foreground">{course.price}</span>
                <span className="font-body text-xs text-muted-foreground">NZD</span>
              </div>
              <p className="font-body text-[11px] text-muted-foreground mb-3">{course.detail}</p>

              {owned || includedViaSub ? (
                <button
                  onClick={() => navigate(course.key === "connect_course" ? "/connect" : "/modules")}
                  className="w-full rounded-xl bg-secondary text-foreground px-4 py-2.5 font-body text-sm font-semibold"
                >
                  {owned ? "Open course" : `Included in ${course.includedIn}`}
                </button>
              ) : (
                <button
                  onClick={() => handleCoursePurchase(course)}
                  disabled={loadingKey === course.key}
                  className="w-full rounded-xl px-4 py-2.5 font-body text-sm font-bold text-white active:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: course.accent }}
                >
                  {loadingKey === course.key
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    : <><ShoppingBag className="w-4 h-4" /> Purchase</>
                  }
                </button>
              )}

              <p className="font-body text-[10px] text-muted-foreground/60 mt-2 text-center">
                Also included free with {course.includedIn} membership
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
