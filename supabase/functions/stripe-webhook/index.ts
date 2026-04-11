import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

// Top-up product ID from STRIPE_TIERS
const TOPUP_PRODUCT_ID = "prod_U9PrdS82rTl5Bw";
const TOPUP_CREDITS = 50;

// Subscription product → tier + monthly credits
const PRODUCT_TIER_MAP: Record<string, { tier: string; credits: number }> = {
  "prod_UDBbsFCvpYtvUN": { tier: "rooted", credits: 30 },
  "prod_U9Pqh2vkb2wrNR": { tier: "nourished", credits: 150 },
  "prod_U9Pr8k3iP6Bler": { tier: "thriving", credits: 500 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    let event: Stripe.Event;

    if (webhookSecret) {
      const body = await req.text();
      const sig = req.headers.get("stripe-signature");
      if (!sig) throw new Error("Missing stripe-signature header");
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Fallback: parse without verification (dev mode)
      const body = await req.json();
      event = body as Stripe.Event;
      logStep("WARNING: No webhook secret, running unverified");
    }

    logStep("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const mode = session.mode; // "payment" or "subscription"

      logStep("Checkout completed", { mode, email: customerEmail });

      if (!customerEmail) {
        logStep("No customer email found, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up user by email
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email === customerEmail);
      const userIdentifier = user?.id || customerEmail;

      logStep("User lookup", { userIdentifier, found: !!user });

      if (mode === "payment") {
        // One-off top-up: add 50 credits
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        const isTopup = lineItems.data.some((li) => {
          const price = li.price;
          return price?.product === TOPUP_PRODUCT_ID;
        });

        if (isTopup) {
          logStep("Processing top-up", { credits: TOPUP_CREDITS });

          const { data: existing } = await supabase
            .from("ai_credits")
            .select("*")
            .eq("user_identifier", userIdentifier)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("ai_credits")
              .update({
                credits_remaining: (existing.credits_remaining || 0) + TOPUP_CREDITS,
                last_topup_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_identifier", userIdentifier);
          } else {
            await supabase.from("ai_credits").insert({
              user_identifier: userIdentifier,
              credits_remaining: TOPUP_CREDITS,
              tier: "free",
              last_topup_at: new Date().toISOString(),
            });
          }
          logStep("Top-up credits added successfully");
        }
      } else if (mode === "subscription") {
        // New subscription: set tier and reset credits
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        let tierInfo = { tier: "rooted", credits: 30 };

        for (const li of lineItems.data) {
          const productId = typeof li.price?.product === "string" ? li.price.product : "";
          if (PRODUCT_TIER_MAP[productId]) {
            tierInfo = PRODUCT_TIER_MAP[productId];
            break;
          }
        }

        logStep("Setting subscription tier", tierInfo);

        const creditValue = tierInfo.credits;
        const tierValue = tierInfo.tier;

        const { data: existing } = await supabase
          .from("ai_credits")
          .select("*")
          .eq("user_identifier", userIdentifier)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("ai_credits")
            .update({
              credits_remaining: creditValue,
              tier: tierValue,
              updated_at: new Date().toISOString(),
            })
            .eq("user_identifier", userIdentifier);
        } else {
          await supabase.from("ai_credits").insert({
            user_identifier: userIdentifier,
            credits_remaining: creditValue,
            tier: tierValue,
          });
        }
        logStep("Subscription credits set successfully");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
