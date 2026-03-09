import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, ArrowLeft } from "lucide-react";
import { SeedGeometry, BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";
import { getCycleInfo, getLastPeriodStart } from "@/lib/cycle-utils";
import { haptic } from "@/hooks/use-mobile";

// ── DATA ──────────────────────────────────────────────────────
const BREATHWORK_PATTERNS = [
  { id: "box", name: "Box Breathing", tag: "strong evidence", rhythm: "4-4-4-4", use: "Acute stress and focus", desc: "Equalises all four phases of the breath to create immediate nervous system balance.", phases: ["Inhale", "Hold", "Exhale", "Hold"], times: [4, 4, 4, 4] },
  { id: "sigh", name: "Physiological Sigh", tag: "strong evidence", rhythm: "Double inhale + long exhale", use: "Panic and overwhelm", desc: "The fastest-known way to reduce acute stress. Your body already does this instinctively.", phases: ["Inhale", "Sniff", "Long Exhale"], times: [2, 1, 6] },
  { id: "coherence", name: "Coherent Breathing", tag: "strong evidence", rhythm: "5 breaths per minute", use: "Daily regulation and HRV", desc: "5-5 rhythm synchronises heart rate variability — the gold standard for daily nervous system health.", phases: ["Inhale", "Exhale"], times: [5, 5] },
  { id: "478", name: "4-7-8 Breathing", tag: "emerging evidence", rhythm: "4-7-8", use: "Sleep and deep calm", desc: "Dr. Weil's natural tranquiliser. The extended hold activates a profound parasympathetic response.", phases: ["Inhale", "Hold", "Exhale"], times: [4, 7, 8] },
];

const SOMATIC_EXERCISES = [
  { id: "grounding", name: "5-4-3-2-1 Grounding", dur: "5 min", cat: "Grounding", emoji: "🌱", benefit: "Interrupts anxiety spirals by anchoring all five senses in the present moment.", steps: ["Find a comfortable seat. Take three slow breaths and simply arrive here.", "Notice 5 things you can SEE — name them silently, one by one.", "Notice 4 things you can TOUCH. Feel each texture with curiosity.", "Notice 3 things you can HEAR right now, in this moment.", "Notice 2 things you can SMELL, or bring familiar scents to mind.", "Notice 1 thing you can TASTE.", "Return to your breath. You are here. You are safe. You are present."] },
  { id: "butterfly", name: "Butterfly Hug", dur: "5 min", cat: "Self-soothing", emoji: "🦋", benefit: "Bilateral stimulation as used in EMDR therapy. Calms the nervous system and gently integrates stored emotion.", steps: ["Cross your arms over your chest, hands resting on opposite shoulders.", "Close your eyes or soften your gaze downward toward the floor.", "Slowly alternate tapping — left, right, left, right — like butterfly wings.", "Breathe slowly and naturally as you continue.", "Notice what arises — feelings, images, sensations — and observe without judgment.", "Continue for 3–5 minutes, or until a natural sense of calm arrives.", "Rest both hands still over your heart. Feel it beating. You are held."] },
  { id: "orienting", name: "Somatic Orienting", dur: "5 min", cat: "Safety", emoji: "🧭", benefit: "Activates the vagus nerve's social engagement system — signalling to your body: I am safe right now.", steps: ["Sit or stand. Take a moment to simply arrive in your body.", "Like a curious animal, slowly begin to look around the space.", "Let your gaze move without agenda — soft, unhurried, open.", "Let your head and neck follow your gaze naturally.", "Notice anything that brings a sense of safety, pleasure or ease.", "Rest your gaze there. Notice what happens in your body.", "Feel your feet on the floor. The weight of gravity holding you. You are safe."] },
  { id: "shaking", name: "Neurogenic Tremoring", dur: "15 min", cat: "Release", emoji: "🌊", benefit: "Releases deep muscular tension stored from stress and trauma. Your body's innate way to discharge survival energy (TRE).", steps: ["Stand feet hip-width. Soften your knees. Take a breath.", "Rise onto your toes 20 times to gently fatigue the calves.", "Lower feet flat. Bend knees to 45° as if sitting against a wall.", "Hold this position. Let the natural trembling begin — don't force it.", "Allow the shaking to travel through your body. This is medicine.", "Lie down and let the tremors continue gently as your body releases.", "Rest 5 minutes. Notice the warmth, softness or quiet that follows."] },
  { id: "havening", name: "Havening Touch", dur: "8 min", cat: "Self-soothing", emoji: "🤲", benefit: "Uses sensory input to depotentiate stress-encoded memories. Developed by Dr Ronald Ruden. Deeply calming.", steps: ["Bring to mind something mildly stressful — save deeply traumatic memories for your therapist.", "Rate your distress 0–10. Hold that number lightly.", "Stroke your arms slowly from shoulder to elbow, again and again.", "Now stroke your palms together slowly, as if washing your hands.", "Then stroke gently under your eyes, from cheekbones to temples.", "While doing this, count softly to 20, or hum a simple melody.", "Check in. Has the number reduced? Repeat until you feel lighter."] },
  { id: "bodyscan", name: "Somatic Body Scan", dur: "15 min", cat: "Awareness", emoji: "🔍", benefit: "Builds interoceptive awareness — your ability to hear and trust your body's wisdom. The foundation of emotional intelligence.", steps: ["Lie down comfortably. Close your eyes. Take 3 slow, deep breaths.", "Bring awareness to the crown of your head. What do you notice?", "Move slowly down: forehead, eyes, jaw. Where are you holding tension?", "Continue to throat, chest, heart space. What feelings live here?", "Move into your belly — your emotional centre. Breathe into it softly.", "Continue to hips, thighs, knees, calves, feet. Ground into the earth.", "Expand awareness to your whole body as one. Ask: what does my body need to tell me today?"] },
];

const MEDITATIONS = [
  { id: "rain", title: "RAIN Meditation", teacher: "Tara Brach", dur: "20 min", type: "IFS & Self-Compassion", desc: "Meet difficult emotions with compassion using RAIN: Recognize, Allow, Investigate, Nurture.", yt: "2-V8RDcuYuA", tags: ["IFS", "emotions", "self-compassion"] },
  { id: "nsdr", title: "NSDR / Yoga Nidra", teacher: "Huberman Lab Protocol", dur: "10 min", type: "Deep Rest", desc: "Non-Sleep Deep Rest — science-backed restoration that recovers energy and resets the nervous system.", yt: "AKGrmY8ORSE", tags: ["rest", "recovery", "nervous system"] },
  { id: "lkm", title: "Loving Kindness", teacher: "Sharon Salzberg", dur: "18 min", type: "Self-Love", desc: "Cultivate unconditional love beginning with yourself. Transforms your relationship with the parts you've judged or abandoned.", yt: "sz7cpV7ERsM", tags: ["self-love", "compassion", "healing"] },
  { id: "innerchild", title: "Meeting Your Inner Child", teacher: "IFS Visualization", dur: "22 min", type: "Inner Work", desc: "A tender guided journey to meet and offer comfort to the younger parts of yourself.", yt: "ZToicYcHIOU", tags: ["IFS", "inner child", "parts work"] },
  { id: "mbsr", title: "MBSR Body Scan", teacher: "Jon Kabat-Zinn", dur: "45 min", type: "Body Awareness", desc: "The foundational mindfulness body scan from the pioneer of MBSR. Builds the somatic intelligence your healing needs.", yt: "u4gZgnCy5ew", tags: ["body", "MBSR", "awareness"] },
  { id: "thich", title: "Breath & Present Moment", teacher: "Thich Nhat Hanh", dur: "15 min", type: "Mindfulness", desc: "A gentle return to the present moment from one of humanity's most beloved teachers.", yt: "2-V8RDcuYuA", tags: ["breath", "presence", "peace"] },
];

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const } }),
};

