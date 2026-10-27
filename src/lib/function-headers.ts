import { supabase } from "@/integrations/supabase/client";

/**
 * Headers for calling an edge function with fetch (streaming or audio responses
 * that supabase.functions.invoke can't return). Sends the member's session so
 * the function knows who is asking; falls back to the publishable key when
 * signed out, which the function then treats as a guest.
 */
export async function functionHeaders(): Promise<Record<string, string>> {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${session?.access_token ?? key}`,
  };
}
