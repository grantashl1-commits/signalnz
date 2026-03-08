import { motion } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";
import { CymatiSketch, SeedGeometry } from "@/components/BotanicalElements";

const MODULES = [
  { title: "Cycle Literacy", sessions: 4, desc: "Understand your hormonal blueprint", unlocked: true, phase: "follicular" as const },
  { title: "Vegan Hormonal Nutrition", sessions: 4, desc: "Eat for your cycle, not against it", unlocked: false, phase: "ovulatory" as const },
  { title: "Strength Foundations", sessions: 4, desc: "Build a body that supports your hormones", unlocked: false, phase: "follicular" as const },
  { title: "Nervous System Reset", sessions: 4, desc: "Regulate from the inside out", unlocked: false, phase: "luteal" as const },
  { title: "Seed Cycling & Phytoestrogens", sessions: 3, desc: "Harness plant power for hormonal balance", unlocked: false, phase: "ovulatory" as const },
  { title: "Sleep & Cortisol", sessions: 3, desc: "The foundation everything else depends on", unlocked: false, phase: "menstrual" as const },
];

export default function ModulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 relative">
      <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 pointer-events-none">
        <SeedGeometry size={200} opacity={0.08} />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">learning</p>
        <h1 className="font-display text-4xl font-bold italic text-foreground">Modules</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Deep-dive learning programmes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card-warm p-6 flex flex-col justify-between relative overflow-hidden ${!m.unlocked ? "opacity-50" : ""}`}
          >
            <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none">
              <CymatiSketch phase={m.phase} size={64} opacity={0.06} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="h-5 w-5 text-phase-follicular" />
                {!m.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="font-display text-lg italic text-foreground">{m.title}</h3>
              <p className="font-hand text-sm text-primary mt-1">{m.sessions} sessions</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
            </div>
            <button
              disabled={!m.unlocked}
              className={`mt-4 w-full rounded-xl px-4 py-2.5 font-body text-sm font-bold transition-opacity ${
                m.unlocked ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {m.unlocked ? "Enter Module" : "Locked"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
