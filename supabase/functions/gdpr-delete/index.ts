import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const TABLES_WITH_USER_ID = [
  "journal_entries", "vault_entries", "journal_milestones",
  "cycle_logs", "habit_completions", "habit_logs", "mindfulness_logs",
  "sleep_logs", "hr_sessions", "body_measurements", "dream_boards",
  "plant_diversity_log", "generated_plans", "user_plans", "plan_generations",
  "goal_progress", "user_goals", "weekly_checkins",
  "community_comments", "community_hearts", "community_posts",
  "community_profiles", "community_memberships",
  "connect_messages", "nps_responses", "feedback", "referrals",
  "user_saved_recipes", "shopping_lists", "signal_messages",
  "member_stoic_progress", "user_locations",
  "profiles",
];

const TABLES_WITH_USER_IDENTIFIER = [
  "ai_credits", "ai_usage", "signal_memory", "user_insight_profiles",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { confirm } = await req.json();
    if (confirm !== "DELETE_MY_ACCOUNT") {
      return new Response(JSON.stringify({ error: "Confirmation required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errors: string[] = [];

    // Delete from connect_messages first (FK dependency)
    // Get partner_connections for this user
    const { data: connections } = await supabaseAdmin
      .from("partner_connections")
      .select("id")
      .or(`member_user_id.eq.${user.id},partner_user_id.eq.${user.id}`);
    
    if (connections && connections.length > 0) {
      for (const conn of connections) {
        await supabaseAdmin.from("connect_messages").delete().eq("connection_id", conn.id);
      }
      await supabaseAdmin.from("partner_connections").delete()
        .or(`member_user_id.eq.${user.id},partner_user_id.eq.${user.id}`);
    }

    // Delete challenge_participants
    await supabaseAdmin.from("challenge_participants").delete().eq("user_id", user.id);

    // Delete from user_id tables
    for (const table of TABLES_WITH_USER_ID) {
      if (table === "connect_messages") continue; // handled above
      const col = table === "referrals" ? "referrer_id" : "user_id";
      const { error } = await supabaseAdmin.from(table).delete().eq(col, user.id);
      if (error) errors.push(`${table}: ${error.message}`);
    }

    // Delete from user_identifier tables
    for (const table of TABLES_WITH_USER_IDENTIFIER) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_identifier", user.id);
      if (error) errors.push(`${table}: ${error.message}`);
    }

    // Delete storage objects (progress-photos, feedback-screenshots)
    for (const bucket of ["progress-photos", "feedback-screenshots"]) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list(user.id);
      if (files && files.length > 0) {
        await supabaseAdmin.storage.from(bucket).remove(files.map(f => `${user.id}/${f.name}`));
      }
    }

    // Delete auth user last
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteAuthErr) errors.push(`auth: ${deleteAuthErr.message}`);

    return new Response(JSON.stringify({ 
      success: true, 
      errors: errors.length > 0 ? errors : undefined 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
