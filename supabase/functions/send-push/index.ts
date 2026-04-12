import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

/* ── Google OAuth2 token for FCM v1 ── */
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const encoder = new TextEncoder();
  const signingInput = encoder.encode(`${header}.${payload}`);

  // Import the RSA private key
  const pemBody = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, signingInput);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${header}.${payload}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Failed to get FCM access token");
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is authenticated or service role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_ids, title, body, data } = await req.json();
    if (!user_ids?.length || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing user_ids, title, or body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get FCM service account
    const serviceAccountJson = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "FCM not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    // Fetch active tokens for the given users
    const { data: tokens, error: tokErr } = await supabaseAdmin
      .from("push_tokens")
      .select("token, platform, user_id")
      .in("user_id", user_ids)
      .eq("active", true);

    if (tokErr) throw tokErr;
    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "No active tokens" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to each device via FCM v1
    let sent = 0;
    let failed = 0;
    const staleTokens: string[] = [];

    for (const t of tokens) {
      const message: any = {
        message: {
          token: t.token,
          notification: { title, body },
          ...(data ? { data } : {}),
          android: {
            priority: "high",
            notification: { sound: "default", channel_id: "signal_daily" },
          },
          apns: {
            payload: { aps: { sound: "default", badge: 1 } },
          },
        },
      };

      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

      if (res.ok) {
        sent++;
      } else {
        const err = await res.json();
        // Token is stale — mark inactive
        if (
          err?.error?.details?.some(
            (d: any) => d.errorCode === "UNREGISTERED" || d.errorCode === "INVALID_ARGUMENT"
          )
        ) {
          staleTokens.push(t.token);
        }
        failed++;
      }
    }

    // Deactivate stale tokens
    if (staleTokens.length) {
      await supabaseAdmin
        .from("push_tokens")
        .update({ active: false })
        .in("token", staleTokens);
    }

    return new Response(
      JSON.stringify({ sent, failed, stale_cleaned: staleTokens.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
