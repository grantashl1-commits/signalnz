import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCycle } from "@/contexts/CycleContext";
import { useAuth } from "@/contexts/AuthContext";

export interface SignalFableResponse {
  message: string;
  sunSign: string | null;
  moonPhase: string;
  cyclePhase: string;
  fableTitle: string;
  daoChapter: string;
}

// Moon glyphs for display
export const MOON_GLYPHS: Record<string, string> = {
  "new moon": "🌑",
  "waxing crescent": "🌒",
  "first quarter": "🌓",
  "waxing gibbous": "🌔",
  "full moon": "🌕",
  "waning gibbous": "🌖",
  "last quarter": "🌗",
  "waning crescent": "🌘",
};

export function useGiveSignal() {
  const [response, setResponse] = useState<SignalFableResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentPhase } = useCycle();
  const { user } = useAuth();

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Fetch DOB from profile
      let dob: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("date_of_birth")
          .eq("user_id", user.id)
          .maybeSingle();
        dob = (profile as any)?.date_of_birth || null;
      }

      const { data, error: fnError } = await supabase.functions.invoke("give-signal-ai", {
        body: {
          dob,
          cyclePhase: currentPhase || "follicular",
          userId: user?.id || null,
        },
      });

      if (fnError) throw new Error(fnError.message || "Failed to generate signal");
      if (data) setResponse(data as SignalFableResponse);
    } catch (e: any) {
      console.error("Give signal error:", e);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentPhase, user]);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return { response, loading, error, generate, reset };
}
