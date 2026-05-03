// Scheduled drip email function — runs daily via pg_cron at 8am NZST
// Sends onboarding sequence emails to users at Day 2, 4, 7, 14, and 30 after signup
// Tracks sends in public.email_sequence_sends to prevent duplicates

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_ADDRESS = "Signal <support@mindcast.co.nz>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Day-offset → email type mapping
const DRIP_SEQUENCE = [
  { dayOffset: 2,  type: "drip_cycle" },
  { dayOffset: 4,  type: "drip_feed" },
  { dayOffset: 7,  type: "drip_journal" },
  { dayOffset: 14, type: "drip_parenting" },
  { dayOffset: 30, type: "drip_one_month" },
];

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let totalSent = 0;
  const errors: string[] = [];

  for (const step of DRIP_SEQUENCE) {
    // Find users who signed up exactly N days ago (within a 24h window)
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - step.dayOffset);
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 1);

    // Get users in the signup window who haven't received this email yet
    const { data: candidates, error: qErr } = await supabase.rpc(
      "get_drip_candidates",
      {
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        email_type: step.type,
      }
    );

    if (qErr) {
      errors.push(`Step ${step.type} query error: ${qErr.message}`);
      continue;
    }

    for (const user of (candidates ?? [])) {
      try {
        // Call the existing send-email function to build & send the template
        const { error: invokeErr } = await supabase.functions.invoke("send-email", {
          body: {
            type: step.type,
            to: user.email,
            name: user.first_name ?? undefined,
          },
        });

        if (invokeErr) throw new Error(invokeErr.message);

        // Record the send so we never duplicate
        await supabase.from("email_sequence_sends").insert({
          user_id: user.id,
          email_type: step.type,
          sent_to: user.email,
        });

        totalSent++;
        console.log(`[DRIP] Sent ${step.type} to ${user.email}`);
      } catch (err) {
        errors.push(`${step.type} → ${user.email}: ${(err as Error).message}`);
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: totalSent, errors }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
