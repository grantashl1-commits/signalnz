import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wind, Hand } from "lucide-react";
import BreathingModal from "@/components/BreathingModal";
import { SeedGeometry, BotanicalSprig, CymatiSketch, HerbCluster } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

const BREATHWORK = [
  { id: "box", name: "Box Breathing", pattern: "4-4-4-4", evidence: "STRONG", useCase: "Acute stress and focus" },
  { id: "sigh", name: "Physiological Sigh", pattern: "Double inhale + long exhale", evidence: "STRONG", useCase: "Panic and overwhelm" },
  { id: "coherent", name: "Coherent Breathing", pattern: "5 breaths per minute", evidence: "STRONG", useCase: "Daily regulation and HRV" },
  { id: "4-7-8", name: "4-7-8 Breathing", pattern: "4-7-8", evidence: "EMERGING", useCase: "Sleep and pre-bed wind down" },
];

const SOMATIC = [
  { title: "Humming", desc: "Hum any note for 2 minutes. Feel the vibration in your chest. This directly activates your vagus nerve.", hasTimer: true },
  { title: "Cold Water", desc: "Splash cold water on your face 3 times, or hold wrists under cold water for 30 seconds. Activates the dive reflex — instant calm." },
  { title: "5-4-3-2-1 Grounding", desc: "A sensory grounding sequence to bring you into the present.", hasSequence: true },
  { title: "EFT Tapping", desc: "Tap through the 8-point sequence for nervous system release.", hasTapping: true },
];

const GROUNDING_STEPS = ["5 things you can see", "4 things you can touch", "3 things you can hear", "2 things you can smell", "1 thing you can taste"];
const EFT_POINTS = [
  { point: "Karate Chop", instruction: "Tap the outer edge of your hand" },
  { point: "Eyebrow", instruction: "Inner edge of the eyebrow" },
  { point: "Side of Eye", instruction: "Bone at the outer corner" },
  { point: "Under Eye", instruction: "Bone under the eye" },
  { point: "Under Nose", instruction: "Between nose and upper lip" },
  { point: "Chin", instruction: "Crease below lower lip" },
  { point: "Collarbone", instruction: "Below the collarbone" },
  { point: "Under Arm", instruction: "4 inches below armpit" },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.08 * i, duration: 0.35, ease: "easeOut" },
  }),
};

