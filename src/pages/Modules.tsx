import { motion } from "framer-motion";
import { Lock, BookOpen } from "lucide-react";

const MODULES = [
  { title: "Cycle Literacy", sessions: 4, desc: "Understand your hormonal blueprint", unlocked: true },
  { title: "Vegan Hormonal Nutrition", sessions: 4, desc: "Eat for your cycle, not against it", unlocked: false },
  { title: "Strength Foundations", sessions: 4, desc: "Build a body that supports your hormones", unlocked: false },
  { title: "Nervous System Reset", sessions: 4, desc: "Regulate from the inside out", unlocked: false },
  { title: "Seed Cycling & Phytoestrogens", sessions: 3, desc: "Harness plant power for hormonal balance", unlocked: false },
  { title: "Sleep & Cortisol", sessions: 3, desc: "The foundation everything else depends on", unlocked: false },
];

export default function ModulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Modules</h1>
        <p className="text-muted-foreground mt-1">Deep-dive learning programmes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card-warm p-6 flex flex-col justify-between ${!m.unlocked ? "opacity-70" : ""}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="h-5 w-5 text-accent" />
                {!m.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{m.title}</h3>
              <p className="text-xs text-accent font-medium mt-1">{m.sessions} sessions</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
            </div>
            <button
              disabled={!m.unlocked}
              className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity ${
                m.unlocked
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {m.unlocked ? "Start Module" : "Locked"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
