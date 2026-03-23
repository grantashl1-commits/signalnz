import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnVillage } from "@/components/BotanicalElements";
import { useAuth } from "@/contexts/AuthContext";

interface ChallengesPanelProps {
  joined: string[];
}

const DEFAULT_CHALLENGES = [
  "☕ Arrange a coffee date at a local café this week",
  "🚶 Organise a walk + talk in your neighbourhood",
  "🌱 Share one skill you could teach someone nearby",
  "🤝 Introduce yourself to a neighbour you haven't met",
  "📦 Offer to pick up something from the shops for a neighbour",
];

const DEFAULT_QUESTIONS = [
  "What are you looking to get out of this community?",
  "In what ways could our neighbourhood come together?",
  "What services or skills can you offer?",
];

function ChallengeItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`card-warm p-3.5 mb-2 border-l-[3px] ${done ? "border-l-phase-follicular" : "border-l-primary"}`}>
      <div className="flex justify-between items-start gap-2.5">
        <p className={`font-display text-sm italic leading-relaxed flex-1 ${done ? "text-muted-foreground" : "text-foreground"}`}>{text}</p>
        <button
          onClick={() => setDone((d) => !d)}
          className={`touch-btn font-mono text-[11px] rounded-full px-3 py-1.5 flex-shrink-0 ${
            done ? "text-phase-follicular bg-phase-follicular/10" : "text-primary bg-primary/10"
          }`}
        >
          {done ? "Done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}

export default function ChallengesPanel({ joined }: ChallengesPanelProps) {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<any[]>([]);

  useEffect(() => {
    loadGroups();
  }, [joined, user]);

  const loadGroups = async () => {
    // Combine localStorage joined IDs with DB memberships
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
        <p className="font-mono text-xs text-muted-foreground">Then your challenges will appear here.</p>
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
          {g.challenges.map((c: string, i: number) => <ChallengeItem key={i} text={c} />)}

          <div className="mt-3">
            <p className="font-mono text-[11px] text-muted-foreground mb-2">Community questions</p>
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
