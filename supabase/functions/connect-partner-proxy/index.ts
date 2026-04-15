import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Partner Proxy — Validates join_code + PIN hash, then performs
 * DB operations on behalf of the unauthenticated partner using service role.
 *
 * Actions:
 *   verify_pin       — verify code+PIN, link connection, return connection_id
 *   load_reflections — fetch reflections for connection
 *   insert_reflection — insert a reflection row
 *   delete_reflections — clear thread for new conversation
 *   load_messages    — fetch chat messages
 *   insert_message   — insert a chat message
 *   load_progress    — fetch course progress
 *   upsert_progress  — upsert course activity progress
 *   load_checkins    — fetch weekly check-ins
 *   insert_checkin   — insert a weekly check-in
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, join_code, pin_hash, connection_id, payload } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ─── verify_pin: special action that doesn't require a pre-validated connection ───
    if (action === "verify_pin") {
      if (!join_code || !pin_hash) {
        return new Response(JSON.stringify({ error: "Missing code or PIN" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabaseAdmin
        .from("partner_connections")
        .select("id, partner_name, partner_pin_hash, status")
        .eq("join_code", join_code.toUpperCase())
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Connection not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (data.partner_pin_hash !== pin_hash) {
        return new Response(JSON.stringify({ error: "PIN doesn't match" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Link if pending
      if (data.status === "pending") {
        await supabaseAdmin
          .from("partner_connections")
          .update({ status: "linked" })
          .eq("id", data.id);
      }

      return new Response(JSON.stringify({
        connection_id: data.id,
        partner_name: data.partner_name,
        status: "linked",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── All other actions require connection_id + pin_hash for validation ───
    if (!connection_id || !pin_hash) {
      return new Response(JSON.stringify({ error: "Missing connection_id or pin_hash" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate that pin_hash matches the connection
    const { data: conn, error: connErr } = await supabaseAdmin
      .from("partner_connections")
      .select("id, partner_pin_hash, status")
      .eq("id", connection_id)
      .maybeSingle();

    if (connErr || !conn || conn.partner_pin_hash !== pin_hash) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (conn.status !== "linked" && conn.status !== "pending") {
      return new Response(JSON.stringify({ error: "Connection inactive" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Dispatch actions ───
    let result: any = null;

    switch (action) {
      case "load_reflections": {
        const { data } = await supabaseAdmin
          .from("connect_reflections")
          .select("*")
          .eq("connection_id", connection_id)
          .order("created_at", { ascending: true });
        result = data || [];
        break;
      }

      case "insert_reflection": {
        const { data, error } = await supabaseAdmin
          .from("connect_reflections")
          .insert({
            connection_id,
            partner_role: payload?.partner_role || "partner",
            raw_entry: payload?.raw_entry || "",
            cards: payload?.cards || {},
            shared_keys: payload?.shared_keys || [],
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "delete_reflections": {
        await supabaseAdmin
          .from("connect_reflections")
          .delete()
          .eq("connection_id", connection_id);
        result = { deleted: true };
        break;
      }

      case "load_messages": {
        const { data } = await supabaseAdmin
          .from("connect_messages")
          .select("*")
          .eq("connection_id", connection_id)
          .order("created_at", { ascending: true });
        result = data || [];
        break;
      }

      case "insert_message": {
        const { data, error } = await supabaseAdmin
          .from("connect_messages")
          .insert({
            connection_id,
            sender_role: payload?.sender_role || "partner",
            content: payload?.content || "",
            metadata: payload?.metadata || {},
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "load_progress": {
        const { data } = await supabaseAdmin
          .from("connect_partner_progress")
          .select("*")
          .eq("connection_id", connection_id)
          .order("created_at", { ascending: true });
        result = data || [];
        break;
      }

      case "upsert_progress": {
        const { data, error } = await supabaseAdmin
          .from("connect_partner_progress")
          .upsert({
            connection_id,
            partner_role: payload?.partner_role || "partner",
            module_id: payload?.module_id,
            lesson_id: payload?.lesson_id,
            activity_id: payload?.activity_id,
            activity_type: payload?.activity_type || "unknown",
            response: payload?.response || {},
            completed: payload?.completed ?? true,
            shared_to_partner: payload?.shared_to_partner ?? false,
          }, { onConflict: "connection_id,partner_role,activity_id" })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "load_checkins": {
        const { data } = await supabaseAdmin
          .from("connect_checkins")
          .select("*")
          .eq("connection_id", connection_id)
          .order("created_at", { ascending: true });
        result = data || [];
        break;
      }

      case "insert_checkin": {
        const { data, error } = await supabaseAdmin
          .from("connect_checkins")
          .insert({
            connection_id,
            partner_role: payload?.partner_role || "partner",
            week_key: payload?.week_key,
            scores: payload?.scores || {},
            appreciation: payload?.appreciation || null,
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("connect-partner-proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
