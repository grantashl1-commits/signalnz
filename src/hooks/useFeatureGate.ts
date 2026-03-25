import { useAuth } from "@/contexts/AuthContext";

export type FeatureTier = "free" | "rooted" | "nourished" | "thriving";

const TIER_LEVEL: Record<FeatureTier, number> = {
  free: 0,
  rooted: 1,
  nourished: 2,
  thriving: 3,
};

/** Which minimum tier each route requires */
const ROUTE_TIERS: Record<string, FeatureTier> = {
  "/": "free",
  "/cycle": "free",
  "/membership": "free",
  "/auth": "free",
  "/nutrition": "nourished",
  "/movement": "nourished",
  "/breathwork": "nourished",
  "/nervous-system": "nourished",
  "/journal": "nourished",
  "/modules": "thriving",
  "/community": "thriving",
  "/my-practice": "thriving",
  "/recommendations": "thriving",
};

export function useFeatureGate() {
  const { user, subscription } = useAuth();
  const currentTier = subscription.tier;
  const currentLevel = TIER_LEVEL[currentTier] ?? 0;

  /** Check if user has access to a given tier */
  const hasAccess = (requiredTier: FeatureTier) => {
    return currentLevel >= TIER_LEVEL[requiredTier];
  };

  /** Check if user can access a specific route */
  const canAccessRoute = (path: string) => {
    const required = ROUTE_TIERS[path] ?? "free";
    return hasAccess(required);
  };

  /** Get the required tier for a route */
  const getRequiredTier = (path: string): FeatureTier => {
    return ROUTE_TIERS[path] ?? "free";
  };

  return {
    currentTier,
    isLoggedIn: !!user,
    hasAccess,
    canAccessRoute,
    getRequiredTier,
  };
}
