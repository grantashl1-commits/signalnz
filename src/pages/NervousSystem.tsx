import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wind, PenLine, Hand, ExternalLink, Headphones } from "lucide-react";
import BreathingModal from "@/components/BreathingModal";
import JournalEditor from "@/components/JournalEditor";
import { BotanicalSprig } from "@/components/BotanicalElements";

const BREATHWORK = [
  { id: "box", name: "Box Breathing", pattern: "4-4-4-4", evidence: "STRONG", useCase: "Acute stress and focus" },
  { id: "sigh", name: "Physiological Sigh", pattern: "Double inhale + long exhale", evidence: "STRONG", useCase: "Panic and overwhelm" },
  { id: "coherent", name: "Coherent Breathing", pattern: "5 breaths per minute", evidence: "STRONG", useCase: "Daily regulation and HRV" },
  { id: "4-7-8", name: "4-7-8 Breathing", pattern: "4-7-8", evidence: "EMERGING", useCase: "Sleep and pre-bed wind down" },
];

const JOURNALS = [
  { id: "expressive" as const, title: "Expressive Writing", subtitle: "Pennebaker Protocol", desc: "Write freely about difficult emotions. No editing, no judgement." },
  { id: "gratitude" as const, title: "Gratitude Journal", subtitle: "Three prompts", desc: "Reflect on what went well, who helped, and what's ahead." },
  { id: "future-self" as const, title: "Future Self", subtitle: "Letter writing", desc: "Write a letter from your future self, 5 years from now." },
];

const SOMATIC = [
  { title: "Humming", desc: "Hum any note for 2 minutes. Feel the vibration in your chest. This directly activates your vagus nerve.", hasTimer: true },
  { title: "Cold Water", desc: "Splash cold water on your face 3 times, or hold wrists under cold water for 30 seconds. Activates the dive reflex — instant calm.", hasTimer: false },
  { title: "5-4-3-2-1 Grounding", desc: "A sensory grounding sequence to bring you into the present moment.", hasSequence: true },
  { title: "EFT Tapping", desc: "Tap through the 8-point sequence: karate chop, eyebrow, side of eye, under eye, under nose, chin, collarbone, under arm.", hasTimer: false },
];

const MEDITATIONS = [
  { title: "RAIN Meditation", teacher: "Tara Brach", platform: "Insight Timer", duration: "20 min", desc: "A guided practice using the RAIN framework — Recognise, Allow, Investigate, Nurture — for working with difficult emotions.", url: "https://insighttimer.com/tarabrach/guided-meditations/rain-meditation-25" },
  { title: "Loving-kindness (Metta)", teacher: "Sharon Salzberg", platform: "Insight Timer", duration: "15 min", desc: "A classic metta meditation cultivating compassion for yourself and others through repeated phrases of goodwill.", url: "https://insighttimer.com/sharonsalzberg/guided-meditations/lovingkindness-meditation" },
  { title: "Mindful Breathing", teacher: "Thích Nhất Hạnh", platform: "YouTube", duration: "20 min", desc: "A calming guided meditation from the Plum Village tradition, anchoring awareness in the breath.", url: "https://www.youtube.com/watch?v=XHvtIcaD194" },
  { title: "3-Minute Breathing Space", teacher: "Mark Williams", platform: "Insight Timer", duration: "3 min", desc: "A brief MBCT practice perfect for micro-pauses throughout your day. Awareness, gathering, expanding.", url: "https://insighttimer.com/markwilliams/guided-meditations/the-3-minute-breathing-space" },
  { title: "Yoga Nidra", teacher: "Richard Miller", platform: "Insight Timer", duration: "37 min", desc: "A full iRest Yoga Nidra session for deep rest and nervous system reset. Best done lying down.", url: "https://insighttimer.com/richardmiller/guided-meditations/full-irest-yoga-nidra-practice" },
  { title: "IFS Parts Meditation", teacher: "Richard Schwartz", platform: "Insight Timer", duration: "12 min", desc: "An Internal Family Systems meditation to connect with and understand your inner parts with compassion.", url: "https://insighttimer.com/drrichardschwartz/guided-meditations/ifs-meditation" },
];

const GROUNDING_STEPS = [
  "Name 5 things you can see",
  "Name 4 things you can touch",
  "Name 3 things you can hear",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
];

