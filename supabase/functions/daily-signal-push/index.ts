import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Scheduled function: sends a morning push notification to all users
 * with active push tokens, nudging them to check their daily Signal.
 * Intended to be called via pg_cron every day at 7:00 AM NZST.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all distinct user IDs with active tokens
    const { data: tokenRows, error } = await supabaseAdmin
      .from("push_tokens")
      .select("user_id")
      .eq("active", true);

    if (error) throw error;
    if (!tokenRows?.length) {
      return new Response(JSON.stringify({ message: "No users with push tokens" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = [...new Set(tokenRows.map((r) => r.user_id))];

    // Call send-push to deliver the notification
    const { data: result, error: pushErr } = await supabaseAdmin.functions.invoke("send-push", {
      body: {
        user_ids: userIds,
        title: "Your Daily Signal is Ready ✨",
        body: "A moment of wisdom is waiting for you. Tap to receive today's Signal.",
        data: { route: "/", type: "daily_signal" },
      },
    });

    if (pushErr) throw pushErr;

    return new Response(JSON.stringify({ users: userIds.length, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
