import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setDisplayName(null);
      setOnboardingComplete(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("display_name, onboarding_complete")
      .eq("user_id", user.id)
      .maybeSingle();
    setDisplayName(data?.display_name ?? null);
    setOnboardingComplete((data as any)?.onboarding_complete ?? false);
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

  return { displayName, onboardingComplete, loading, updateDisplayName, refetch: fetchProfile };
}
