import { useRef, useCallback, type TouchEvent } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Minimum px traveled to register a swipe (default 50) */
  threshold?: number;
  /** Maximum px in the perpendicular axis to still count (default 80) */
  maxPerpendicular?: number;
}

/**
 * useSwipe — lightweight touch swipe detector.
 * Spread the returned `bind` onto any element to detect 4-direction swipes.
 *
 *   const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });
 *   <div {...swipe.bind}>…</div>
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  maxPerpendicular = 80,
}: SwipeHandlers) {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Ignore multi-touch (pinch-zoom etc.)
    if (e.touches.length !== 1) {
      startRef.current = null;
      return;
    }
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      // Horizontal swipe
      if (absX >= threshold && absY <= maxPerpendicular) {
        if (dx < 0) onSwipeLeft?.();
        else onSwipeRight?.();
        return;
      }
      // Vertical swipe
      if (absY >= threshold && absX <= maxPerpendicular) {
        if (dy < 0) onSwipeUp?.();
        else onSwipeDown?.();
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, maxPerpendicular],
  );

  return {
    bind: { onTouchStart, onTouchEnd },
  };
}
