import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  /** Disable on desktop / when not needed */
  enabled?: boolean;
}

/**
 * Window-scroll pull-to-refresh indicator.
 * Drop near the top of a page: <PullToRefresh onRefresh={...} />
 * Listens to touch events on document — only triggers when scrollY === 0.
 */
export default function PullToRefresh({ onRefresh, threshold = 70, enabled = true }: Props) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const triggeredHapticRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    haptic("medium");
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && !refreshing) {
        startYRef.current = e.touches[0].clientY;
        triggeredHapticRef.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current == null || refreshing) return;
      if (window.scrollY > 0) {
        startYRef.current = null;
        setPullDistance(0);
        return;
      }
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        const dampened = Math.min(delta * 0.5, threshold * 1.4);
        setPullDistance(dampened);
        if (dampened >= threshold && !triggeredHapticRef.current) {
          haptic("light");
          triggeredHapticRef.current = true;
        }
      }
    };

    const onTouchEnd = () => {
      if (startYRef.current == null) return;
      const reached = pullDistance >= threshold;
      startYRef.current = null;
      if (reached && !refreshing) {
        handleRefresh();
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, pullDistance, threshold, refreshing, handleRefresh]);

  if (!enabled) return null;

  const visible = pullDistance > 4 || refreshing;
  const progress = Math.min(pullDistance / threshold, 1);
  const showRelease = pullDistance >= threshold;

  return (
    <div
      aria-hidden={!visible}
      className="fixed inset-x-0 top-0 z-[120] flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${refreshing ? 16 : Math.max(0, pullDistance - 20)}px)`,
        opacity: visible ? 1 : 0,
        transition: refreshing || pullDistance === 0 ? "transform 240ms ease, opacity 240ms ease" : "none",
      }}
    >
      <div
        className="mt-2 h-10 w-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {refreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowDown
            className="h-4 w-4 transition-transform"
            style={{
              transform: `rotate(${showRelease ? 180 : progress * 180}deg)`,
              opacity: 0.5 + progress * 0.5,
            }}
          />
        )}
      </div>
    </div>
  );
}
