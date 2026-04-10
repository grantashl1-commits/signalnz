import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid token");

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Unauthorized: admin role required");

    // Fetch Stripe stats
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let stripeStats = null;

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      // Active subscriptions
      const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 });
      const canceledSubs = await stripe.subscriptions.list({ status: "canceled", limit: 100 });

      // Calculate MRR
      let mrr = 0;
      const tierCounts: Record<string, number> = { nourished: 0, thriving: 0, other: 0 };
      const TIERS_MAP: Record<string, string> = {
        prod_U9Pqh2vkb2wrNR: "nourished",
        prod_U9Pr8k3iP6Bler: "thriving",
      };

      for (const sub of activeSubs.data) {
        for (const item of sub.items.data) {
          const amount = item.price?.unit_amount || 0;
          const interval = item.price?.recurring?.interval;
          // Normalize to monthly
          if (interval === "year") {
            mrr += amount / 12;
          } else {
            mrr += amount;
          }
          const prodId = typeof item.price?.product === "string" ? item.price.product : "";
          const tier = TIERS_MAP[prodId] || "other";
          tierCounts[tier]++;
        }
      }

      // Recent charges for revenue
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - 30 * 86400;
      const charges = await stripe.charges.list({
        created: { gte: thirtyDaysAgo },
        limit: 100,
      });
      const monthlyRevenue = charges.data
        .filter(c => c.status === "succeeded")
        .reduce((sum, c) => sum + c.amount, 0);

      stripeStats = {
        activeSubscriptions: activeSubs.data.length,
        canceledSubscriptions: canceledSubs.data.length,
        mrr: Math.round(mrr) / 100, // Convert cents to dollars
        monthlyRevenue: monthlyRevenue / 100,
        tierCounts,
        recentCancellations: canceledSubs.data.slice(0, 5).map(s => ({
          email: s.customer as string,
          canceledAt: s.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null,
        })),
      };
    }

    // Fetch community stats
    const { data: allGroups } = await supabaseClient
      .from("community_groups")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: memberships } = await supabaseClient
      .from("community_memberships")
      .select("*");

    // Fetch user count
    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("id, display_name, suburb, created_at");

    // Fetch AI usage stats
    const { data: aiUsage } = await supabaseClient
      .from("ai_usage")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: aiCredits } = await supabaseClient
      .from("ai_credits")
      .select("*");

    // Feedback stats
    const { data: feedback } = await supabaseClient
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(JSON.stringify({
      stripe: stripeStats,
      community: {
        groups: allGroups || [],
        memberships: memberships || [],
      },
      users: {
        totalProfiles: profiles?.length || 0,
        profiles: profiles || [],
      },
      ai: {
        totalUsage: aiUsage?.length || 0,
        recentUsage: aiUsage?.slice(0, 20) || [],
        credits: aiCredits || [],
      },
      feedback: feedback || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: e.message.includes("Unauthorized") ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
