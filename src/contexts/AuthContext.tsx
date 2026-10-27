import { Fragment, createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { linkReferral } from "@/hooks/useReferral";
import { identifyUser, resetUser } from "@/lib/analytics";
import { setMonitoringUser, clearMonitoringUser } from "@/lib/error-monitoring";
import { useQueryClient } from "@tanstack/react-query";
import { claimDevice, captureDeviceScope, OWNER_KEY } from "@/lib/device-privacy";
import type { User, Session } from "@supabase/supabase-js";

interface SubscriptionInfo {
  subscribed: boolean;
  productId: string | null;
  tier: "free" | "rooted" | "nourished" | "thriving";
  subscriptionEnd: string | null;
  /** Where the tier came from — "manual" grants have no Stripe portal to manage. */
  source: "stripe" | "manual" | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  refreshSubscription: () => Promise<void>;
}

const TIERS_MAP: Record<string, "rooted" | "nourished" | "thriving"> = {
  prod_UDBbsFCvpYtvUN: "rooted",
  prod_U9Pqh2vkb2wrNR: "nourished",
  prod_U9Pr8k3iP6Bler: "thriving",
};

const KNOWN_TIERS = ["free", "rooted", "nourished", "thriving"] as const;

function resolveTier(rawTier: unknown, productId: string | null): SubscriptionInfo["tier"] {
  // check-subscription now returns the tier directly, including for manual
  // grants that have no Stripe product. Fall back to the product map for older
  // deployed responses.
  if (typeof rawTier === "string" && (KNOWN_TIERS as readonly string[]).includes(rawTier)) {
    return rawTier as SubscriptionInfo["tier"];
  }
  return (productId && TIERS_MAP[productId]) || "free";
}

const defaultSub: SubscriptionInfo = {
  subscribed: false,
  productId: null,
  tier: "free",
  subscriptionEnd: null,
  source: null,
};

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  subscription: defaultSub,
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [storageError, setStorageError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSub);

  const checkSubscription = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setSubscription(defaultSub);
      return;
    }

    const scope = captureDeviceScope();
    // Retry once on transient runtime errors (503 cold-start)
    const invokeOnce = () =>
      supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });

    try {
      let { data, error } = await invokeOnce();
      if (error) {
        const msg = String((error as any)?.message ?? "");
        const isTransient = msg.includes("503") || msg.toLowerCase().includes("temporarily unavailable");
        if (isTransient) {
          await new Promise((r) => setTimeout(r, 1500));
          ({ data, error } = await invokeOnce());
        }
      }
      if (error) {
        // Keep previous subscription state instead of resetting — avoids UI flash/blank screens.
        console.warn("[check-subscription] failed, keeping previous state:", error);
        return;
      }
      if (!scope.matches(currentSession.user.id)) return;
      const productId = data?.product_id ?? null;
      const source = data?.source === "manual" || data?.source === "stripe" ? data.source : null;
      setSubscription({
        subscribed: !!data?.subscribed,
        productId,
        tier: resolveTier(data?.tier, productId),
        subscriptionEnd: data?.subscription_end ?? null,
        source,
      });
    } catch (e) {
      console.warn("[check-subscription] unexpected error:", e);
      // Do not clobber existing subscription on transient failures.
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    await checkSubscription(session);
  }, [session, checkSubscription]);

  useEffect(() => {
    let disposed = false;
    let authEventReceived = false;
    const applySession = (next: Session | null) => {
      if (disposed) return false;
      try {
        if (claimDevice(next?.user.id ?? null)) {
          queryClient.clear();
          setSubscription(defaultSub);
        }
        setStorageError(false);
        setSession(next);
        setUser(next?.user ?? null);
        setLoading(false);
        return true;
      } catch {
        setStorageError(true);
        setLoading(false);
        return false;
      }
    };
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        authEventReceived = true;
        if (!applySession(newSession)) return;

        if (event === "SIGNED_IN" && newSession?.user) {
          linkReferral(newSession.user.id);
          identifyUser(newSession.user.id, { email: newSession.user.email });
          setMonitoringUser(newSession.user.id, newSession.user.email);

          // Send welcome email on first signup (created within last 3 minutes)
          const u = newSession.user;
          const sentKey = `welcome_sent_${u.id}`;
          const createdMsAgo = Date.now() - new Date(u.created_at).getTime();
          if (createdMsAgo < 3 * 60 * 1000 && !localStorage.getItem(sentKey)) {
            localStorage.setItem(sentKey, "1");
            const firstName = (u.user_metadata?.full_name as string | undefined)
              ?.split(" ")[0];
            supabase.functions.invoke("send-email", {
              body: { type: "welcome", to: u.email, name: firstName },
            }).catch(() => {});
          }
        }
        if (event === "SIGNED_OUT") {
          resetUser();
          clearMonitoringUser();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!authEventReceived) applySession(s);
    });
    const otherTab = (event: StorageEvent) => {
      if (event.key === OWNER_KEY) window.location.reload();
    };
    window.addEventListener("storage", otherTab);
    return () => { disposed = true; authSub.unsubscribe(); window.removeEventListener("storage", otherTab); };
  }, [queryClient]);

  // Hydrate training even when a member opens Today before the Training tab.
  useEffect(() => {
    if (loading || storageError || !user) return;
    const scope = captureDeviceScope();
    const sync = async () => {
      const training = await import('@/lib/training-path-utils');
      if (!scope.matches(user.id)) return;
      await training.hydrateSelectedPathFromProfile();
      if (!scope.matches(user.id)) return;
      await training.syncTrainingProgress();
      if (!scope.matches(user.id)) return;
      await training.flushTrainingLogs();
    };
    void sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [user?.id, loading, storageError]);

  // Check subscription when session changes
  useEffect(() => {
    if (!loading) {
      checkSubscription(session);
    }
  }, [session, loading, checkSubscription]);

  // Refresh every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => checkSubscription(session), 60_000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, refreshSubscription }}>
      {storageError ? <div role="alert">Your saved data could not be opened safely. Free up browser storage, then reload to try again.</div> : loading ? <div role="status">Loading your account…</div> : <Fragment key={user?.id ?? "guest"}>{children}</Fragment>}
    </AuthContext.Provider>
  );
}
