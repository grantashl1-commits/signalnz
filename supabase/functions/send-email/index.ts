import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  welcomeEmail,
  subscriptionConfirmedEmail,
  topupConfirmedEmail,
  renewalEmail,
  planChangedEmail,
  cancellationEmail,
  dripCycleSyncingEmail,
  dripFeedYourMindEmail,
  dripJournalEmail,
  dripParentingEmail,
  dripOneMonthEmail,
} from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Signal <support@mindcast.co.nz>";

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }

  return res.json();
}

// ─── Request body schema ───────────────────────────────────────────────────
// {
//   type: "welcome" | "subscription_confirmed" | "topup_confirmed" |
//         "renewal" | "plan_changed" | "cancelled"
//   to: string          — recipient email
//   name?: string       — recipient first name (optional)
//   tier?: string       — "rooted" | "nourished" | "thriving"
//   oldTier?: string    — for plan_changed
//   nextBillingDate?: string  — for renewal
//   endDate?: string    — for cancelled
// }

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, name, tier, oldTier, nextBillingDate, endDate } = await req.json();

    if (!type || !to) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, to" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let template: { subject: string; html: string };

    switch (type) {
      case "welcome":
        template = welcomeEmail(name);
        break;
      case "subscription_confirmed":
        template = subscriptionConfirmedEmail(tier ?? "rooted", name);
        break;
      case "topup_confirmed":
        template = topupConfirmedEmail(name);
        break;
      case "renewal":
        template = renewalEmail(tier ?? "rooted", nextBillingDate ?? "", name);
        break;
      case "plan_changed":
        template = planChangedEmail(tier ?? "rooted", oldTier ?? "free", name);
        break;
      case "cancelled":
        template = cancellationEmail(tier ?? "rooted", endDate ?? "", name);
        break;
      case "drip_cycle":
        template = dripCycleSyncingEmail(name);
        break;
      case "drip_feed":
        template = dripFeedYourMindEmail(name);
        break;
      case "drip_journal":
        template = dripJournalEmail(name);
        break;
      case "drip_parenting":
        template = dripParentingEmail(name);
        break;
      case "drip_one_month":
        template = dripOneMonthEmail(name);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const result = await sendViaResend(to, template.subject, template.html);
    console.log(`[SEND-EMAIL] Sent ${type} to ${to}`, result);

    return new Response(JSON.stringify({ sent: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[SEND-EMAIL] Error:", (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
