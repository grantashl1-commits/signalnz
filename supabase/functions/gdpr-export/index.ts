import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const TABLES_WITH_USER_ID = [
  "profiles", "journal_entries", "vault_entries", "journal_milestones",
  "cycle_logs", "habit_completions", "habit_logs", "mindfulness_logs",
  "sleep_logs", "hr_sessions", "body_measurements", "dream_boards",
  "plant_diversity_log", "generated_plans", "user_plans", "plan_generations",
  "user_goals", "goal_progress", "weekly_checkins", "community_posts",
  "community_comments", "community_hearts", "community_profiles",
  "community_memberships", "partner_connections", "connect_messages",
  "nps_responses", "feedback", "referrals", "user_saved_recipes",
  "shopping_lists", "signal_messages", "member_stoic_progress",
  "user_locations",
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

    const exportData: Record<string, unknown> = {
      account: { id: user.id, email: user.email, created_at: user.created_at },
    };

    // Fetch all user_id tables
    for (const table of TABLES_WITH_USER_ID) {
      const col = table === "partner_connections" ? "member_user_id" : 
                  table === "referrals" ? "referrer_id" : "user_id";
      const { data } = await supabaseAdmin.from(table).select("*").eq(col, user.id);
      if (data && data.length > 0) exportData[table] = data;
    }

    // Fetch user_identifier tables
    for (const table of TABLES_WITH_USER_IDENTIFIER) {
      const { data } = await supabaseAdmin.from(table).select("*").eq("user_identifier", user.id);
      if (data && data.length > 0) exportData[table] = data;
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="signal-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
