/**
 * Error monitoring seam. No service is connected yet, so these only log in
 * development; wire a provider in here (and nowhere else) when one is chosen.
 */
export function setMonitoringUser(_userId: string, _email?: string) {}

export function clearMonitoringUser() {}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.error("[signal]", error, context ?? "");
}
