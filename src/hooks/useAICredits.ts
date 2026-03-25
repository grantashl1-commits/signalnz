import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AICredits {
  creditsRemaining: number;
  tier: string;
  loading: boolean;
}

function getUserIdentifier(): string {
  let id = localStorage.getItem("signal_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("signal_user_id", id);
  }
  return id;
}

export function useAICredits(): AICredits & { refresh: () => void } {
  const [creditsRemaining, setCreditsRemaining] = useState(5);
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const userId = getUserIdentifier();
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining, tier")
        .eq("user_identifier", userId)
        .maybeSingle();

      if (data) {
        setCreditsRemaining(data.credits_remaining);
        setTier(data.tier);
      } else {
        setCreditsRemaining(20);
        setTier("free");
      }
    } catch {
      // Default values
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { creditsRemaining, tier, loading, refresh: fetchCredits };
}
