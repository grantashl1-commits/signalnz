import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AICredits {
  creditsRemaining: number;
  tier: string;
  loading: boolean;
}

export function useAICredits(): AICredits & { refresh: () => void } {
  const [creditsRemaining, setCreditsRemaining] = useState(5);
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  const applyFallback = () => {
    setCreditsRemaining(5);
    setTier("free");
  };

  const fetchCredits = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        applyFallback();
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining, tier")
        .eq("user_identifier", user.id)
        .maybeSingle();

      if (data) {
        setCreditsRemaining(data.credits_remaining ?? 0);
        setTier(data.tier ?? "free");
      } else {
        applyFallback();
      }
    } catch {
      applyFallback();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { creditsRemaining, tier, loading, refresh: fetchCredits };
}
