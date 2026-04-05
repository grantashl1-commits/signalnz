import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

export function useScrollMemory(scrollRef: React.RefObject<HTMLElement>) {
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = pathRef.current;
    return () => {
      if (scrollRef.current) {
        scrollPositions.set(currentPath, scrollRef.current.scrollTop);
      }
    };
  }, []);

  useEffect(() => {
    const saved = scrollPositions.get(location.pathname);
    if (scrollRef.current && saved !== undefined) {
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = saved;
      });
    }
  }, []);
}
