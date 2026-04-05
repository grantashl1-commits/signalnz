import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SeedGeometry } from "@/components/BotanicalElements";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute top-10 right-10 pointer-events-none opacity-[0.06]">
        <SeedGeometry size={160} opacity={1} />
      </div>
        className="text-center z-10 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground/40 mb-4">
          lost on the path
        </p>
        <h1 className="font-display text-5xl italic text-foreground/90 mb-3">
          404
        </h1>
        <p className="font-body text-foreground/50 text-sm leading-relaxed mb-8">
          This page doesn't exist. Like thoughts that pass through — let it go.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-foreground/60 border border-border rounded-full px-5 py-3 hover:border-foreground/30 hover:text-foreground/80 transition-all"
        >
          return home
        </Link>
      </motion.div>
    </div>
  );
}