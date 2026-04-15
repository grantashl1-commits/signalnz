import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      return new Response(JSON.stringify({ subscribed: false, one_off_purchases: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ subscribed: false, one_off_purchases: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ subscribed: false, one_off_purchases: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    const user = userData.user;

    // Fetch one-off purchases in parallel with Stripe check
    const purchasesPromise = supabaseClient
      .from("one_off_purchases")
      .select("product_key, ai_access_expires_at")
      .eq("user_id", user.id);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    // Resolve purchases
    const { data: purchases } = await purchasesPromise;
    const oneOffDetails = (purchases ?? []).map((p: any) => ({
      product_key: p.product_key,
      ai_access_expires_at: p.ai_access_expires_at,
    }));
    const oneOffKeys = oneOffDetails.map((d: any) => d.product_key);

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false, one_off_purchases: oneOffKeys }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      try {
        const endMs = typeof sub.current_period_end === "number"
          ? sub.current_period_end * 1000
          : Date.parse(String(sub.current_period_end));
        if (!isNaN(endMs)) {
          subscriptionEnd = new Date(endMs).toISOString();
        }
      } catch { /* leave null */ }
      productId = sub.items.data[0].price.product;
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      one_off_purchases: oneOffKeys,
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
