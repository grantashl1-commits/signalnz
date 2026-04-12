import { useNavigate } from "react-router-dom";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { haptic } from "@/hooks/use-mobile";

/**
 * Returns a guard function for expand/select interactions.
 * If the user doesn't have full access to the feature, the guard
 * navigates to membership/auth and returns false.
 * Otherwise returns true so the caller can proceed.
 */
export function useGatedExpand(featureKey: string) {
  const { getFeatureAccess, isLoggedIn } = useFeatureGate();
  const navigate = useNavigate();
  const access = getFeatureAccess(featureKey);
  const canExpand = access === "full";

  const guard = (): boolean => {
    if (canExpand) return true;
    haptic("medium");
    navigate(isLoggedIn ? "/membership" : "/auth");
    return false;
  };

  return { canExpand, guard, access };
}
