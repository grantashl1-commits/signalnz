import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REF_STORAGE_KEY = "signal_referral_code";

/** Capture ?ref= param from URL into localStorage (call once at app root) */
export function captureReferralParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.length >= 4) {
      localStorage.setItem(REF_STORAGE_KEY, ref.toUpperCase());
    }
  } catch {}
}

/** Get stored referral code */
export function getStoredReferral(): string | null {
  try {
    return localStorage.getItem(REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Clear stored referral */
export function clearStoredReferral() {
  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch {}
}

/** Link the current user to the referrer after signup */
export async function linkReferral(userId: string) {
  const code = getStoredReferral();
  if (!code) return;

  // Look up referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("referral_code", code)
    .maybeSingle();

  if (!referrer || referrer.user_id === userId) {
    clearStoredReferral();
    return;
  }

  // Insert referral record
  await supabase.from("referrals").insert({
    referrer_id: referrer.user_id,
    referred_user_id: userId,
    status: "pending",
  });

  clearStoredReferral();
}

interface ReferralStats {
  total: number;
  converted: number;
  freeMonths: number;
}

export function useReferralStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({ total: 0, converted: 0, freeMonths: 0 });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referrals")
      .select("status")
      .eq("referrer_id", user.id);

    const all = data || [];
    const converted = all.filter((r: any) => r.status === "converted").length;
    setStats({ total: all.length, converted, freeMonths: converted });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, refetch: fetch };
}
