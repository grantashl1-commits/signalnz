import { motion } from "framer-motion";
import { Check, Crown, Zap, Plus, LogIn, Settings } from "lucide-react";
import { SeedGeometry, BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const STRIPE_TIERS = {
  nourished: {
    priceId: "price_1TB71HEAvaJHDMD49yoKtzpf",
    productId: "prod_U9Pqh2vkb2wrNR",
  },
  thriving: {
    priceId: "price_1TB71pEAvaJHDMD4gkBPg6Vt",
    productId: "prod_U9Pr8k3iP6Bler",
  },
  topup: {
    priceId: "price_1TB729EAvaJHDMD4kgzSS7JM",
    productId: "prod_U9PrdS82rTl5Bw",
  },
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    popular: false,
    key: "free" as const,
    features: [
      "Cycle tracker",
      "Daily check-in",
      "Basic phase guidance",
      "20 AI signals per month",
    ],
  },
  {
    name: "Nourished",
    price: "$19",
    period: "/mo",
    popular: true,
    key: "nourished" as const,
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
    price: "$39",
    period: "/mo",
    popular: false,
    key: "thriving" as const,
    features: [
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

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! 🎉");
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
      if (data?.url) window.open(data.url, "_blank");
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
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Could not open portal");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const isCurrentTier = (key: string) => subscription.tier === key;

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 relative">
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

      {/* Tier cards */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-3">
        {TIERS.map((t, i) => {
          const isCurrent = isCurrentTier(t.key);
          return (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              whileTap={{ scale: 0.98 }}
              className={`card-warm p-5 md:p-6 flex flex-col relative overflow-hidden ${t.popular ? "ring-1 ring-primary" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {isCurrent && (
                <span className="absolute top-3 left-3 rounded-full bg-primary/10 px-2.5 py-0.5 font-hand text-[11px] text-primary font-bold">
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
                <CymatiSketch phase={i === 0 ? "menstrual" : i === 1 ? "follicular" : "ovulatory"} size={64} opacity={1} />
              </div>

              <div className="mb-5 md:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {t.name === "Thriving" && <Crown className="h-5 w-5 text-phase-ovulatory" />}
                  <h3 className="font-display text-lg md:text-xl italic text-foreground">{t.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl md:text-4xl text-foreground">{t.price}</span>
                  <span className="font-body text-sm text-muted-foreground">{t.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (t.key === "free") {
                    if (!user) navigate("/auth");
                    return;
                  }
                  handleCheckout(STRIPE_TIERS[t.key].priceId);
                }}
                disabled={isCurrent}
                className={`touch-btn mt-5 md:mt-6 w-full rounded-xl px-4 py-3 min-h-[52px] font-body text-sm font-bold transition-opacity disabled:opacity-50 ${
                  t.popular
                    ? "bg-primary text-primary-foreground active:opacity-90"
                    : "bg-secondary text-foreground active:bg-secondary/80"
                }`}
              >
                {isCurrent ? "Current plan" : t.price === "$0" ? (user ? "Current plan" : "Get started") : "Subscribe"}
              </button>
            </motion.div>
          );
        })}
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
          <span className="font-mono text-2xl text-foreground">$5</span>
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
