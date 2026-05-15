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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    const user = userData.user;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 20,
    });

    const membershipSub = subscriptions.data.find((sub) =>
      sub.items.data.some((item) => {
        const productId = typeof item.price.product === "string" ? item.price.product : item.price.product?.id;
        return !!productId && MEMBERSHIP_PRODUCT_IDS.has(productId);
      })
    );

    const hasActiveSub = !!membershipSub;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const sub = membershipSub!;
      try {
        const endMs = typeof sub.current_period_end === "number"
          ? sub.current_period_end * 1000
          : Date.parse(String(sub.current_period_end));
        if (!isNaN(endMs)) {
          subscriptionEnd = new Date(endMs).toISOString();
        }
      } catch { /* leave null */ }
      const membershipItem = sub.items.data.find((item) => {
        const itemProductId = typeof item.price.product === "string" ? item.price.product : item.price.product?.id;
        return !!itemProductId && MEMBERSHIP_PRODUCT_IDS.has(itemProductId);
      });
      productId = membershipItem
        ? (typeof membershipItem.price.product === "string" ? membershipItem.price.product : membershipItem.price.product?.id) ?? null
        : null;
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
