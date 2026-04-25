import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  lessonTitle: string;
  insight?: string;
  xp?: number;
  onContinue: () => void;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.4,
  size: 6 + Math.random() * 8,
  color: ["#9B89B4", "#C4526E", "#5C4A9E", "#C47A8A", "#f59e0b"][Math.floor(Math.random() * 5)],
  rotation: Math.random() * 360,
}));

export default function LessonMilestone({ lessonTitle, insight, xp = 50, onContinue }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    haptic("medium");
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    haptic("light");
    onContinue();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: "hsla(var(--background), 0.92)", backdropFilter: "blur(8px)" }}
        >
          {/* Confetti particles */}
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: "-10px",
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                rotate: p.rotation,
              }}
              animate={{
                top: ["−10px", "110vh"],
                rotate: [p.rotation, p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.8 + Math.random() * 1.2,
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
            className="relative mx-6 max-w-sm w-full rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Gradient top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-rose-500" />

            <div className="p-8 text-center space-y-5">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.25 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-1.5"
              >
                <p className="font-body text-xs uppercase tracking-[0.2em] text-primary/60">Lesson complete</p>
                <h2 className="font-display text-xl font-extrabold text-foreground leading-tight">{lessonTitle}</h2>
              </motion.div>

              {/* XP badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-4 py-1.5 rounded-full"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-body text-sm font-bold">+{xp} XP</span>
              </motion.div>

              {/* Key insight */}
              {insight && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left"
                >
                  <p className="font-body text-[10px] uppercase tracking-wider text-primary/50 mb-1.5">Key insight</p>
                  <p className="font-display text-sm italic text-foreground leading-relaxed">"{insight}"</p>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                onClick={handleContinue}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-body text-base font-bold"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
