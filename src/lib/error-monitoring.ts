import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";

let initialised = false;

export function initSentry() {
  if (initialised || !SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance tracing — sample 20% of transactions in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session replay — capture 10% of sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Only send errors in production
    enabled: import.meta.env.PROD,
    environment: import.meta.env.MODE,
  });

  initialised = true;
}

/**
 * Set user context for error reports.
 * Call after successful auth.
 */
export function setSentryUser(userId: string, email?: string) {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export { Sentry };