export default function NervousSystemPage() {
  const [breathingId, setBreathingId] = useState<string | null>(null);
  const [journalType, setJournalType] = useState<"expressive" | "gratitude" | "future-self" | null>(null);
  const [groundingStep, setGroundingStep] = useState(-1);
  const [hummingTimer, setHummingTimer] = useState(0);
  const [hummingActive, setHummingActive] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState<{ tool: string; reason: string; instruction: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const startHumming = () => {
    setHummingActive(true);
    setHummingTimer(120);
    const interval = setInterval(() => {
      setHummingTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setHummingActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAiCheckin = () => {
    if (!aiInput.trim()) return;
    setAiLoading(true); setAiResult(null);
    setTimeout(() => {
      setAiResult({
        tool: "Coherent Breathing",
        reason: "Based on how you're feeling, your nervous system would benefit from gentle, rhythmic regulation.",
        instruction: "Find a quiet spot. Breathe in for 6 seconds, out for 6 seconds. Continue for 5 minutes.",
      });
      setAiLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div>
        <p className="font-hand text-sm font-bold text-primary">nervous system</p>
        <h1 className="font-display text-4xl font-bold italic text-foreground">Nervous System</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Regulate from the inside out</p>
      </div>

      {/* Breathwork */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl italic text-foreground flex items-center gap-2">
          <Wind className="h-5 w-5 text-phase-follicular" /> Breathwork
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BREATHWORK.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-warm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg italic text-foreground">{b.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 font-hand text-[11px] font-bold ${
                    b.evidence === "STRONG" ? "bg-phase-follicular/15 text-phase-follicular" : "bg-phase-ovulatory/15 text-phase-ovulatory"
                  }`}>{b.evidence.toLowerCase()}</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mb-1">{b.pattern}</p>
                <p className="font-body text-sm text-muted-foreground">{b.useCase}</p>
              </div>
              <button onClick={() => setBreathingId(b.id)}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >Guide Me</button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journaling */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl italic text-foreground flex items-center gap-2">
          <PenLine className="h-5 w-5 text-lavender-dust" /> Journaling
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {JOURNALS.map((j, i) => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-warm p-5 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setJournalType(j.id)}
            >
              <h3 className="font-display text-lg italic text-foreground">{j.title}</h3>
              <p className="font-hand text-sm text-primary font-bold mt-0.5">{j.subtitle}</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{j.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <BotanicalSprig width={200} className="mx-auto" />

      {/* Somatic Tools */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl italic text-foreground flex items-center gap-2">
          <Hand className="h-5 w-5 text-phase-ovulatory" /> Somatic Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SOMATIC.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-warm p-5"
            >
              <h3 className="font-display text-lg italic text-foreground mb-2">{s.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

              {s.title === "Humming" && (
                <div className="mt-3">
                  {hummingActive ? (
                    <div className="text-center">
                      <p className="font-mono text-2xl text-foreground">{Math.floor(hummingTimer / 60)}:{(hummingTimer % 60).toString().padStart(2, "0")}</p>
                      <p className="font-hand text-sm text-muted-foreground mt-1">keep humming...</p>
                    </div>
                  ) : (
                    <button onClick={startHumming} className="rounded-xl bg-secondary px-4 py-2 font-body text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                      Start 2-min Timer
                    </button>
                  )}
                </div>
              )}

              {s.title === "5-4-3-2-1 Grounding" && (
                <div className="mt-3 space-y-2">
                  {groundingStep >= 0 ? (
                    <>
                      <p className="font-body text-sm font-medium text-foreground">{GROUNDING_STEPS[groundingStep]}</p>
                      <button onClick={() => setGroundingStep((prev) => (prev < 4 ? prev + 1 : -1))}
                        className="rounded-xl bg-secondary px-4 py-2 font-body text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                      >{groundingStep < 4 ? "Next" : "Done"}</button>
                    </>
                  ) : (
                    <button onClick={() => setGroundingStep(0)}
                      className="rounded-xl bg-secondary px-4 py-2 font-body text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                    >Begin Sequence</button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Check-in */}
      <section className="card-warm p-6 space-y-4">
        <h2 className="font-display text-xl italic text-foreground">How are you feeling right now?</h2>
        <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Describe how you feel..."
          className="w-full rounded-xl border border-border bg-background p-4 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-24"
        />
        <button onClick={handleAiCheckin} disabled={aiLoading || !aiInput.trim()}
          className="rounded-xl bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >Get a Recommendation</button>

        {aiLoading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-hand text-sm animate-pulse-gentle">finding what your body needs...</span>
          </div>
        )}

        {aiResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-5"
          >
            <h3 className="font-display text-lg italic text-foreground">{aiResult.tool}</h3>
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{aiResult.reason}</p>
            <p className="font-display text-sm italic text-foreground mt-3 leading-relaxed">{aiResult.instruction}</p>
          </motion.div>
        )}
      </section>

      {breathingId && <BreathingModal techniqueId={breathingId} onClose={() => setBreathingId(null)} />}
      {journalType && <JournalEditor type={journalType} onClose={() => setJournalType(null)} />}
    </div>
  );
}
