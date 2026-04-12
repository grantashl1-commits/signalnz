import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, Sparkles, Eye, PenOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFeatureGate, type FeatureTier, type FeatureAccess } from "@/hooks/useFeatureGate";
import { useAuth } from "@/contexts/AuthContext";
import { haptic } from "@/hooks/use-mobile";

const TIER_LABELS: Record<FeatureTier, string> = {
  free: "Free",
  rooted: "Rooted",
  nourished: "Nourished",
  thriving: "Thriving",
};

const TIER_ICONS: Record<FeatureTier, React.ReactNode> = {
  free: null,
  rooted: <Sparkles className="h-4 w-4" />,
  nourished: <Sparkles className="h-4 w-4" />,
  thriving: <Crown className="h-4 w-4" />,
};

/**
 * Wraps a page and shows a subtle upgrade banner when the user
 * doesn't have the required tier. Content is still visible but
 * interactive elements should use <GatedAction>.
 */
export function GatedPage({
  requiredTier,
  children,
  customMessage,
}: {
  requiredTier: FeatureTier;
  children: React.ReactNode;
  customMessage?: {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    buttonLabel: string;
  };
}) {
  const { hasAccess, isLoggedIn } = useFeatureGate();
  const navigate = useNavigate();
  const unlocked = hasAccess(requiredTier);

  return (
    <div className="relative">
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-0 z-40 mx-auto max-w-lg mb-4"
          >
            <div className="rounded-2xl border border-primary/20 bg-primary/8 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary flex-shrink-0">
                {customMessage?.icon ?? <Lock className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                {customMessage ? (
                  <>
                    <p className="font-body text-sm font-semibold text-foreground">{customMessage.title}</p>
                    {customMessage.subtitle && (
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{customMessage.subtitle}</p>
                    )}
                  </>
                ) : (
                  <p className="font-body text-sm text-foreground">
                    {isLoggedIn ? (
                      <>This feature requires the <strong>{TIER_LABELS[requiredTier]}</strong> plan</>
                    ) : (
                      <>Sign in and subscribe to unlock this feature</>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  haptic("light");
                  navigate(isLoggedIn ? "/membership" : "/auth");
                }}
                className="flex-shrink-0 rounded-xl bg-primary px-3 py-1.5 font-body text-xs font-bold text-primary-foreground"
              >
                {customMessage?.buttonLabel ?? (isLoggedIn ? "Upgrade" : "Sign in")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={!unlocked ? "pointer-events-auto" : ""}>
        {children}
      </div>
    </div>
  );
}

/**
 * Wraps an interactive element (button, card, etc.).
 * When the user lacks the required tier, clicking shows
 * an upgrade prompt instead of executing the action.
 */
export function GatedAction({
  requiredTier,
  children,
  className = "",
}: {
  requiredTier: FeatureTier;
  children: React.ReactNode;
  className?: string;
}) {
  const { hasAccess, isLoggedIn } = useFeatureGate();
  const navigate = useNavigate();
  const unlocked = hasAccess(requiredTier);

  if (unlocked) return <>{children}</>;

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        haptic("medium");
        navigate(isLoggedIn ? "/membership" : "/auth");
      }}
    >
      <div className="pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 font-body text-xs font-bold text-primary-foreground shadow-lg">
          {TIER_ICONS[requiredTier]}
          {isLoggedIn ? `Upgrade to ${TIER_LABELS[requiredTier]}` : "Sign in to unlock"}
        </span>
      </div>
    </div>
  );
}

/**
 * Feature-level gate. Uses feature keys instead of tiers.
 * Shows different UX based on access level: view_only shows content
 * with a lock overlay on expand, write_no_save allows interaction
 * but blocks save, locked shows upgrade prompt.
 */
export function GatedFeature({
  featureKey,
  children,
  viewOnlyChildren,
  className = "",
}: {
  featureKey: string;
  children: React.ReactNode;
  viewOnlyChildren?: React.ReactNode;
  className?: string;
}) {
  const { getFeatureAccess, getMinTierForFeature, isLoggedIn } = useFeatureGate();
  const navigate = useNavigate();
  const access = getFeatureAccess(featureKey);
  const minTier = getMinTierForFeature(featureKey);

  if (access === "full") return <>{children}</>;

  // view_only: show tiles/titles but block expansion
  if (access === "view_only" && viewOnlyChildren) {
    return (
      <div className={`relative ${className}`}>
        {viewOnlyChildren}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 cursor-pointer"
          onClick={() => {
            haptic("medium");
            navigate(isLoggedIn ? "/membership" : "/auth");
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/80 backdrop-blur-sm px-3 py-1.5 font-body text-xs font-bold text-background shadow-lg">
            <Lock className="h-3 w-3" />
            Upgrade to {TIER_LABELS[minTier]}
          </span>
        </div>
      </div>
    );
  }

  // write_no_save: allow writing but show save-blocked notice
  if (access === "write_no_save") {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-4 flex items-center gap-2">
          <PenOff className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="font-body text-xs text-amber-700 dark:text-amber-400">
            You can write here, but entries won't save.{" "}
            <button
              onClick={() => navigate(isLoggedIn ? "/membership" : "/auth")}
              className="underline font-semibold"
            >
              Upgrade to {TIER_LABELS[minTier]}
            </button>{" "}
            to keep your work.
          </p>
        </div>
        {children}
      </div>
    );
  }

  // locked or teaser: full block
  return (
    <GatedAction requiredTier={minTier} className={className}>
      {children}
    </GatedAction>
  );
}
