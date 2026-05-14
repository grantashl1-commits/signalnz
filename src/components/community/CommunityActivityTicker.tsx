import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnSparkle } from "@/components/BotanicalElements";

interface ActivityItem {
  id: string;
  text: string;
}

interface Props {
  joinedGroupIds: string[];
}

const fmtAgo = (iso: string) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export default function CommunityActivityTicker({ joinedGroupIds }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Find a candidate group set: joined first, otherwise top-3 most active.
      let groupIds = joinedGroupIds;
      if (!groupIds.length) {
        const { data } = await supabase
          .from("community_groups")
          .select("id")
          .eq("status", "approved")
          .order("members_count", { ascending: false })
          .limit(3);
        groupIds = (data ?? []).map((g: any) => g.id);
      }
      if (!groupIds.length) { if (!cancelled) setItems([]); return; }

      const [msgs, joins] = await Promise.all([
        supabase
          .from("community_messages")
          .select("id, group_id, message_type, created_at, content, metadata")
          .in("group_id", groupIds)
          .eq("is_removed", false)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("community_memberships")
          .select("id, group_id, joined_at")
          .in("group_id", groupIds)
          .order("joined_at", { ascending: false })
          .limit(8),
      ]);

      const { data: groups } = await supabase
        .from("community_groups")
        .select("id, name, suburb")
        .in("id", groupIds);
      const groupName: Record<string, string> = {};
      (groups ?? []).forEach((g: any) => { groupName[g.id] = g.name || g.suburb; });

      const out: ActivityItem[] = [];
      (msgs.data ?? []).forEach((m: any) => {
        const name = groupName[m.group_id] ?? "your village";
        let text = "";
        if (m.message_type === "event") text = `New event in ${name}: ${m.metadata?.title ?? "an event"}`;
        else if (m.message_type === "poll") text = `New poll in ${name}`;
        else if (m.message_type === "image") text = `Someone shared a photo in ${name}`;
        else if (m.message_type === "voice") text = `A voice note landed in ${name}`;
        else text = `Someone spoke up in ${name}`;
        out.push({ id: `m-${m.id}`, text: `${text} · ${fmtAgo(m.created_at)}` });
      });
      (joins.data ?? []).forEach((j: any) => {
        const name = groupName[j.group_id] ?? "a group";
        out.push({ id: `j-${j.id}`, text: `A new neighbour joined ${name} · ${fmtAgo(j.joined_at)}` });
      });

      // Interleave by time: re-sort by recency text isn't straightforward, just keep order: msgs then joins.
      if (!cancelled) setItems(out.slice(0, 6));
    };
    load();
    return () => { cancelled = true; };
  }, [joinedGroupIds.join(",")]);

  if (!items.length) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <HandDrawnSparkle size={12} color="hsl(var(--primary))" />
        <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">What's happening</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scroll-snap-x">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex-shrink-0 scroll-snap-item card-warm px-3 py-2 max-w-[260px]"
          >
            <p className="font-display text-[12px] italic text-foreground/80 leading-snug">{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
