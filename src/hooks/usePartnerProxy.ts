import { supabase } from "@/integrations/supabase/client";

/**
 * Stores the partner's PIN hash in memory for the session.
 * This is NOT persisted — partner must re-enter PIN each session.
 */
let _pinHash: string | null = null;
let _connectionId: string | null = null;

export function setPartnerSession(connectionId: string, pinHash: string) {
  _connectionId = connectionId;
  _pinHash = pinHash;
}

export function clearPartnerSession() {
  _connectionId = null;
  _pinHash = null;
}

export function getPartnerSession() {
  return { connectionId: _connectionId, pinHash: _pinHash };
}

export function isPartnerSession() {
  return !!_pinHash && !!_connectionId;
}

/**
 * Call the partner-proxy edge function.
 * Automatically attaches connection_id + pin_hash for auth.
 */
export async function partnerProxy<T = any>(
  action: string,
  payload?: Record<string, any>,
  overrides?: { connection_id?: string; join_code?: string; pin_hash?: string }
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("connect-partner-proxy", {
    body: {
      action,
      connection_id: overrides?.connection_id ?? _connectionId,
      pin_hash: overrides?.pin_hash ?? _pinHash,
      join_code: overrides?.join_code,
      payload,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}
