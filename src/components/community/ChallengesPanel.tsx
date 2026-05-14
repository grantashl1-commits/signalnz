import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnVillage } from "@/components/BotanicalElements";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { haptic } from "@/hooks/use-mobile";

interface ChallengesPanelProps {
  joined: string[];
}

const DEFAULT_CHALLENGES = [
  "Arrange a coffee date at a local café this week",
  "Organise a walk + talk in your neighbourhood",
  "Share one skill you could teach someone nearby",
  "Introduce yourself to a neighbour you haven't met",
  "Offer to pick up something from the shops for a neighbour",
];

const DEFAULT_QUESTIONS = [
  "What are you looking to get out of this community?",
  "In what ways could our neighbourhood come together?",
  "What services or skills can you offer?",
];

interface Group {
  id: string;
  name?: string;
  suburb: string;
  challenges: string[];
  questions: string[];
}

function ChallengeItem({ text, group }: { text: string; group: Group }) {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState(`I did it: ${text}`);
  const [sending, setSending] = useState(false);

  const handleMarkDone = () => {
    haptic("medium");
    setDone(true);
    setShareText(`I did it: ${text}`);
    setShowShare(true);
  };

  const shareToGroup = async () => {
    if (!user || !shareText.trim()) return;
    setSending(true);
    const { error } = await supabase.from("community_messages").insert({
      group_id: group.id,
      user_id: user.id,
      message_type: "text",
      content: shareText.trim(),
      metadata: { kind: "challenge_done", challenge: text },
    });
    setSending(false);
    if (error) {
      toast.error("That didn't land — try again.");
      return;
    }
    toast.success("Held — shared with the village.");
    setShowShare(false);
  };

  return (
    <div className="card-warm p-3.5 mb-2 border-l-[3px] border-l-primary">
      <div className="flex justify-between items-start gap-2.5">
        <p className={`font-display text-sm italic leading-relaxed flex-1 ${done ? "text-muted-foreground" : "text-foreground"}`}>{text}</p>
        <button
          onClick={done ? () => setShowShare((s) => !s) : handleMarkDone}
          className="touch-btn font-body text-[11px] rounded-full px-3 py-1.5 flex-shrink-0 text-primary bg-primary/10"
        >
          {done ? "Share" : "Mark done"}
        </button>
      </div>
      {showShare && done && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
          <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
            Share with {group.name || group.suburb}
          </p>
          <textarea
            rows={2}
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            className="w-full font-display text-[13px] italic text-foreground bg-secondary/30 border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
            style={{ fontSize: "16px" }}
          />
          <div className="flex gap-2">
            <button
              onClick={shareToGroup}
              disabled={sending || !shareText.trim()}
              className="touch-btn font-display text-[12px] italic text-primary-foreground bg-primary rounded-full px-3.5 py-1.5 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send to group"}
            </button>
            <button
              onClick={() => setShowShare(false)}
              className="touch-btn font-body text-[11px] text-muted-foreground rounded-full px-3 py-1.5"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChallengesPanel({ joined }: ChallengesPanelProps) {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, user]);

  const loadGroups = async () => {
    const groupIds = new Set(joined);

    if (user) {
      const { data: memberships } = await supabase
        .from("community_memberships")
        .select("group_id")
        .eq("user_id", user.id);
      if (memberships) {
        memberships.forEach((m: any) => groupIds.add(m.group_id));
      }
    }

    if (groupIds.size === 0) {
      setMyGroups([]);
      return;
    }

    const { data } = await supabase
      .from("community_groups")
      .select("*")
      .in("id", Array.from(groupIds));

    if (data) {
      setMyGroups(data.map((g: any) => ({
        ...g,
        challenges: Array.isArray(g.challenges) && g.challenges.length > 0 ? g.challenges : DEFAULT_CHALLENGES,
        questions: Array.isArray(g.questions) && g.questions.length > 0 ? g.questions : DEFAULT_QUESTIONS,
      })));
    }
  };

  if (!myGroups.length) {
    return (
      <div className="text-center pt-16">
        <HandDrawnVillage size={40} color="hsl(var(--primary))" className="mx-auto mb-3" />
        <p className="font-display text-xl italic text-foreground mb-1.5">Join a community first.</p>
        <p className="font-body text-xs text-muted-foreground">Then your challenges will appear here.</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="card-warm p-5 mb-4">
        <p className="font-display text-sm italic text-foreground leading-relaxed">
          Connection doesn't happen online — it begins there. These micro-challenges are designed to take your
          digital community into your physical world, one small act at a time.
        </p>
      </div>

      {myGroups.map((g) => (
        <div key={g.id} className="mb-5">
          <h3 className="font-display text-lg font-bold italic text-foreground mb-2.5">{g.name || g.suburb}</h3>
          {g.challenges.map((c: string, i: number) => <ChallengeItem key={i} text={c} group={g} />)}

          <div className="mt-3">
            <p className="font-body text-[11px] text-muted-foreground mb-2">Community questions</p>
            {g.questions.map((q: string, i: number) => (
              <div key={i} className="card-warm p-3.5 mb-2">
                <p className="font-display text-[15px] italic text-foreground mb-2">{q}</p>
                <textarea
                  rows={2}
                  placeholder="Your answer…"
                  className="w-full font-display text-[13px] italic text-foreground bg-secondary/30 border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
                  style={{ fontSize: "16px" }}
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
