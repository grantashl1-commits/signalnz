import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Shuffle, Sparkles, Clock } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { loadEntries, saveEntries, type JournalEntry } from "@/lib/journal-store";
import { WildStar } from "@/components/BotanicalElements";

// ── 30+ Activities ────────────────────────────────────────────
type ActivityCategory = "Self-Discovery" | "Emotional Processing" | "Confidence" | "Playfulness" | "Future Self" | "Reflection" | "Gratitude" | "Goal Setting";

interface Activity {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: ActivityCategory;
  prompt: string;
  format?: "write" | "finish-sentence" | "either-or" | "card-pick";
  sentences?: string[];
  options?: [string, string][];
  cards?: string[];
}

const ACTIVITIES: Activity[] = [
  { id: "letter-future", title: "Letter to My Future Self", desc: "Write to who you are becoming. What do you want her to know?", time: "15 min", category: "Future Self", prompt: "Dear future me...\n\nI want you to know that right now I am..." },
  { id: "letter-from-future", title: "Letter from My Future Self", desc: "What would the wisest version of you say to you right now?", time: "15 min", category: "Future Self", prompt: "Dear present me,\n\nI'm writing to you from the future to say..." },
  { id: "you-wont-believe", title: "You Will Never Believe This", desc: "Write about something unexpected or hilarious that happened.", time: "10 min", category: "Playfulness", prompt: "You will never believe what happened...\n\n" },
  { id: "tiny-wins", title: "Tiny Wins Log", desc: "List the small victories you forget to celebrate.", time: "5 min", category: "Gratitude", prompt: "Here are the tiny wins I want to remember:\n\n1. \n2. \n3. " },
  { id: "plot-twist", title: "Plot Twist", desc: "Write about an unexpected turn your life has taken.", time: "10 min", category: "Reflection", prompt: "The plot twist I didn't see coming was...\n\n" },
  { id: "main-character", title: "My Main Character Era", desc: "Describe the era you are living in right now.", time: "10 min", category: "Confidence", prompt: "Right now I am in my...\n\nThis era is defined by...\n\n" },
  { id: "learning-about-myself", title: "What I'm Learning About Myself", desc: "Reflect on the patterns, strengths, and truths you are uncovering.", time: "15 min", category: "Self-Discovery", prompt: "Lately I've been learning that I...\n\n" },
  { id: "note-i-needed", title: "A Note I Needed to Hear", desc: "Write the encouragement you wish someone would give you.", time: "5 min", category: "Emotional Processing", prompt: "The note I needed to hear today:\n\n" },
  { id: "quietly-building", title: "The Life I'm Quietly Building", desc: "Describe the life taking shape beneath the surface.", time: "15 min", category: "Future Self", prompt: "The life I am quietly building looks like...\n\n" },
  { id: "ready-to-release", title: "Things I'm Ready to Release", desc: "Name what no longer serves you.", time: "10 min", category: "Emotional Processing", prompt: "I am ready to let go of...\n\n1. \n2. \n3. " },
  { id: "felt-good", title: "What Felt Good Today", desc: "Notice the moments of ease and pleasure.", time: "5 min", category: "Gratitude", prompt: "What felt good today:\n\n" },
  { id: "hard-day-survived", title: "A Hard Day I Survived", desc: "Honour your resilience by documenting what you got through.", time: "10 min", category: "Emotional Processing", prompt: "Today was hard because...\n\nBut I survived it by...\n\n" },
  { id: "want-more-of", title: "What I Want More Of", desc: "Name the things you want to invite in.", time: "5 min", category: "Self-Discovery", prompt: "I want more...\n\n1. \n2. \n3. " },
  { id: "want-less-of", title: "What I Want Less Of", desc: "Name what you are ready to reduce.", time: "5 min", category: "Self-Discovery", prompt: "I want less...\n\n1. \n2. \n3. " },
  { id: "trusted-myself", title: "If I Trusted Myself More", desc: "Explore what becomes possible when you back yourself.", time: "10 min", category: "Confidence", prompt: "If I fully trusted myself, I would...\n\n" },
  { id: "bravest-thing", title: "The Bravest Thing I Did Recently", desc: "Celebrate your courage, however small.", time: "5 min", category: "Confidence", prompt: "The bravest thing I did recently was...\n\nIt mattered because...\n\n" },
  { id: "inner-child", title: "My Inner Child Wants Me to Know", desc: "Let your younger self speak to you.", time: "15 min", category: "Emotional Processing", prompt: "Dear grown-up me,\n\nI want you to know...\n\n" },
  { id: "future-thanks", title: "Five Things Future Me Will Thank Me For", desc: "Identify actions your future self will appreciate.", time: "10 min", category: "Future Self", prompt: "Future me will thank me for:\n\n1. \n2. \n3. \n4. \n5. " },
  { id: "what-home", title: "What Home Feels Like", desc: "Describe the feeling of safety and belonging.", time: "10 min", category: "Self-Discovery", prompt: "Home feels like...\n\n" },
  { id: "dream-morning", title: "My Dream Morning", desc: "Describe your ideal morning in vivid detail.", time: "10 min", category: "Future Self", prompt: "My perfect morning begins when...\n\n" },
  { id: "romanticise", title: "Romanticise My Life", desc: "Find beauty in the ordinary moments of today.", time: "10 min", category: "Playfulness", prompt: "Today, the most beautiful ordinary moment was...\n\n" },
  { id: "whats-changing", title: "What's Changing in Me", desc: "Notice the shifts happening in your inner world.", time: "10 min", category: "Self-Discovery", prompt: "Something that is quietly changing in me is...\n\n" },
  { id: "this-season", title: "This Season of My Life", desc: "Name and honour the season you are in.", time: "15 min", category: "Reflection", prompt: "This season of my life is about...\n\nIt feels like...\n\n" },
  { id: "energy-audit", title: "My Energy Audit", desc: "Notice what fills you up and what drains you.", time: "10 min", category: "Self-Discovery", prompt: "What gives me energy:\n\n\nWhat drains my energy:\n\n" },
  { id: "no-longer-available", title: "What I'm No Longer Available For", desc: "Draw a line in the sand.", time: "5 min", category: "Confidence", prompt: "I am no longer available for:\n\n1. \n2. \n3. " },
  { id: "proof-growing", title: "Proof That I'm Growing", desc: "Gather evidence of your evolution.", time: "10 min", category: "Reflection", prompt: "Here is proof that I am growing:\n\n1. \n2. \n3. " },
  { id: "soft-life", title: "My Soft Life Vision", desc: "Imagine a life built on ease, beauty, and intentionality.", time: "15 min", category: "Future Self", prompt: "My soft life looks like...\n\n" },
  { id: "dont-want-to-lose", title: "A Memory I Don't Want to Lose", desc: "Write it down before it fades.", time: "10 min", category: "Reflection", prompt: "A memory I never want to forget:\n\n" },
  { id: "funniest-thing", title: "The Funniest Thing That Happened", desc: "Preserve the laughter.", time: "5 min", category: "Playfulness", prompt: "The funniest thing that happened recently was...\n\n" },
  { id: "annual-reflection", title: "My Annual Reflection Letter", desc: "A deep end-of-year letter to yourself.", time: "30 min", category: "Reflection", prompt: "Dear me,\n\nThis year I...\n\n" },
  // ── Mini-game formats ──
  { id: "finish-sentence", title: "Finish the Sentence", desc: "Complete these sentences honestly and quickly.", time: "5 min", category: "Playfulness", prompt: "", format: "finish-sentence", sentences: [
    "Right now I feel...",
    "The thing I most need is...",
    "I am secretly proud of...",
    "If no one was watching I would...",
    "My heart is telling me...",
    "I wish someone knew that...",
    "The bravest version of me would...",
    "What makes me feel most alive is...",
  ]},
  { id: "either-or", title: "Either/Or Self-Discovery", desc: "Choose between pairs to learn what you really want.", time: "5 min", category: "Self-Discovery", prompt: "", format: "either-or", options: [
    ["Cozy night in", "Late night out"],
    ["Deep conversation", "Comfortable silence"],
    ["Mountains", "Ocean"],
    ["Start fresh", "Build on what I have"],
    ["Be understood", "Be admired"],
    ["More freedom", "More structure"],
    ["A big leap", "Steady progress"],
    ["Say how I feel", "Keep the peace"],
  ]},
  { id: "card-pick", title: "Pick a Card, Write Your Truth", desc: "Choose a card and write what comes to mind.", time: "10 min", category: "Playfulness", prompt: "", format: "card-pick", cards: [
    "What are you carrying that isn't yours?",
    "What would you do if you knew you couldn't fail?",
    "What does your body need right now?",
    "Who do you miss?",
    "What's the kindest thing you could do for yourself today?",
    "What dream have you been putting off?",
    "What truth are you avoiding?",
    "What would your best friend say to you right now?",
  ]},
];

