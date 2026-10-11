import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
export function usePageTab<T extends string>(allowed: readonly T[], fallback: T) {
  const [params, setParams] = useSearchParams();
  const value = params.get("tab") as T;
  const tab = allowed.includes(value) ? value : fallback;
  const setTab = useCallback((next: T) => setParams(prev => {
    const updated = new URLSearchParams(prev); updated.set("tab", next); return updated;
  }), [setParams]);
  return [tab, setTab] as const;
}
