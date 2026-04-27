import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { linkReferral } from "@/hooks/useReferral";
import { identifyUser, resetUser } from "@/lib/analytics";
import { setSentryUser, clearSentryUser } from "@/lib/error-monitoring";
import type { User, Session } from "@supabase/supabase-js";

interface SubscriptionInfo {
  subscribed: boolean;
  productId: string | null;
  tier: "free" | "rooted" | "nourished" | "thriving";
  subscriptionEnd: string | null;
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

const defaultSub: SubscriptionInfo = {
  subscribed: false,
  productId: null,
  tier: "free",
  subscriptionEnd: null,
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSub);

  const checkSubscription = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setSubscription(defaultSub);
      return;
    }

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
      const productId = data?.product_id ?? null;
      setSubscription({
        subscribed: !!data?.subscribed,
        productId,
        tier: (productId && TIERS_MAP[productId]) || "free",
        subscriptionEnd: data?.subscription_end ?? null,
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
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && newSession?.user) {
          linkReferral(newSession.user.id);
          identifyUser(newSession.user.id, { email: newSession.user.email });
          setSentryUser(newSession.user.id, newSession.user.email);

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
          clearSentryUser();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

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
      {children}
    </AuthContext.Provider>
  );
}