const CATEGORIES: ActivityCategory[] = ["Self-Discovery", "Emotional Processing", "Confidence", "Playfulness", "Future Self", "Reflection", "Gratitude", "Goal Setting"];

const CATEGORY_ACCENT: Record<ActivityCategory, string> = {
  "Self-Discovery": "#9B89B4",
  "Emotional Processing": "#C47A8A",
  "Confidence": "#7F5B87",
  "Playfulness": "#C4876B",
  "Future Self": "#9B89B4",
  "Reflection": "#C47A8A",
  "Gratitude": "#7F5B87",
  "Goal Setting": "#C4876B",
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.03 * i, duration: 0.25 } }),
};

// ── Finish Sentence Game ──────────────────────────────────────
function FinishSentenceGame({ activity, onSave, onBack }: { activity: Activity; onSave: (text: string) => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<string[]>(activity.sentences!.map(() => ""));

  const allText = activity.sentences!.map((s, i) => `${s} ${answers[i]}`).join("\n\n");

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
      <h2 className="font-display text-2xl italic text-foreground mb-1">{activity.title}</h2>
      <p className="font-body text-sm text-muted-foreground mb-5">{activity.desc}</p>
      <div className="space-y-4">
        {activity.sentences!.map((s, i) => (
          <div key={i} className="card-warm p-4">
            <p className="font-display text-[15px] italic text-foreground mb-2">{s}</p>
            <input
              type="text"
              value={answers[i]}
              onChange={(e) => { const next = [...answers]; next[i] = e.target.value; setAnswers(next); }}
              className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/30"
              placeholder="..."
              style={{ fontSize: "16px" }}
            />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(allText)} className="w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90 mt-4">Save to journal</button>
    </div>
  );
}

// ── Either/Or Game ────────────────────────────────────────────
function EitherOrGame({ activity, onSave, onBack }: { activity: Activity; onSave: (text: string) => void; onBack: () => void }) {
  const [choices, setChoices] = useState<number[]>(activity.options!.map(() => -1));
  const [reflection, setReflection] = useState("");

  const choiceText = activity.options!.map(([a, b], i) => `${a} vs ${b}: ${choices[i] === 0 ? a : choices[i] === 1 ? b : "Undecided"}`).join("\n") + "\n\nReflection: " + reflection;

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
      <h2 className="font-display text-2xl italic text-foreground mb-1">{activity.title}</h2>
      <p className="font-body text-sm text-muted-foreground mb-5">{activity.desc}</p>
      <div className="space-y-3">
        {activity.options!.map(([a, b], i) => (
          <div key={i} className="flex gap-2">
            <button onClick={() => { const next = [...choices]; next[i] = 0; setChoices(next); haptic("light"); }} className={`flex-1 card-warm p-3 text-center font-display text-sm italic transition-all ${choices[i] === 0 ? "ring-2 ring-primary bg-primary/5" : ""}`}>{a}</button>
            <button onClick={() => { const next = [...choices]; next[i] = 1; setChoices(next); haptic("light"); }} className={`flex-1 card-warm p-3 text-center font-display text-sm italic transition-all ${choices[i] === 1 ? "ring-2 ring-primary bg-primary/5" : ""}`}>{b}</button>
          </div>
        ))}
      </div>
      <div className="card-warm p-4 mt-4">
        <p className="font-display text-[15px] italic text-foreground mb-2">What do your choices tell you?</p>
        <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} placeholder="Reflect on what you noticed..." className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/30" style={{ fontSize: "16px" }} />
      </div>
      <button onClick={() => onSave(choiceText)} className="w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90 mt-4">Save to journal</button>
    </div>
  );
}

