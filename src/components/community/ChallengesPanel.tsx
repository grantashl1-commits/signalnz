import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnVillage } from "@/components/BotanicalElements";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, Users } from "lucide-react";

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
  name: string;
  suburb: string;
  challenges: string[];
  questions: string[];
}

interface CompletionRow { group_id: string; challenge_index: number; user_id: string; }
interface AnswerRow { group_id: string; question_index: number; answer: string; }

function ChallengeItem({
  text,
  groupId,
  index,
  myDone,
  participantCount,
  onToggle,
}: {
  text: string;
  groupId: string;
  index: number;
  myDone: boolean;
  participantCount: number;
  onToggle: () => void;
}) {
  return (
    <div className={`card-warm p-3.5 mb-2 border-l-[3px] border-l-primary`}>
      <div className="flex justify-between items-start gap-2.5">
        <div className="flex-1">
          <p className={`font-display text-sm italic leading-relaxed ${myDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{text}</p>
          {participantCount > 0 && (
            <p className="font-body text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Users size={10} /> {participantCount} {participantCount === 1 ? "person" : "people"} done
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`touch-btn font-body text-[11px] rounded-full px-3 py-1.5 flex-shrink-0 flex items-center gap-1 transition-colors ${
            myDone ? "text-primary-foreground bg-primary" : "text-primary bg-primary/10"
          }`}
        >
          {myDone && <Check size={11} />}
          {myDone ? "Done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}

function QuestionItem({
  question,
  groupId,
  index,
  initialAnswer,
  onSave,
}: {
  question: string;
  groupId: string;
  index: number;
  initialAnswer: string;
  onSave: (answer: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialAnswer);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const handleSave = async () => {
    if (value.trim() === initialAnswer.trim()) return;
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <div className="card-warm p-3.5 mb-2">
      <p className="font-display text-[15px] italic text-foreground mb-2">{question}</p>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        placeholder="Your answer…"
        className="w-full font-display text-[13px] italic text-foreground bg-secondary/30 border border-border rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
        style={{ fontSize: "16px" }}
        inputMode="text"
        autoComplete="off"
      />
      <p className="font-body text-[10px] text-muted-foreground mt-1 italic">
        {saving ? "Saving…" : savedAt ? "Saved · only you can see this" : "Private — only visible to you"}
      </p>
    </div>
  );
}

export default function ChallengesPanel({ joined }: ChallengesPanelProps) {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined.join(","), user?.id]);

  const loadAll = async () => {
    const groupIds = new Set(joined);
    if (user) {
      const { data: memberships } = await supabase
        .from("community_memberships")
        .select("group_id")
        .eq("user_id", user.id);
      memberships?.forEach((m: any) => groupIds.add(m.group_id));
    }
    if (groupIds.size === 0) { setMyGroups([]); return; }

    const ids = Array.from(groupIds);
    const [{ data: groupsData }, { data: completionsData }, { data: answersData }] = await Promise.all([
      supabase.from("community_groups").select("*").in("id", ids),
      supabase.from("challenge_completions").select("group_id, challenge_index, user_id").in("group_id", ids),
      user ? supabase.from("challenge_answers").select("group_id, question_index, answer").eq("user_id", user.id).in("group_id", ids) : Promise.resolve({ data: [] as AnswerRow[] }),
    ]);

    if (groupsData) {
      setMyGroups(groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        suburb: g.suburb,
        challenges: Array.isArray(g.challenges) && g.challenges.length > 0 ? g.challenges : DEFAULT_CHALLENGES,
        questions: Array.isArray(g.questions) && g.questions.length > 0 ? g.questions : DEFAULT_QUESTIONS,
      })));
    }
    setCompletions((completionsData as CompletionRow[]) || []);
    setAnswers((answersData as AnswerRow[]) || []);
  };

  const toggleCompletion = async (groupId: string, index: number) => {
    if (!user) { toast.error("Please sign in"); return; }
    const exists = completions.find((c) => c.group_id === groupId && c.challenge_index === index && c.user_id === user.id);
    if (exists) {
      setCompletions((prev) => prev.filter((c) => !(c.group_id === groupId && c.challenge_index === index && c.user_id === user.id)));
      const { error } = await supabase
        .from("challenge_completions")
        .delete()
        .eq("group_id", groupId)
        .eq("challenge_index", index)
        .eq("user_id", user.id);
      if (error) { console.error(error); toast.error("Couldn't update"); loadAll(); }
    } else {
      const optimistic: CompletionRow = { group_id: groupId, challenge_index: index, user_id: user.id };
      setCompletions((prev) => [...prev, optimistic]);
      const { error } = await supabase
        .from("challenge_completions")
        .insert({ group_id: groupId, challenge_index: index, user_id: user.id });
      if (error) { console.error(error); toast.error("Couldn't save"); loadAll(); }
      else toast.success("Nice work 🌱");
    }
  };

  const saveAnswer = async (groupId: string, index: number, answer: string) => {
    if (!user) return;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => !(a.group_id === groupId && a.question_index === index));
      return answer ? [...filtered, { group_id: groupId, question_index: index, answer }] : filtered;
    });
    if (!answer) {
      await supabase.from("challenge_answers").delete()
        .eq("group_id", groupId).eq("question_index", index).eq("user_id", user.id);
      return;
    }
    const { error } = await supabase.from("challenge_answers").upsert({
      group_id: groupId, question_index: index, user_id: user.id, answer,
    }, { onConflict: "group_id,question_index,user_id" });
    if (error) { console.error(error); toast.error("Couldn't save answer"); }
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
          {g.challenges.map((c, i) => {
            const myDone = !!completions.find((x) => x.group_id === g.id && x.challenge_index === i && x.user_id === user?.id);
            const count = completions.filter((x) => x.group_id === g.id && x.challenge_index === i).length;
            return (
              <ChallengeItem
                key={i}
                text={c}
                groupId={g.id}
                index={i}
                myDone={myDone}
                participantCount={count}
                onToggle={() => toggleCompletion(g.id, i)}
              />
            );
          })}

          <div className="mt-3">
            <p className="font-body text-[11px] text-muted-foreground mb-2">Community questions</p>
            {g.questions.map((q, i) => {
              const existing = answers.find((a) => a.group_id === g.id && a.question_index === i)?.answer || "";
              return (
                <QuestionItem
                  key={i}
                  question={q}
                  groupId={g.id}
                  index={i}
                  initialAnswer={existing}
                  onSave={(answer) => saveAnswer(g.id, i, answer)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
