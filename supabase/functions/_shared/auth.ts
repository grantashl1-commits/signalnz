// Shared caller checks for edge functions deployed with verify_jwt = false.
// Every function that spends AI credit, writes with the service role or reads
// member data must know who is calling: a signed-in member (requireUser) or an
// admin (requireAdmin). Both return a Response to send back as-is on failure.
import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

const deny = (status: number, error: string, cors: Record<string, string>) =>
  new Response(JSON.stringify({ error }), { status, headers: { ...cors, "Content-Type": "application/json" } });

export async function requireUser(req: Request, cors: Record<string, string>): Promise<{ user: User; sb: SupabaseClient } | Response> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return deny(401, "Please sign in.", cors);
  const sb = serviceClient();
  const { data, error } = await sb.auth.getUser(token);
  // The publishable (anon) key is a valid JWT but not a user, so it fails here too.
  if (error || !data.user) return deny(401, "Please sign in.", cors);
  return { user: data.user, sb };
}

export async function requireAdmin(req: Request, cors: Record<string, string>): Promise<{ user: User; sb: SupabaseClient } | Response> {
  const caller = await requireUser(req, cors);
  if (caller instanceof Response) return caller;
  const { data } = await caller.sb.from("user_roles").select("role").eq("user_id", caller.user.id).eq("role", "admin").maybeSingle();
  if (!data) return deny(403, "Admin only.", cors);
  return caller;
}
