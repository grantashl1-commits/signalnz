import { useEffect, useState } from "react";
import { BLOCKS_CHANGED, cachedBlockedIds, refreshBlockedIds } from "@/lib/community-safety";

/** Members you've blocked, kept current across the community screens. */
export function useBlockedMembers(): Set<string> {
  const [ids, setIds] = useState(cachedBlockedIds);
  useEffect(() => {
    const update = () => setIds(cachedBlockedIds());
    window.addEventListener(BLOCKS_CHANGED, update);
    void refreshBlockedIds();
    return () => window.removeEventListener(BLOCKS_CHANGED, update);
  }, []);
  return ids;
}
