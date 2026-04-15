import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const scriptId = String(body?.scriptId || "").trim();
    const contentType = String(body?.contentType || "audio/mpeg").trim();
    const base64Data = String(body?.base64Data || "").trim();

    if (!scriptId || !base64Data) {
      return jsonResponse({ error: "Missing required fields: scriptId, base64Data" }, 400);
    }

    const cleanedBase64 = base64Data.includes(",") ? base64Data.split(",").pop() || "" : base64Data;
    const binary = Uint8Array.from(atob(cleanedBase64), (char) => char.charCodeAt(0));
    const filePath = `custom/${user.id}/${scriptId}`;

    const { error: uploadError } = await admin.storage.from("practice-audio").upload(filePath, binary, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      return jsonResponse({ error: uploadError.message }, 500);
    }

    const { data: signedData } = await admin.storage.from("practice-audio").createSignedUrl(filePath, 3600);

    return jsonResponse({ audioUrl: signedData?.signedUrl, filePath });
  } catch (error) {
    console.error("script-audio-upload error", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});