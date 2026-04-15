import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData } = await anonClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { code } = await req.json();
    if (!code) throw new Error("Gift code is required");

    // Look up the gift code
    const { data: gift, error: giftError } = await adminClient
      .from("gift_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (giftError || !gift) throw new Error("Invalid gift code");
    if (gift.redeemed_at) throw new Error("This gift code has already been redeemed");

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + gift.duration_months);

    // Mark as redeemed
    await adminClient
      .from("gift_codes")
      .update({
        redeemed_at: now.toISOString(),
        redeemed_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", gift.id);

    return new Response(JSON.stringify({
      success: true,
      tier: gift.tier,
      duration_months: gift.duration_months,
      expires_at: expiresAt.toISOString(),
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