export default function BreathworkPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [breathingId, setBreathingId] = useState<string | null>(null);
  const [groundingStep, setGroundingStep] = useState(-1);
  const [hummingTimer, setHummingTimer] = useState(0);
  const [hummingActive, setHummingActive] = useState(false);
  const [eftStep, setEftStep] = useState(-1);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState<{ tool: string; reason: string; instruction: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const startHumming = () => {
    haptic("medium");
    setHummingActive(true);
    setHummingTimer(120);
    const interval = setInterval(() => {
      setHummingTimer((prev) => { if (prev <= 1) { clearInterval(interval); setHummingActive(false); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleAiCheckin = () => {
    if (!aiInput.trim()) return;
    setAiLoading(true); setAiResult(null);
    setTimeout(() => {
      setAiResult({
        tool: "Coherent Breathing",
        reason: "Your nervous system would benefit from gentle, rhythmic regulation. Coherent breathing at 5 breaths per minute is the gold standard.",
        instruction: "Find a quiet spot. Breathe in for 6 seconds, out for 6 seconds. Continue for 5 minutes.",
      });
      setAiLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 relative">
      <div className="absolute top-0 right-0 -translate-y-6 md:-translate-y-10 translate-x-6 md:translate-x-10 pointer-events-none">
        <SeedGeometry size={160} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={250} opacity={0.08} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">breathwork & regulation</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground">Breathwork & Regulation</h1>
      </div>

      {/* Breathwork */}
      <section className="space-y-3 md:space-y-4">
        <h2 className="font-display text-xl md:text-2xl italic text-foreground flex items-center gap-3">
          <Wind className="h-5 w-5 text-phase-follicular" /> Breathwork
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {BREATHWORK.map((b, i) => (
            <motion.div key={b.id} custom={i} initial="hidden" animate="visible" variants={cardVariant}
              className="card-warm p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 pointer-events-none">
                <CymatiSketch phase={info.phase} size={48} opacity={0.06} />
              </div>
              <div>
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <h3 className="font-display text-base md:text-lg italic text-foreground">{b.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 font-hand text-[11px] font-bold ${
                    b.evidence === "STRONG" ? "bg-phase-follicular/15 text-phase-follicular" : "bg-phase-ovulatory/15 text-phase-ovulatory"
                  }`}>{b.evidence.toLowerCase()} evidence</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mb-1">{b.pattern}</p>
                <p className="font-body text-sm text-muted-foreground">{b.useCase}</p>
              </div>
              <button onClick={() => { haptic("medium"); setBreathingId(b.id); }}
                className="touch-btn mt-4 w-full rounded-xl bg-primary px-4 py-3 min-h-[52px] font-hand text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity"
              >begin this practice →</button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Somatic */}
      <section className="space-y-3 md:space-y-4">
        <h2 className="font-display text-xl md:text-2xl italic text-foreground flex items-center gap-3">
          <Hand className="h-5 w-5 text-lavender-dust" /> Somatic Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOMATIC.map((s, i) => (
            <motion.div key={s.title} custom={i} initial="hidden" animate="visible" variants={cardVariant} className="card-warm p-5">
              <h3 className="font-display text-base md:text-lg italic text-foreground mb-2">{s.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

              {s.title === "Humming" && (
                <div className="mt-3">
                  {hummingActive ? (
                    <div className="text-center">
                      <p className="font-mono text-2xl text-foreground">{Math.floor(hummingTimer / 60)}:{(hummingTimer % 60).toString().padStart(2, "0")}</p>
                      <p className="font-hand text-sm text-muted-foreground mt-1">keep humming...</p>
                    </div>
                  ) : (
                    <button onClick={startHumming} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[52px] font-body text-sm font-medium text-foreground active:bg-secondary/80 transition-colors">Start 2-min Timer</button>
                  )}
                </div>
              )}

              {s.title === "5-4-3-2-1 Grounding" && (
                <div className="mt-3 space-y-2">
                  {groundingStep >= 0 ? (
                    <>
                      <p className="font-body text-sm text-foreground">{GROUNDING_STEPS[groundingStep]}</p>
                      <div className="flex gap-1">{GROUNDING_STEPS.map((_, idx) => <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= groundingStep ? "bg-primary" : "bg-secondary"}`} />)}</div>
                      <button onClick={() => { haptic("light"); setGroundingStep(p => p < 4 ? p + 1 : -1); }} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[52px] font-body text-sm text-foreground active:bg-secondary/80">{groundingStep < 4 ? "Next" : "Done"}</button>
                    </>
                  ) : (
                    <button onClick={() => { haptic("light"); setGroundingStep(0); }} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[52px] font-body text-sm text-foreground active:bg-secondary/80">Begin Sequence</button>
                  )}
                </div>
              )}

              {s.title === "EFT Tapping" && (
                <div className="mt-3 space-y-2">
                  {eftStep >= 0 ? (
                    <>
                      <div className="bg-secondary rounded-xl p-3">
                        <p className="font-body text-sm font-medium text-foreground">{EFT_POINTS[eftStep].point}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{EFT_POINTS[eftStep].instruction}</p>
                      </div>
                      <div className="flex gap-0.5">{EFT_POINTS.map((_, idx) => <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= eftStep ? "bg-primary" : "bg-secondary"}`} />)}</div>
                      <button onClick={() => { haptic("light"); setEftStep(p => p < 7 ? p + 1 : -1); }} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[52px] font-body text-sm text-foreground active:bg-secondary/80">{eftStep < 7 ? "Next Point" : "Done"}</button>
                    </>
                  ) : (
                    <button onClick={() => { haptic("light"); setEftStep(0); }} className="touch-btn rounded-xl bg-secondary px-4 py-3 min-h-[52px] font-body text-sm text-foreground active:bg-secondary/80">Begin Tapping</button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <BotanicalSprig width={180} className="mx-auto md:hidden" />
      <BotanicalSprig width={240} className="mx-auto hidden md:block" />

      {/* AI */}
      <section className="card-warm p-5 md:p-6 space-y-4">
        <h2 className="font-display text-lg md:text-xl italic text-foreground">how are you feeling right now?</h2>
        <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="describe how you're feeling..."
          className="w-full rounded-xl border border-border bg-background p-4 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-24 min-h-[80px]"
          style={{ fontSize: "16px" }}
        />
        <button onClick={handleAiCheckin} disabled={aiLoading || !aiInput.trim()}
          className="touch-btn w-full sm:w-auto rounded-xl bg-primary px-6 py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground active:opacity-90 disabled:opacity-40"
        >Get a Recommendation</button>

        {aiLoading && <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="font-hand text-sm text-muted-foreground animate-pulse-gentle">finding what your body needs...</span></div>}

        {aiResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-display text-base md:text-lg italic text-foreground">{aiResult.tool}</h3>
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{aiResult.reason}</p>
            <p className="font-display text-sm italic text-foreground/80 mt-3">{aiResult.instruction}</p>
          </motion.div>
        )}
      </section>

      {breathingId && <BreathingModal techniqueId={breathingId} onClose={() => setBreathingId(null)} />}
    </div>
  );
}
