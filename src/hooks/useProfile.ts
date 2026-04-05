import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CycleMode } from "@/components/cycle/CycleModeSelector";

export function useProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [cycleMode, setCycleModeState] = useState<CycleMode>("cycling");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setDisplayName(null);
      setOnboardingComplete(null);
      setReferralCode(null);
      setCycleModeState("cycling");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("display_name, onboarding_complete, referral_code, cycle_mode")
      .eq("user_id", user.id)
      .maybeSingle();
    setDisplayName(data?.display_name ?? null);
    setOnboardingComplete((data as any)?.onboarding_complete ?? false);
    setReferralCode((data as any)?.referral_code ?? null);
    setCycleModeState(((data as any)?.cycle_mode as CycleMode) ?? "cycling");
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return;
      const trimmed = name.trim() || null;
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: "user_id" });
      if (!error) setDisplayName(trimmed);
      return error;
    },
    [user],
  );

  const updateCycleMode = useCallback(
    async (mode: CycleMode) => {
      if (!user) {
        // Fallback to localStorage for unauthenticated users
        localStorage.setItem("cycleMode", mode);
        setCycleModeState(mode);
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, cycle_mode: mode } as any, { onConflict: "user_id" });
      if (!error) setCycleModeState(mode);
      return error;
    },
    [user],
  );

  // Load from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem("cycleMode") as CycleMode | null;
      if (stored) setCycleModeState(stored);
    }
  }, [user]);

  return {
    displayName,
    onboardingComplete,
    referralCode,
    cycleMode,
    loading,
    updateDisplayName,
    updateCycleMode,
    refetch: fetchProfile,
  };
}
