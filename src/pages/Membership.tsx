import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Zap, Plus, LogIn, Settings, Sparkles, Sprout } from "lucide-react";
import { SeedGeometry, BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const STRIPE_TIERS = {
  rooted: {
    priceId: "price_1TElEOEAvaJHDMD4nbJ489js",
    productId: "prod_UDBbsFCvpYtvUN",
    annualPriceId: "price_annual_rooted", // placeholder
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
    features: [
      "Cycle tracker",
      "Daily check-in",
      "Basic phase guidance",
      "5 AI signals per month",
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
    features: [
      "Full cycle tracker",
      "Daily check-in",
      "Full phase guidance",
      "Today's meal plan (view only)",
      "Basic movement plan",
      "30 AI signals per month",
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
    features: [
      "AI meal ideas for your phase",
      "Full movement library",
      "Breathwork guides",
      "Journaling tools",
      "150 AI signals per month",
      "Journal intelligence",
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
    features: [
      "Full community access",
      "Full module library",
      "AI nervous system check-in",
      "Weekly phase reports",
      "Priority features",
      "Unlimited AI signals",
      "Full journal intelligence",
      "Signal memory and patterns",
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
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, mode },
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
        <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">Choose the level of support that feels right</p>
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
          {subscription.subscribed && (
            <button
              onClick={handleManage}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 font-body text-xs font-semibold text-foreground"
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

      {/* Tier cards — horizontally scrollable on mobile */}
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
                    className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 font-hand text-[11px] font-bold"
                    style={isRooted ? { backgroundColor: "#C8647A20", color: "#C8647A" } : undefined}
                    {...(!isRooted && { className: "absolute top-3 left-3 rounded-full bg-primary/10 px-2.5 py-0.5 font-hand text-[11px] text-primary font-bold" })}
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

                <div className="mb-5 md:mb-6">
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
                      className="font-body text-xs mt-1"
                      style={isRooted ? { color: "#C8647A" } : undefined}
                      {...(!isRooted && { className: "font-body text-xs text-primary mt-1" })}
                    >
                      {t.annualSub}
                    </motion.p>
                  )}
                </div>

                <ul className="space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 font-body text-sm text-foreground/80">
                      <Check
                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                        style={isRooted ? { color: "#C8647A" } : undefined}
                        {...(!isRooted && { className: "h-4 w-4 text-primary mt-0.5 flex-shrink-0" })}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Annual upsell for Thriving when on monthly */}
                {t.key === "thriving" && isCurrent && !isAnnual && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => { haptic("light"); setIsAnnual(true); }}
                    className="mt-3 font-body text-xs text-primary hover:underline text-left"
                  >
                    Switch to annual and save $156/yr →
                  </motion.button>
                )}

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
                  className={`touch-btn mt-5 md:mt-6 w-full rounded-xl px-4 py-3 min-h-[52px] font-body text-sm font-bold transition-opacity disabled:opacity-50 ${
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
          Need more signals? Add 50 AI credits instantly.
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
    </div>
  );
}
