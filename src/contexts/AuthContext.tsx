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
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });
      if (error) throw error;
      const productId = data?.product_id ?? null;
      setSubscription({
        subscribed: !!data?.subscribed,
        productId,
        tier: (productId && TIERS_MAP[productId]) || "free",
        subscriptionEnd: data?.subscription_end ?? null,
      });
    } catch {
      setSubscription(defaultSub);
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
          // Identify user in analytics & error monitoring
          identifyUser(newSession.user.id, { email: newSession.user.email });
          setSentryUser(newSession.user.id, newSession.user.email);
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
