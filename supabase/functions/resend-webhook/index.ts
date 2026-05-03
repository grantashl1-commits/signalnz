// Resend webhook handler — receives delivery events for all Signal emails
// Currently handles: email.bounced, email.complained (marks profile as invalid)
// Configure in Resend dashboard → Settings → Webhooks

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET")!;

// Verify Resend's svix signature to reject forged requests
async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET) return true; // skip in local dev if secret not set

  const msgId        = req.headers.get("svix-id") ?? "";
  const msgTimestamp = req.headers.get("svix-timestamp") ?? "";
  const msgSignature = req.headers.get("svix-signature") ?? "";

  const toSign = `${msgId}.${msgTimestamp}.${rawBody}`;
  const secret = RESEND_WEBHOOK_SECRET.startsWith("whsec_")
    ? RESEND_WEBHOOK_SECRET.slice(6)
    : RESEND_WEBHOOK_SECRET;

  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(secret), c => c.charCodeAt(0)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(toSign)
  );
  const computed = "v1," + btoa(String.fromCharCode(...new Uint8Array(sig)));

  // svix-signature may contain multiple space-separated sigs
  return msgSignature.split(" ").includes(computed);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();

  const valid = await verifySignature(req, rawBody);
  if (!valid) {
    console.warn("[RESEND-WEBHOOK] Invalid signature — request rejected");
    return new Response("Unauthorized", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.type ?? "";
  const emailAddress: string = event.data?.to?.[0] ?? event.data?.email_id ?? "";

  console.log(`[RESEND-WEBHOOK] ${eventType} → ${emailAddress}`);

  // Only act on hard bounces and spam complaints — these mean the address is unusable
  if (eventType === "email.bounced" || eventType === "email.complained") {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Find the user by email and mark their profile
    const { data: user } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", emailAddress)
      .maybeSingle();

    if (user) {
      await supabase
        .from("profiles")
        .update({ email_invalid: true, email_invalid_reason: eventType })
        .eq("id", user.id);

      console.log(`[RESEND-WEBHOOK] Marked ${emailAddress} as invalid (${eventType})`);
    } else {
      // Try auth.users directly if not in profiles
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const match = authUsers?.users.find(u => u.email === emailAddress);
      if (match) {
        await supabase
          .from("profiles")
          .upsert({ id: match.id, email_invalid: true, email_invalid_reason: eventType });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
