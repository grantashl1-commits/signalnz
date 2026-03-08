import { motion } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";
import CymaticPattern from "@/components/CymaticPatterns";
import NetworkBackground from "@/components/NetworkBackground";

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
      <div className="fixed inset-0 -z-10"><NetworkBackground opacity={0.15} /></div>

      <div>
        <p className="ui-label mb-2">learning network</p>
        <h1 className="font-display text-4xl font-light italic text-foreground">Modules</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Deep-dive learning programmes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card-deep p-6 flex flex-col justify-between relative overflow-hidden ${!m.unlocked ? "opacity-50" : ""}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 -translate-y-4 translate-x-4 pointer-events-none">
              <CymaticPattern phase={m.phase} size={80} opacity={0.08} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="h-5 w-5 text-cyan" />
                {!m.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="font-display text-lg italic text-foreground">{m.title}</h3>
              <p className="font-mono text-[10px] text-cyan mt-1">{m.sessions} sessions</p>
              <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
            </div>
            <button
              disabled={!m.unlocked}
              className={`mt-4 w-full rounded-lg px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest transition-opacity ${
                m.unlocked ? "bg-cyan text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"
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
