import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFeatureGate, type FeatureTier } from "@/hooks/useFeatureGate";
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
}: {
  requiredTier: FeatureTier;
  children: React.ReactNode;
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
                <Lock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground">
                  {isLoggedIn ? (
                    <>This feature requires the <strong>{TIER_LABELS[requiredTier]}</strong> plan</>
                  ) : (
                    <>Sign in and subscribe to unlock this feature</>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  haptic("light");
                  navigate(isLoggedIn ? "/membership" : "/auth");
                }}
                className="flex-shrink-0 rounded-xl bg-primary px-3 py-1.5 font-body text-xs font-bold text-primary-foreground"
              >
                {isLoggedIn ? "Upgrade" : "Sign in"}
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
