import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wind, Hand } from "lucide-react";
import BreathingModal from "@/components/BreathingModal";
import NetworkBackground from "@/components/NetworkBackground";
import CymaticPattern from "@/components/CymaticPatterns";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";

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
    <div className="max-w-3xl mx-auto space-y-12 relative">
      <div className="fixed inset-0 -z-10"><NetworkBackground opacity={0.25} /></div>

      <div>
        <p className="ui-label mb-2">nervous system</p>
        <h1 className="font-display text-4xl font-light italic text-foreground">Breathwork & Regulation</h1>
      </div>

      {/* Breathwork */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-light italic text-foreground flex items-center gap-3">
          <Wind className="h-5 w-5 text-cyan" /> Breathwork
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {BREATHWORK.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-deep p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 pointer-events-none">
                <CymaticPattern phase={info.phase} size={48} opacity={0.08} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg italic text-foreground">{b.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-widest ${
                    b.evidence === "STRONG" ? "bg-cyan/15 text-cyan" : "bg-phase-ovulatory/15 text-phase-ovulatory"
                  }`}>{b.evidence}</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mb-1">{b.pattern}</p>
                <p className="font-body text-sm text-foreground/70">{b.useCase}</p>
              </div>
              <button onClick={() => setBreathingId(b.id)}
                className="mt-4 w-full rounded-lg bg-cyan px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-opacity"
              >Enter the Frequency</button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Somatic */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-light italic text-foreground flex items-center gap-3">
          <Hand className="h-5 w-5 text-cyan" /> Somatic Tools
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SOMATIC.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-deep p-5">
              <h3 className="font-display text-lg italic text-foreground mb-2">{s.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

              {s.title === "Humming" && (
                <div className="mt-3">
                  {hummingActive ? (
                    <div className="text-center">
                      <p className="font-mono text-2xl text-foreground">{Math.floor(hummingTimer / 60)}:{(hummingTimer % 60).toString().padStart(2, "0")}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">keep humming...</p>
                    </div>
                  ) : (
                    <button onClick={startHumming} className="rounded-lg bg-cyan/10 px-4 py-2 font-body text-xs font-medium text-cyan hover:bg-cyan/20 transition-colors">Start 2-min Timer</button>
                  )}
                </div>
              )}

              {s.title === "5-4-3-2-1 Grounding" && (
                <div className="mt-3 space-y-2">
                  {groundingStep >= 0 ? (
                    <>
                      <p className="font-body text-sm text-foreground">{GROUNDING_STEPS[groundingStep]}</p>
                      <div className="flex gap-1">{GROUNDING_STEPS.map((_, idx) => <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= groundingStep ? "bg-cyan" : "bg-secondary"}`} />)}</div>
                      <button onClick={() => setGroundingStep(p => p < 4 ? p + 1 : -1)} className="rounded-lg bg-cyan/10 px-4 py-2 font-body text-xs text-cyan hover:bg-cyan/20">{groundingStep < 4 ? "Next" : "Done"}</button>
                    </>
                  ) : (
                    <button onClick={() => setGroundingStep(0)} className="rounded-lg bg-cyan/10 px-4 py-2 font-body text-xs text-cyan hover:bg-cyan/20">Begin Sequence</button>
                  )}
                </div>
              )}

              {s.title === "EFT Tapping" && (
                <div className="mt-3 space-y-2">
                  {eftStep >= 0 ? (
                    <>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="font-body text-sm font-medium text-foreground">{EFT_POINTS[eftStep].point}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{EFT_POINTS[eftStep].instruction}</p>
                      </div>
                      <div className="flex gap-0.5">{EFT_POINTS.map((_, idx) => <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= eftStep ? "bg-cyan" : "bg-secondary"}`} />)}</div>
                      <button onClick={() => setEftStep(p => p < 7 ? p + 1 : -1)} className="rounded-lg bg-cyan/10 px-4 py-2 font-body text-xs text-cyan hover:bg-cyan/20">{eftStep < 7 ? "Next Point" : "Done"}</button>
                    </>
                  ) : (
                    <button onClick={() => setEftStep(0)} className="rounded-lg bg-cyan/10 px-4 py-2 font-body text-xs text-cyan hover:bg-cyan/20">Begin Tapping</button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI */}
      <section className="card-deep p-6 space-y-4">
        <h2 className="font-display text-xl italic text-foreground">how are you feeling right now?</h2>
        <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="describe your signal..."
          className="w-full rounded-xl border border-border bg-secondary p-4 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-cyan/40 resize-none h-24"
        />
        <button onClick={handleAiCheckin} disabled={aiLoading || !aiInput.trim()}
          className="rounded-xl bg-cyan px-6 py-3 font-body text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >Get a Recommendation</button>

        {aiLoading && <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-cyan" /><span className="font-mono text-xs text-muted-foreground animate-pulse-gentle">reading your signal...</span></div>}

        {aiResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-cyan/20 bg-cyan/5 p-5">
            <h3 className="font-display text-lg italic text-foreground">{aiResult.tool}</h3>
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{aiResult.reason}</p>
            <p className="font-display text-sm italic text-foreground/80 mt-3">{aiResult.instruction}</p>
          </motion.div>
        )}
      </section>

      {breathingId && <BreathingModal techniqueId={breathingId} onClose={() => setBreathingId(null)} />}
    </div>
  );
}