// ── BREATHWORK TIMER ──────────────────────────────────────────
function BreathworkTimer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [rounds, setRounds] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const pattern = BREATHWORK_PATTERNS.find((p) => p.id === selected);

  useEffect(() => {
    if (active && pattern) {
      ref.current = setInterval(() => {
        setTick((t) => {
          if (t + 1 >= pattern.times[phaseIdx]) {
            setPhaseIdx((i) => {
              const next = (i + 1) % pattern.phases.length;
              if (next === 0) setRounds((r) => r + 1);
              return next;
            });
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active, pattern, phaseIdx]);

  const stop = () => {
    setActive(false);
    setPhaseIdx(0);
    setTick(0);
    if (ref.current) clearInterval(ref.current);
  };

  if (active && pattern) {
    const scale = 0.55 + 0.45 * (tick / pattern.times[phaseIdx]);
    return (
      <div className="flex flex-col items-center pt-8">
        <div className="relative w-60 h-60 flex items-center justify-center mb-7">
          <div
            className="absolute inset-0 rounded-full bg-primary/8 transition-transform ease-in-out"
            style={{ transform: `scale(${scale})`, transitionDuration: `${pattern.times[phaseIdx]}s` }}
          />
          <div className="absolute w-[68%] h-[68%] rounded-full bg-primary/12 border border-primary/25" />
          <div className="absolute w-[46%] h-[46%] rounded-full bg-primary/18" />
          <div className="relative text-center z-10">
            <p className="font-display text-xl italic text-primary mb-1">{pattern.phases[phaseIdx]}</p>
            <p className="font-mono text-5xl text-foreground font-light">{pattern.times[phaseIdx] - tick}</p>
          </div>
        </div>
        <p className="font-display text-xl italic text-foreground mb-0.5">{pattern.name}</p>
        <p className="font-mono text-xs text-muted-foreground mb-8">round {rounds + 1}</p>
        <button
          onClick={stop}
          className="touch-btn font-display text-base italic text-primary border-[1.5px] border-primary rounded-full px-8 py-2.5 active:opacity-70"
        >
          end session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {BREATHWORK_PATTERNS.map((p, i) => (
        <motion.div
          key={p.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className={`card-warm p-5 cursor-pointer touch-card ${selected === p.id ? "ring-[1.5px] ring-primary" : ""}`}
          onClick={() => setSelected(p.id)}
        >
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-display text-lg italic text-foreground">{p.name}</h3>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">
              {p.tag}
            </span>
          </div>
          <p className="font-mono text-[13px] text-muted-foreground mb-1">{p.rhythm}</p>
          <p className="font-body text-[15px] text-foreground/70 mb-1">{p.use}</p>
          {selected === p.id && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="font-display text-[13px] italic text-muted-foreground leading-relaxed mb-2.5"
            >
              {p.desc}
            </motion.p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              haptic("medium");
              setSelected(p.id);
              setActive(true);
              setPhaseIdx(0);
              setTick(0);
              setRounds(0);
            }}
            className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90 mt-2"
          >
            begin this practice →
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── SOMATIC SECTION ───────────────────────────────────────────
function SomaticSection() {
  const [open, setOpen] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const ex = SOMATIC_EXERCISES.find((e) => e.id === open);

  if (open && ex) {
    return (
      <div>
        <button
          onClick={() => setOpen(null)}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-4 active:opacity-70"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back to practices
        </button>
        <div className="card-warm p-5">
          <div className="text-3xl mb-2">{ex.emoji}</div>
          <h3 className="font-display text-xl italic text-foreground mb-1.5">{ex.name}</h3>
          <div className="flex gap-1.5 mb-3.5">
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">{ex.cat}</span>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{ex.dur}</span>
          </div>
          <div className="bg-secondary/40 border-l-[3px] border-primary rounded-xl p-3.5 mb-5">
            <p className="font-display text-[13px] italic text-foreground/70 leading-relaxed">{ex.benefit}</p>
          </div>

          {ex.steps.map((s, i) => (
            <div key={i} className={`flex gap-3 mb-3.5 ${i < step ? "opacity-40" : ""}`}>
              <div
                className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[11px] ${
                  i < step
                    ? "bg-phase-follicular/10 text-phase-follicular"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <p className={`font-display text-sm leading-relaxed pt-0.5 ${i === step ? "italic text-foreground" : "text-muted-foreground/60"}`}>
                {s}
              </p>
            </div>
          ))}

          <div className="flex gap-2 mt-5">
            {step > 0 && (
              <button
                onClick={() => { haptic("light"); setStep((s) => s - 1); }}
                className="touch-btn font-display text-sm italic text-muted-foreground bg-secondary rounded-full px-5 py-2.5 active:opacity-70"
              >
                ← previous
              </button>
            )}
            {step < ex.steps.length - 1 ? (
              <button
                onClick={() => { haptic("light"); setStep((s) => s + 1); }}
                className="touch-btn font-display text-sm italic text-primary-foreground bg-primary rounded-full px-6 py-2.5 active:opacity-90"
              >
                next →
              </button>
            ) : (
              <button
                onClick={() => { haptic("medium"); setStep(0); setOpen(null); }}
                className="touch-btn font-display text-sm italic text-primary-foreground bg-phase-follicular rounded-full px-6 py-2.5 active:opacity-90"
              >
                complete ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {SOMATIC_EXERCISES.map((e, i) => (
        <motion.div
          key={e.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className="card-warm p-5"
        >
          <div className="flex gap-3 items-start mb-3">
            <span className="text-[26px]">{e.emoji}</span>
            <div className="flex-1">
              <h3 className="font-display text-lg italic text-foreground mb-1">{e.name}</h3>
              <div className="flex gap-1.5 mb-1.5">
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">{e.cat}</span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{e.dur}</span>
              </div>
              <p className="font-display text-[13px] italic text-muted-foreground leading-relaxed">{e.benefit}</p>
            </div>
          </div>
          <button
            onClick={() => { haptic("medium"); setOpen(e.id); setStep(0); }}
            className="touch-btn w-full rounded-[14px] bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90"
          >
            begin this practice →
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── MEDITATIONS ───────────────────────────────────────────────
function MeditationsSection() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {MEDITATIONS.map((m, i) => (
        <motion.div
          key={m.id}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariant}
          className="card-warm p-4"
        >
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0">
              {playing === m.id ? (
                <div className="w-[110px] rounded-xl overflow-hidden">
                  <iframe
                    width="110"
                    height="62"
                    src={`https://www.youtube.com/embed/${m.yt}?autoplay=1`}
                    allow="autoplay"
                    className="border-none block"
                    title={m.title}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setPlaying(m.id)}
                  className="w-[110px] h-[62px] rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center active:opacity-80"
                >
                  <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[15px] border-l-primary ml-1" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-1.5">
                <h3 className="font-display text-[17px] italic text-foreground leading-snug">{m.title}</h3>
                <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">{m.dur}</span>
              </div>
              <p className="font-mono text-xs text-primary mt-0.5 mb-1">{m.teacher}</p>
              <p className="font-display text-xs italic text-muted-foreground leading-snug mb-2">{m.desc}</p>
              <div className="flex flex-wrap gap-1">
                {m.tags.map((t) => (
                  <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-phase-follicular/10 text-phase-follicular">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function BreathworkPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const [section, setSection] = useState<"breathwork" | "somatic" | "meditations">("breathwork");

  const sections = [
    { id: "breathwork" as const, label: "Breathwork" },
    { id: "somatic" as const, label: "Somatic" },
    { id: "meditations" as const, label: "Meditations" },
  ];

  const titles = {
    breathwork: "Breathwork & Regulation",
    somatic: "Somatic Practices",
    meditations: "Meditations",
  };

  const icons = {
    breathwork: "≈",
    somatic: "◎",
    meditations: "♩",
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {/* Background */}
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 pointer-events-none">
        <SeedGeometry size={160} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={250} opacity={0.08} className="hidden md:block" />
      </div>

      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl text-primary">{icons[section]}</span>
          <h1 className="font-display text-[1.5rem] md:text-3xl font-bold italic text-foreground">{titles[section]}</h1>
        </div>
      </div>

      {/* Sub-nav pill */}
      <div className="mb-6">
        <div className="flex bg-muted/60 rounded-2xl p-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { haptic("light"); setSection(s.id); }}
              className={`flex-1 py-2 rounded-xl font-display text-sm transition-all ${
                section === s.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground italic"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {section === "breathwork" && <BreathworkTimer />}
          {section === "somatic" && <SomaticSection />}
          {section === "meditations" && <MeditationsSection />}
        </motion.div>
      </AnimatePresence>

      <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
      <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
    </div>
  );
}