// ── Card Pick Game ────────────────────────────────────────────
function CardPickGame({ activity, onSave, onBack }: { activity: Activity; onSave: (text: string) => void; onBack: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const pickRandom = () => {
    const available = activity.cards!.filter((_, i) => !revealed.has(i));
    if (available.length === 0) return;
    const idx = activity.cards!.indexOf(available[Math.floor(Math.random() * available.length)]);
    setRevealed((r) => new Set([...r, idx]));
    setPicked(activity.cards![idx]);
    haptic("medium");
  };

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
      <h2 className="font-display text-2xl italic text-foreground mb-1">{activity.title}</h2>
      <p className="font-body text-sm text-muted-foreground mb-5">{activity.desc}</p>

      {!picked ? (
        <div className="text-center py-12">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <WildStar size={48} className="mx-auto mb-4" />
          </motion.div>
          <p className="font-display text-lg italic text-foreground mb-4">Choose a card to reveal your prompt</p>
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-6">
            {activity.cards!.map((_, i) => (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => { setRevealed((r) => new Set([...r, i])); setPicked(activity.cards![i]); haptic("medium"); }}
                className={`aspect-[3/4] rounded-xl transition-all ${revealed.has(i) ? "bg-primary/10 border border-primary/20" : "bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 hover:shadow-md"}`}
                disabled={revealed.has(i)}
              >
                {revealed.has(i) && <span className="font-mono text-[10px] text-primary">Revealed</span>}
              </motion.button>
            ))}
          </div>
          <button onClick={pickRandom} className="font-mono text-sm text-primary flex items-center gap-1.5 mx-auto active:opacity-70"><Shuffle className="h-4 w-4" /> Pick randomly</button>
        </div>
      ) : (
        <div>
          <div className="card-warm p-6 mb-4 text-center">
            <p className="font-display text-xl italic text-foreground leading-relaxed">"{picked}"</p>
          </div>
          <div className="card-warm p-5">
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={6} placeholder="Write your truth..." className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-[1.9] placeholder:text-muted-foreground/30" style={{ fontSize: "16px" }} autoFocus />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setPicked(null)} className="flex-1 rounded-[14px] border border-border py-3.5 font-display text-sm italic text-muted-foreground">Pick another</button>
            <button onClick={() => onSave(`Prompt: ${picked}\n\n${response}`)} className="flex-1 rounded-[14px] bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90">Save to journal</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Standard Write Activity ───────────────────────────────────
function WriteActivity({ activity, onSave, onBack }: { activity: Activity; onSave: (text: string) => void; onBack: () => void }) {
  const [text, setText] = useState(activity.prompt);
  const [saved, setSaved] = useState(false);

  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
      <div className="mb-4">
        <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${CATEGORY_ACCENT[activity.category]}18`, color: CATEGORY_ACCENT[activity.category] }}>{activity.category}</span>
        <h2 className="font-display text-2xl italic text-foreground mt-2 mb-1">{activity.title}</h2>
        <p className="font-mono text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {activity.time}</p>
      </div>
      <div className="card-warm p-6 min-h-[300px]">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-[1.9] placeholder:text-muted-foreground/30" style={{ fontSize: "16px" }} autoFocus />
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={onBack} className="flex-1 rounded-[14px] border border-border py-3.5 font-display text-sm italic text-muted-foreground active:opacity-70">Discard</button>
        <button onClick={() => { onSave(text); setSaved(true); }} className="flex-1 rounded-[14px] bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90">{saved ? "Saved" : "Save to journal"}</button>
      </div>
    </div>
  );
}

// ── Spin for a Prompt ─────────────────────────────────────────
function SpinPrompt({ onSelect }: { onSelect: (activity: Activity) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Activity | null>(null);

  const spin = () => {
    setSpinning(true);
    haptic("medium");
    const writeActivities = ACTIVITIES.filter((a) => a.format !== "either-or" && a.format !== "finish-sentence" && a.format !== "card-pick");
    setTimeout(() => {
      const pick = writeActivities[Math.floor(Math.random() * writeActivities.length)];
      setResult(pick);
      setSpinning(false);
      haptic("light");
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-warm p-5 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
          <Shuffle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-[15px] italic text-foreground">Not sure what to write?</h3>
          <p className="font-mono text-[11px] text-muted-foreground">Spin for a prompt and let the universe decide.</p>
        </div>
      </div>
      {result && !spinning ? (
        <div className="bg-primary/5 rounded-xl p-4 mb-3">
          <p className="font-display text-sm italic text-foreground mb-1">{result.title}</p>
          <p className="font-mono text-[11px] text-muted-foreground mb-2">{result.desc}</p>
          <button onClick={() => onSelect(result)} className="font-mono text-[11px] text-primary active:opacity-70">Begin this one</button>
        </div>
      ) : null}
      <button onClick={spin} disabled={spinning} className="w-full rounded-xl bg-secondary py-3 font-display text-sm italic text-foreground active:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
        {spinning ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity }}><Sparkles className="h-4 w-4 text-primary" /></motion.div> Choosing...</> : "Spin for a prompt"}
      </button>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function JournalActivities() {
  const [active, setActive] = useState<Activity | null>(null);
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | "all">("all");

  const filtered = useMemo(() => {
    if (filterCategory === "all") return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.category === filterCategory);
  }, [filterCategory]);

  const handleSave = (text: string) => {
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
      emotionalTone: "reflection",
    };
    const entries = loadEntries();
    saveEntries([entry, ...entries]);
    setActive(null);
  };

  // Active activity view
  if (active) {
    if (active.format === "finish-sentence") return <FinishSentenceGame activity={active} onSave={handleSave} onBack={() => setActive(null)} />;
    if (active.format === "either-or") return <EitherOrGame activity={active} onSave={handleSave} onBack={() => setActive(null)} />;
    if (active.format === "card-pick") return <CardPickGame activity={active} onSave={handleSave} onBack={() => setActive(null)} />;
    return <WriteActivity activity={active} onSave={handleSave} onBack={() => setActive(null)} />;
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="mb-2">
        <p className="font-hand text-sm font-bold text-primary mb-1">Guided Activities</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          Thoughtful writing rituals to help you reflect, dream, play, and grow.
        </p>
      </div>

      {/* Spin prompt */}
      <SpinPrompt onSelect={setActive} />

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setFilterCategory("all")}
          className={`font-body text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >All</button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setFilterCategory(c); haptic("light"); }}
            className={`font-body text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${filterCategory === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >{c}</button>
        ))}
      </div>

      {/* Activity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((a, i) => (
          <motion.div
            key={a.id} custom={i} initial="hidden" animate="visible" variants={cardVariant}
            className="card-warm p-5 group hover:shadow-md transition-shadow flex flex-col relative overflow-hidden"
          >
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{ backgroundColor: CATEGORY_ACCENT[a.category] }} />
            <div className="flex items-start justify-between gap-3 mb-2 pl-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-display text-[17px] italic text-foreground">{a.title}</h3>
                  {a.format && a.format !== "write" && (
                    <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {a.format === "finish-sentence" ? "Interactive" : a.format === "either-or" ? "Choose" : "Card game"}
                    </span>
                  )}
                </div>
                <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-2">{a.desc}</p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${CATEGORY_ACCENT[a.category]}18`, color: CATEGORY_ACCENT[a.category] }}>{a.category}</span>
                  <span className="font-body text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setActive(a); haptic("medium"); }}
              className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:scale-[0.97] mt-auto pt-2"
            >
              Begin activity
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
