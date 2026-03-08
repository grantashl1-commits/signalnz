import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wind, Hand } from "lucide-react";
import BreathingModal from "@/components/BreathingModal";

const BREATHWORK = [
  { id: "box", name: "Box Breathing", pattern: "4-4-4-4", evidence: "STRONG", useCase: "Acute stress and focus" },
  { id: "sigh", name: "Physiological Sigh", pattern: "Double inhale + long exhale", evidence: "STRONG", useCase: "Panic and overwhelm" },
  { id: "coherent", name: "Coherent Breathing", pattern: "5 breaths per minute", evidence: "STRONG", useCase: "Daily regulation and HRV" },
  { id: "4-7-8", name: "4-7-8 Breathing", pattern: "4-7-8", evidence: "EMERGING", useCase: "Sleep and pre-bed wind down" },
];

const SOMATIC = [
  {
    title: "Humming",
    desc: "Hum any note for 2 minutes. Feel the vibration in your chest. This directly activates your vagus nerve.",
    hasTimer: true,
  },
  {
    title: "Cold Water",
    desc: "Splash cold water on your face 3 times, or hold wrists under cold water for 30 seconds. Activates the dive reflex — instant calm.",
    hasTimer: false,
  },
  {
    title: "5-4-3-2-1 Grounding",
    desc: "A sensory grounding sequence to bring you into the present moment.",
    hasSequence: true,
  },
  {
    title: "EFT Tapping",
    desc: "Tap through the 8-point sequence: karate chop, eyebrow, side of eye, under eye, under nose, chin, collarbone, under arm.",
    hasTimer: false,
  },
];

const GROUNDING_STEPS = [
  "Name 5 things you can see",
  "Name 4 things you can touch",
  "Name 3 things you can hear",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
];

const EFT_POINTS = [
  { point: "Karate Chop", instruction: "Tap the outer edge of your hand while stating your setup phrase" },
  { point: "Eyebrow", instruction: "Tap the inner edge of the eyebrow, closest to the nose" },
  { point: "Side of Eye", instruction: "Tap on the bone at the outer corner of the eye" },
  { point: "Under Eye", instruction: "Tap on the bone under the eye, about 1 inch below the pupil" },
  { point: "Under Nose", instruction: "Tap between the nose and upper lip" },
  { point: "Chin", instruction: "Tap in the crease between the lower lip and chin" },
  { point: "Collarbone", instruction: "Tap just below the collarbone, about 1 inch from the centre" },
  { point: "Under Arm", instruction: "Tap about 4 inches below the armpit" },
];

export default function BreathworkPage() {
  const [breathingId, setBreathingId] = useState<string | null>(null);
  const [groundingStep, setGroundingStep] = useState(-1);
  const [hummingTimer, setHummingTimer] = useState(0);
  const [hummingActive, setHummingActive] = useState(false);
  const [eftStep, setEftStep] = useState(-1);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState<{ tool: string; reason: string; instruction: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const startHumming = () => {
    setHummingActive(true);
    setHummingTimer(120);
    const interval = setInterval(() => {
      setHummingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHummingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAiCheckin = () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiResult({
        tool: "Coherent Breathing",
        reason: "Based on how you're feeling, your nervous system would benefit from gentle, rhythmic regulation. Coherent breathing at 5 breaths per minute is the gold standard for bringing your system back to baseline.",
        instruction: "Find a quiet spot. Breathe in for 6 seconds, out for 6 seconds. Continue for 5 minutes. Let your body find its rhythm.",
      });
      setAiLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Breathwork & Regulation</h1>
        <p className="text-muted-foreground mt-1">Regulate from the inside out</p>
      </div>

      {/* Breathwork */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <Wind className="h-5 w-5 text-accent" /> Breathwork
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BREATHWORK.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-warm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg font-semibold text-foreground">{b.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    b.evidence === "STRONG" ? "bg-accent/15 text-accent" : "bg-gold/15 text-gold"
                  }`}>
                    {b.evidence}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{b.pattern}</p>
                <p className="text-sm text-foreground/80">{b.useCase}</p>
              </div>
              <button
                onClick={() => setBreathingId(b.id)}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Guide Me
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Somatic Tools */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <Hand className="h-5 w-5 text-accent" /> Somatic Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SOMATIC.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-warm p-5"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

              {s.title === "Humming" && (
                <div className="mt-3">
                  {hummingActive ? (
                    <div className="text-center">
                      <p className="text-2xl font-display text-foreground">{Math.floor(hummingTimer / 60)}:{(hummingTimer % 60).toString().padStart(2, "0")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Keep humming...</p>
                    </div>
                  ) : (
                    <button onClick={startHumming} className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
                      Start 2-min Timer
                    </button>
                  )}
                </div>
              )}

              {s.title === "5-4-3-2-1 Grounding" && (
                <div className="mt-3 space-y-2">
                  {groundingStep >= 0 ? (
                    <>
                      <p className="text-sm font-medium text-foreground">{GROUNDING_STEPS[groundingStep]}</p>
                      <div className="flex gap-1 mb-2">
                        {GROUNDING_STEPS.map((_, idx) => (
                          <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= groundingStep ? "bg-accent" : "bg-muted"}`} />
                        ))}
                      </div>
                      <button
                        onClick={() => setGroundingStep((prev) => (prev < 4 ? prev + 1 : -1))}
                        className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        {groundingStep < 4 ? "Next" : "Done"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setGroundingStep(0)}
                      className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                      Begin Sequence
                    </button>
                  )}
                </div>
              )}

              {s.title === "EFT Tapping" && (
                <div className="mt-3 space-y-2">
                  {eftStep >= 0 ? (
                    <>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground">{EFT_POINTS[eftStep].point}</p>
                        <p className="text-xs text-muted-foreground mt-1">{EFT_POINTS[eftStep].instruction}</p>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {EFT_POINTS.map((_, idx) => (
                          <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= eftStep ? "bg-accent" : "bg-muted"}`} />
                        ))}
                      </div>
                      <button
                        onClick={() => setEftStep((prev) => (prev < 7 ? prev + 1 : -1))}
                        className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        {eftStep < 7 ? "Next Point" : "Done"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEftStep(0)}
                      className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                      Begin Tapping
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Check-in */}
      <section className="card-warm p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">How are you feeling right now?</h2>
        <textarea
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder="Describe how you feel..."
          className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none h-24"
        />
        <button
          onClick={handleAiCheckin}
          disabled={aiLoading || !aiInput.trim()}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Get a Recommendation
        </button>

        {aiLoading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm animate-pulse-gentle">Finding what your nervous system needs...</span>
          </div>
        )}

        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-accent/20 bg-accent/5 p-5"
          >
            <h3 className="font-display text-lg font-semibold text-foreground">{aiResult.tool}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{aiResult.reason}</p>
            <p className="text-sm text-foreground mt-3 leading-relaxed italic">{aiResult.instruction}</p>
          </motion.div>
        )}
      </section>

      {breathingId && <BreathingModal techniqueId={breathingId} onClose={() => setBreathingId(null)} />}
    </div>
  );
}
