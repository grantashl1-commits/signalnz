import * as Sentry from "@sentry/react";

/**
 * Set user context for error reports.
 * Call after successful auth.
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

export { Sentry };
