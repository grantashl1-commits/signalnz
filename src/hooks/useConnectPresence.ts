import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PartnerActivity = "idle" | "reflecting" | "writing" | "checking-in";

interface PresenceState {
  partnerOnline: boolean;
  partnerActivity: PartnerActivity;
  partnerLastSeen: number | null;
}

/**
 * Realtime partner presence + lightweight activity broadcast.
 * Uses Supabase presence keyed by role so each side sees the other.
 */
export function useConnectPresence(
  connectionId: string | null,
  myRole: "member" | "partner"
) {
  const [state, setState] = useState<PresenceState>({
    partnerOnline: false,
    partnerActivity: "idle",
    partnerLastSeen: null,
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const activityTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!connectionId) return;
    const otherRole = myRole === "member" ? "partner" : "member";
    const channel = supabase.channel(`presence-${connectionId}`, {
      config: { presence: { key: myRole } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState() as Record<string, any[]>;
        const partnerEntries = presenceState[otherRole] || [];
        const online = partnerEntries.length > 0;
        const latest = partnerEntries[0];
        setState((prev) => ({
          ...prev,
          partnerOnline: online,
          partnerActivity: online ? (latest?.activity as PartnerActivity) || "idle" : "idle",
          partnerLastSeen: online ? Date.now() : prev.partnerLastSeen,
        }));
      })
      .on("broadcast", { event: "activity" }, (payload) => {
        const from = (payload.payload as any)?.role;
        const activity = (payload.payload as any)?.activity as PartnerActivity;
        if (from && from !== myRole) {
          setState((prev) => ({ ...prev, partnerActivity: activity || "idle", partnerLastSeen: Date.now() }));
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role: myRole, activity: "idle", at: Date.now() });
        }
      });

    channelRef.current = channel;
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [connectionId, myRole]);

  /** Broadcast "I'm doing X" to the partner. Auto-clears after 4s of inactivity. */
  const broadcastActivity = (activity: PartnerActivity) => {
    const ch = channelRef.current;
    if (!ch) return;
    ch.send({ type: "broadcast", event: "activity", payload: { role: myRole, activity } });
    ch.track({ role: myRole, activity, at: Date.now() });
    if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    if (activity !== "idle") {
      activityTimerRef.current = window.setTimeout(() => {
        ch.send({ type: "broadcast", event: "activity", payload: { role: myRole, activity: "idle" } });
        ch.track({ role: myRole, activity: "idle", at: Date.now() });
      }, 4000);
    }
  };

  return { ...state, broadcastActivity };
}
