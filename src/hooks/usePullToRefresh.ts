import { useState, useRef, useCallback, type TouchEvent } from "react";
import { haptic } from "@/hooks/use-mobile";

interface Options {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 70 }: Options) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!startYRef.current) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0 && scrollRef.current?.scrollTop === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(delta * 0.5, threshold * 1.2));
    }
  }, [threshold]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      haptic("medium");
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
    startYRef.current = 0;
  }, [pullDistance, threshold, refreshing, onRefresh]);

  return { scrollRef, isPulling, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}
