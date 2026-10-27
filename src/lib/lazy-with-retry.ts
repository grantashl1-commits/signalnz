import { lazy, type ComponentType } from "react";

/**
 * Route-level code splitting, with recovery.
 *
 * Every page in App.tsx is a `lazy(() => import(...))`. When that import fails,
 * React throws and the root AppErrorBoundary shows the "Something went wrong"
 * crash screen — which is exactly what a member sees if the chunk fetch fails
 * once. It then works on refresh, because a refresh re-reads index.html and
 * picks up the current chunk filenames.
 *
 * A loading animation cannot fix this. Suspense's fallback only covers the
 * *slow* case; a rejected import still throws, and the boundary renders whatever
 * spinner was on screen first and then the crash screen. The failure has to be
 * handled, not decorated.
 *
 * Two failure modes, two remedies:
 *
 * 1. A transient network blip — retrying the import a moment later almost always
 *    succeeds. That alone fixes most cases with no visible interruption.
 * 2. A deploy replaced the hashed chunk files while the tab was open. The old
 *    index.html still points at filenames that no longer exist, so retrying can
 *    never succeed. Only a reload helps, and it is safe to do automatically —
 *    guarded so a genuinely broken build cannot put the tab in a reload loop.
 */

const RELOAD_KEY = "signal:chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

/** Errors browsers raise when a dynamic import cannot be fetched. */
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|Loading chunk|Loading CSS chunk|ChunkLoadError|Failed to fetch|NetworkError|error loading dynamically imported module/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = String((error as Error)?.message ?? error ?? "");
  const name = String((error as Error)?.name ?? "");
  return CHUNK_ERROR.test(message) || CHUNK_ERROR.test(name);
}

/**
 * Wrap a dynamic import so a failed chunk fetch recovers instead of crashing.
 *
 * Returning a promise that never settles while we reload keeps Suspense's
 * loading state on screen, so the member never sees the crash screen flash.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  attempts = 3,
) {
  return lazy(async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await factory();
      } catch (error) {
        lastError = error;
        // A non-chunk error (a real bug in the module) will not be fixed by
        // retrying, so surface it immediately.
        if (!isChunkLoadError(error)) throw error;
        if (attempt < attempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
      }
    }

    // Chunks are gone (a new deploy) or the network is down for good. Reload to
    // pick up the current index.html, at most once per cooldown window.
    if (typeof window !== "undefined") {
      let lastReload = 0;
      try {
        lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
      } catch {
        // sessionStorage can throw in private mode; fall through to the reload.
      }
      if (Date.now() - lastReload > RELOAD_COOLDOWN_MS) {
        try {
          window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        window.location.reload();
        return new Promise<never>(() => {});
      }
    }

    throw lastError;
  });
}
