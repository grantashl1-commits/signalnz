import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadEntries, saveEntries, type JournalEntry } from "@/lib/journal-store";

const ACTIVITIES = [
  { id: "letter-future", title: "Letter to My Future Self", desc: "Write to who you are becoming. What do you want her to know?", time: "15 min", category: "Reflection", prompt: "Dear future me...\n\nI want you to know that right now I am..." },
  { id: "tiny-wins", title: "Tiny Wins Log", desc: "List the small victories you forget to celebrate.", time: "5 min", category: "Gratitude", prompt: "Here are the tiny wins I want to remember:\n\n1. " },
  { id: "you-wont-believe", title: "You Will Never Believe This", desc: "Write about something unexpected or hilarious that happened.", time: "10 min", category: "Joy", prompt: "You will never believe what happened...\n\n" },
  { id: "dream-morning", title: "My Dream Morning", desc: "Describe your ideal morning in vivid detail.", time: "10 min", category: "Vision", prompt: "My perfect morning begins when...\n\n" },
  { id: "learning-about-myself", title: "What I'm Learning About Myself", desc: "Reflect on the patterns, strengths, and truths you are uncovering.", time: "15 min", category: "Growth", prompt: "Lately I've been learning that I...\n\n" },
  { id: "ready-to-release", title: "Things I'm Ready to Release", desc: "Name what no longer serves you.", time: "10 min", category: "Healing", prompt: "I am ready to let go of...\n\n" },
  { id: "quietly-building", title: "The Life I'm Quietly Building", desc: "Describe the life taking shape beneath the surface.", time: "15 min", category: "Vision", prompt: "The life I am quietly building looks like...\n\n" },
  { id: "proof-growing", title: "Proof That I'm Growing", desc: "Gather evidence of your evolution.", time: "10 min", category: "Growth", prompt: "Here is proof that I am growing:\n\n1. " },
  { id: "soft-life", title: "My Soft Life Vision", desc: "Imagine a life built on ease, beauty, and intentionality.", time: "15 min", category: "Vision", prompt: "My soft life looks like...\n\n" },
  { id: "annual-reflection", title: "Annual Reflection Letter", desc: "A deep end-of-year letter to yourself.", time: "30 min", category: "Reflection", prompt: "Dear me,\n\nThis year I...\n\n" },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, duration: 0.25 } }),
};

export default function JournalActivities() {
  const [active, setActive] = useState<typeof ACTIVITIES[0] | null>(null);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const startActivity = (a: typeof ACTIVITIES[0]) => {
    haptic("medium");
    setActive(a);
    setText(a.prompt);
    setSaved(false);
  };

  const saveActivity = () => {
    if (!active) return;
    haptic("medium");
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      timestamp: Date.now(),
      prompts: { main: text },
      tracking: { mood: 5, energy: 5 },
      tags: [active.category.toLowerCase()],
      ai: null,
      entryType: "activity",
      title: active.title,
    };
    const entries = loadEntries();
    saveEntries([entry, ...entries]);
    setSaved(true);
    setTimeout(() => setActive(null), 1000);
  };

  // Active writing view
  if (active) {
    return (
      <div className="pb-10">
        <button onClick={() => setActive(null)} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to activities
        </button>
        <div className="mb-4">
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{active.category}</span>
          <h2 className="font-display text-2xl italic text-foreground mt-2 mb-1">{active.title}</h2>
          <p className="font-mono text-xs text-muted-foreground">{active.time}</p>
        </div>
        <div className="card-warm p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-relaxed placeholder:text-muted-foreground/40"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setActive(null)} className="flex-1 rounded-[14px] border border-border py-3.5 font-display text-sm italic text-muted-foreground active:opacity-70">
            Discard
          </button>
          <button onClick={saveActivity} className="flex-1 rounded-[14px] bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90">
            {saved ? "Saved" : "Save to journal"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="mb-2">
        <p className="font-hand text-sm font-bold text-primary mb-1">Guided Activities</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          Thoughtful writing prompts to help you reflect, dream, and grow.
        </p>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((a, i) => (
          <motion.div
            key={a.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariant}
            className="card-warm p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-[17px] italic text-foreground mb-1">{a.title}</h3>
                <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-2">{a.desc}</p>
                <div className="flex gap-1.5">
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{a.category}</span>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{a.time}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => startActivity(a)}
              className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97] mt-2"
            >
              Begin activity
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
