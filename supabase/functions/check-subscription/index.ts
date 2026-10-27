import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEMBERSHIP_PRODUCT_IDS = new Set([
  "prod_UDBbsFCvpYtvUN",
  "prod_U9Pqh2vkb2wrNR",
  "prod_U9Pr8k3iP6Bler",
]);

/** Stripe product → app tier. Mirrors TIERS_MAP in src/contexts/AuthContext.tsx. */
const PRODUCT_TIERS: Record<string, string> = {
  prod_UDBbsFCvpYtvUN: "rooted",
  prod_U9Pqh2vkb2wrNR: "nourished",
  prod_U9Pr8k3iP6Bler: "thriving",
};

const FREE_RESPONSE = {
  subscribed: false,
  tier: "free",
  product_id: null,
  subscription_end: null,
  source: null,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return json(FREE_RESPONSE);

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.email) return json(FREE_RESPONSE);
    const user = userData.user;
    const email = user.email as string;

    // 1. Manual/complimentary grant wins over everything, and works with no
    //    Stripe account, key, product or price in existence.
    const { data: grants, error: grantError } = await supabaseClient
      .rpc("active_membership_grant", { p_email: email });

    if (grantError) {
      console.warn("[check-subscription] grant lookup failed:", grantError.message);
    }

    const grant = Array.isArray(grants) ? grants[0] : grants;
    if (grant?.tier) {
      return json({
        subscribed: true,
        tier: grant.tier,
        product_id: null,
        subscription_end: grant.expires_at ?? null,
        source: "manual",
      });
    }

    // 2. Stripe. Optional — until billing is switched on every member simply
    //    resolves to free instead of surfacing a 500 on every page load.
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return json(FREE_RESPONSE);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return json(FREE_RESPONSE);
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 20,
    });

    const membershipSub = subscriptions.data.find(
      (sub: Stripe.Subscription & { current_period_end?: number | string }) =>
        sub.items.data.some((item: Stripe.SubscriptionItem) => {
          const productId = typeof item.price.product === "string"
            ? item.price.product
            : item.price.product?.id;
          return !!productId && MEMBERSHIP_PRODUCT_IDS.has(productId);
        })
    );

    if (!membershipSub) {
      return json(FREE_RESPONSE);
    }

    let subscriptionEnd: string | null = null;
    try {
      const endMs = typeof membershipSub.current_period_end === "number"
        ? membershipSub.current_period_end * 1000
        : Date.parse(String(membershipSub.current_period_end));
      if (!isNaN(endMs)) {
        subscriptionEnd = new Date(endMs).toISOString();
      }
    } catch { /* leave null */ }

    const membershipItem = membershipSub.items.data.find((item: Stripe.SubscriptionItem) => {
      const itemProductId = typeof item.price.product === "string"
        ? item.price.product
        : item.price.product?.id;
      return !!itemProductId && MEMBERSHIP_PRODUCT_IDS.has(itemProductId);
    });

    const productId = membershipItem
      ? (typeof membershipItem.price.product === "string"
          ? membershipItem.price.product
          : membershipItem.price.product?.id) ?? null
      : null;

    return json({
      subscribed: true,
      tier: (productId && PRODUCT_TIERS[productId]) || "free",
      product_id: productId,
      subscription_end: subscriptionEnd,
      source: "stripe",
    });
  } catch (error) {
    // Deliberately a non-2xx: AuthContext keeps the previously resolved tier on
    // error, so a transient failure can never knock a paid member down to free.
    console.error("[check-subscription] error:", (error as Error).message);
    return json({ ...FREE_RESPONSE, error: (error as Error).message }, 500);
  }
});
