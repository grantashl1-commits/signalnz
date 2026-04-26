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

const TOPUP_PRODUCT_ID = "prod_U9PrdS82rTl5Bw";
const TOPUP_CREDITS = 50;

const PRODUCT_TIER_MAP: Record<string, { tier: string; credits: number }> = {
  "prod_UDBbsFCvpYtvUN": { tier: "rooted",    credits: 30  },
  "prod_U9Pqh2vkb2wrNR": { tier: "nourished", credits: 150 },
  "prod_U9Pr8k3iP6Bler": { tier: "thriving",  credits: 500 },
};

// ─── Email helper ──────────────────────────────────────────────────────────

async function sendEmail(supabaseUrl: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Internal function-to-function call — no auth header needed with service role
        apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      logStep("Email send failed", { status: res.status, body: txt });
    } else {
      logStep("Email sent", { type: payload.type, to: payload.to });
    }
  } catch (e) {
    logStep("Email send error", { message: (e as Error).message });
  }
}

// Look up user email + display name from Supabase auth/profile
async function resolveUser(
  supabase: any,
  stripeCustomerId: string | null,
  stripe: Stripe,
  customerEmail?: string | null
) {
  const email = customerEmail ?? await (async () => {
    if (!stripeCustomerId) return null;
    const customer = await stripe.customers.retrieve(stripeCustomerId as string);
    return (customer as Stripe.Customer).email ?? null;
  })();

  if (!email) return { email: null, name: undefined };

  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users?.find((u) => u.email === email);
  let name: string | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    name = (profile as any)?.display_name?.split(" ")[0] || undefined;
  }

  return { email, name };
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-NZ", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Main handler ──────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  try {
    let event: Stripe.Event;

    if (webhookSecret) {
      const body = await req.text();
      const sig = req.headers.get("stripe-signature");
      if (!sig) throw new Error("Missing stripe-signature header");
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      const body = await req.json();
      event = body as Stripe.Event;
      logStep("WARNING: No webhook secret, running unverified");
    }

    logStep("Event received", { type: event.type, id: event.id });

    // ── checkout.session.completed ─────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const mode = session.mode;

      logStep("Checkout completed", { mode, email: customerEmail });

      if (!customerEmail) {
        logStep("No customer email found, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email === customerEmail);
      const userIdentifier = user?.id || customerEmail;

      let name: string | undefined;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        name = (profile as any)?.display_name?.split(" ")[0] || undefined;
      }

      logStep("User lookup", { userIdentifier, found: !!user });

      if (mode === "payment") {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        const isTopup = lineItems.data.some((li: any) => li.price?.product === TOPUP_PRODUCT_ID);

        if (isTopup) {
          logStep("Processing top-up", { credits: TOPUP_CREDITS });

          const { data: existing } = await supabase
            .from("ai_credits")
            .select("*")
            .eq("user_identifier", userIdentifier)
            .maybeSingle();

          if (existing) {
            await supabase.from("ai_credits").update({
              credits_remaining: (existing.credits_remaining || 0) + TOPUP_CREDITS,
              last_topup_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }).eq("user_identifier", userIdentifier);
          } else {
            await supabase.from("ai_credits").insert({
              user_identifier: userIdentifier,
              credits_remaining: TOPUP_CREDITS,
              tier: "free",
              last_topup_at: new Date().toISOString(),
            });
          }
          logStep("Top-up credits added successfully");

          await sendEmail(supabaseUrl, { type: "topup_confirmed", to: customerEmail, name });
        }
      } else if (mode === "subscription") {
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

        const { data: existing } = await supabase
          .from("ai_credits")
          .select("*")
          .eq("user_identifier", userIdentifier)
          .maybeSingle();

        if (existing) {
          await supabase.from("ai_credits").update({
            credits_remaining: tierInfo.credits,
            tier: tierInfo.tier,
            updated_at: new Date().toISOString(),
          }).eq("user_identifier", userIdentifier);
        } else {
          await supabase.from("ai_credits").insert({
            user_identifier: userIdentifier,
            credits_remaining: tierInfo.credits,
            tier: tierInfo.tier,
          });
        }
        logStep("Subscription credits set successfully");

        await sendEmail(supabaseUrl, {
          type: "subscription_confirmed",
          to: customerEmail,
          name,
          tier: tierInfo.tier,
        });
      }
    }

    // ── invoice.payment_succeeded — monthly renewal ────────────────────────
    else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      // Only fire for subscription renewals, not the initial payment
      if ((invoice as any).billing_reason === "subscription_create") {
        logStep("Skipping initial invoice (handled by checkout.session.completed)");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { email, name } = await resolveUser(
        supabase, invoice.customer as string, stripe, invoice.customer_email
      );
      if (!email) {
        logStep("No email for invoice renewal, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Derive tier from invoice line items
      let tier = "rooted";
      for (const line of invoice.lines?.data ?? []) {
        const productId = typeof (line.price as any)?.product === "string"
          ? (line.price as any).product : "";
        if (PRODUCT_TIER_MAP[productId]) {
          tier = PRODUCT_TIER_MAP[productId].tier;
          break;
        }
      }

      // Reset credits for the new billing period
      const tierCredits = PRODUCT_TIER_MAP[
        Object.keys(PRODUCT_TIER_MAP).find(k => PRODUCT_TIER_MAP[k].tier === tier) ?? ""
      ]?.credits ?? 30;

      const userIdentifier = email;
      await supabase.from("ai_credits").update({
        credits_remaining: tierCredits,
        updated_at: new Date().toISOString(),
      }).eq("user_identifier", userIdentifier);

      const sub = invoice.subscription
        ? await stripe.subscriptions.retrieve(invoice.subscription as string)
        : null;
      const nextBillingDate = sub?.current_period_end
        ? formatDate(sub.current_period_end)
        : "";

      logStep("Renewal processed", { email, tier, nextBillingDate });

      await sendEmail(supabaseUrl, {
        type: "renewal",
        to: email,
        name,
        tier,
        nextBillingDate,
      });
    }

    // ── customer.subscription.updated — plan change ────────────────────────
    else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const prevAttributes = (event.data as any).previous_attributes;

      // Only act on actual plan/item changes
      const itemsChanged = prevAttributes?.items !== undefined;
      if (!itemsChanged) {
        logStep("Subscription updated but items unchanged, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { email, name } = await resolveUser(
        supabase, sub.customer as string, stripe
      );
      if (!email) {
        logStep("No email for subscription update, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Current tier from subscription items
      let newTier = "rooted";
      for (const item of sub.items.data) {
        const productId = typeof (item.price as any)?.product === "string"
          ? (item.price as any).product : "";
        if (PRODUCT_TIER_MAP[productId]) {
          newTier = PRODUCT_TIER_MAP[productId].tier;
          break;
        }
      }

      // Previous tier — try to get from ai_credits table
      const { data: creditsRow } = await supabase
        .from("ai_credits")
        .select("tier")
        .eq("user_identifier", email)
        .maybeSingle();
      const oldTier = (creditsRow as any)?.tier ?? "rooted";

      // Update credits to new tier
      const newCredits = PRODUCT_TIER_MAP[
        Object.keys(PRODUCT_TIER_MAP).find(k => PRODUCT_TIER_MAP[k].tier === newTier) ?? ""
      ]?.credits ?? 30;

      await supabase.from("ai_credits").update({
        tier: newTier,
        credits_remaining: newCredits,
        updated_at: new Date().toISOString(),
      }).eq("user_identifier", email);

      logStep("Plan change processed", { email, oldTier, newTier });

      await sendEmail(supabaseUrl, {
        type: "plan_changed",
        to: email,
        name,
        tier: newTier,
        oldTier,
      });
    }

    // ── customer.subscription.deleted — cancellation ───────────────────────
    else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;

      const { email, name } = await resolveUser(
        supabase, sub.customer as string, stripe
      );
      if (!email) {
        logStep("No email for cancellation, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let tier = "rooted";
      for (const item of sub.items.data) {
        const productId = typeof (item.price as any)?.product === "string"
          ? (item.price as any).product : "";
        if (PRODUCT_TIER_MAP[productId]) {
          tier = PRODUCT_TIER_MAP[productId].tier;
          break;
        }
      }

      // Downgrade to free in database
      await supabase.from("ai_credits").update({
        tier: "free",
        updated_at: new Date().toISOString(),
      }).eq("user_identifier", email);

      const endDate = sub.current_period_end
        ? formatDate(sub.current_period_end)
        : "";

      logStep("Cancellation processed", { email, tier, endDate });

      await sendEmail(supabaseUrl, {
        type: "cancelled",
        to: email,
        name,
        tier,
        endDate,
      });
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
