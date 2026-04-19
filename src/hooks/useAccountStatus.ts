import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SuspensionInfo {
  id: string;
  reason: string;
  scope: "community" | "all";
  expires_at: string | null;
  created_at: string;
}

/**
 * Returns the active suspension for the current user, if any.
 * Used to gate Community write actions (post, message, comment) client-side
 * AND to render the SuspensionBanner so the user knows why they're blocked.
 *
 * The DB enforces this too via is_user_suspended() in RLS — this hook is for UX.
 */
export function useAccountStatus() {
  const { user } = useAuth();
  const [suspension, setSuspension] = useState<SuspensionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setSuspension(null); setLoading(false); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("account_suspensions" as any)
        .select("id, reason, scope, expires_at, created_at")
        .eq("user_id", user.id)
        .is("lifted_at", null)
        .order("created_at", { ascending: false })
        .limit(1);
      if (!active) return;
      const row = (data?.[0] as any) ?? null;
      // Filter out expired
      if (row && row.expires_at && new Date(row.expires_at) < new Date()) {
        setSuspension(null);
      } else {
        setSuspension(row);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  return { suspension, loading, isSuspended: !!suspension };
}
