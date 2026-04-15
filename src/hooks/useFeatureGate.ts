import { useAuth } from "@/contexts/AuthContext";

export type FeatureTier = "free" | "rooted" | "nourished" | "thriving";
export type FeatureAccess = "full" | "locked" | "view_only" | "teaser" | "write_no_save";

const TIER_LEVEL: Record<FeatureTier, number> = {
  free: 0,
  rooted: 1,
  nourished: 2,
  thriving: 3,
};

/**
 * Granular feature-level gating config.
 * Maps feature_key → minimum tier required for "full" access,
 * plus what each lower tier gets.
 */
export const FEATURE_ACCESS: Record<
  string,
  Record<FeatureTier, FeatureAccess>
> = {
  // Rhythm
  cycle_view:           { free: "full", rooted: "full", nourished: "full", thriving: "full" },
  cycle_log_period:     { free: "full", rooted: "full", nourished: "full", thriving: "full" },
  cycle_full_logging:   { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  cycle_phase_guidance: { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  cycle_ai_insights:    { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  hormone_hub:          { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  seed_cycling:         { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  irregular_period:     { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  perimenopause_mode:   { free: "locked", rooted: "full", nourished: "full", thriving: "full" },

  // Knowledge Feed
  feed_access:          { free: "teaser", rooted: "full", nourished: "full", thriving: "full" },
  feed_save:            { free: "locked", rooted: "full", nourished: "full", thriving: "full" },

  // AI Signal
  signal_daily:         { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  stoic_readings:       { free: "locked", rooted: "full", nourished: "full", thriving: "full" },
  stoic_journal:        { free: "locked", rooted: "full", nourished: "full", thriving: "full" },

  // Nutrition
  nutrition_browse:     { free: "view_only", rooted: "view_only", nourished: "full", thriving: "full" },
  nutrition_meal_plans: { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_shopping:   { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_fridge:     { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_plants:     { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_meal_prep:  { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_kids:       { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_supplements:{ free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  nutrition_ai_recipes: { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Movement
  movement_browse:      { free: "view_only", rooted: "view_only", nourished: "full", thriving: "full" },
  movement_training:    { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  movement_sessions:    { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  movement_body_vis:    { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  movement_hr_monitor:  { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Journal
  journal_write:        { free: "write_no_save", rooted: "write_no_save", nourished: "full", thriving: "full" },
  journal_ai:           { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  journal_dream:        { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  journal_vault:        { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  journal_gratitude:    { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  journal_one_line:     { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Breathwork
  breathwork_browse:    { free: "view_only", rooted: "view_only", nourished: "full", thriving: "full" },

  // Nervous System
  nervous_browse:       { free: "view_only", rooted: "view_only", nourished: "full", thriving: "full" },
  somatic_exercises:    { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  fascia_release:       { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Practice
  practice_browse:      { free: "view_only", rooted: "view_only", nourished: "view_only", thriving: "full" },
  practice_habits:      { free: "full", rooted: "full", nourished: "full", thriving: "full" },
  practice_sleep:       { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
  dosha_quiz:           { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Community
  community_browse:     { free: "view_only", rooted: "view_only", nourished: "view_only", thriving: "full" },
  community_nearby:     { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
  community_challenges: { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
  community_chat:       { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },

  // Recommendations
  recommendations:      { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },

  // Connect (Couples)
  connect_reflect:          { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_shared_room:      { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_course:           { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_appreciation:     { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_checkin:          { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_attachment_quiz:  { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_love_languages:   { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },
  connect_coach:            { free: "locked", rooted: "locked", nourished: "full", thriving: "full" },

  // Parenting
  parenting_course:         { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
  parenting_sleep_schedule: { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
  parenting_age_guides:     { free: "locked", rooted: "locked", nourished: "locked", thriving: "full" },
};

/** Which minimum tier each route requires (for full page blocking) */
const ROUTE_TIERS: Record<string, FeatureTier> = {
  "/": "free",
  "/cycle": "free",
  "/membership": "free",
  "/auth": "free",
  "/feed": "free",          // page loads for all, but content is gated
  "/nutrition": "free",     // page loads, individual features gated
  "/movement": "free",
  "/breathwork": "free",
  "/nervous-system": "free",
  "/journal": "free",
  "/modules": "free",
  "/community": "free",
  "/my-practice": "free",
  "/recommendations": "free",
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

  /** Get the access level for a specific feature */
  const getFeatureAccess = (featureKey: string): FeatureAccess => {
    const config = FEATURE_ACCESS[featureKey];
    if (!config) return "full";
    return config[currentTier] ?? "locked";
  };

  /** Check if a feature has full access */
  const hasFeatureAccess = (featureKey: string): boolean => {
    return getFeatureAccess(featureKey) === "full";
  };

  /** Get the minimum tier needed for full access to a feature */
  const getMinTierForFeature = (featureKey: string): FeatureTier => {
    const config = FEATURE_ACCESS[featureKey];
    if (!config) return "free";
    for (const tier of ["free", "rooted", "nourished", "thriving"] as FeatureTier[]) {
      if (config[tier] === "full") return tier;
    }
    return "thriving";
  };

  return {
    currentTier,
    isLoggedIn: !!user,
    hasAccess,
    canAccessRoute,
    getRequiredTier,
    getFeatureAccess,
    hasFeatureAccess,
    getMinTierForFeature,
  };
}
