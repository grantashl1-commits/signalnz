import { supabase } from "@/integrations/supabase/client";

let cache: Set<string> | null = null;
let cachePromise: Promise<Set<string>> | null = null;

/**
 * Loads the disposable email domain blocklist (cached per session).
 * Returns a Set of lowercase domain strings.
 */
async function loadDisposableDomains(): Promise<Set<string>> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const { data, error } = await supabase
      .from("disposable_email_domains" as any)
      .select("domain");
    if (error || !data) return new Set<string>();
    const set = new Set<string>(
      (data as any[]).map((r) => String(r.domain).toLowerCase())
    );
    cache = set;
    return set;
  })();

  return cachePromise;
}

/**
 * Returns true if the email's domain is in the disposable blocklist.
 * Use at signup time to reject burner accounts.
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return false;
  const domain = trimmed.slice(at + 1);
  const domains = await loadDisposableDomains();
  return domains.has(domain);
}
