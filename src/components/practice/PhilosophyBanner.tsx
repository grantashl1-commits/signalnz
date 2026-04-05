import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function PhilosophyBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("practice_philosophy_dismissed") === "true";
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("practice_philosophy_dismissed", "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-[18px] bg-card border border-primary/10 p-6 shadow-soft mb-8 relative"
      >
        <button
          onClick={handleDismiss}
          className="touch-btn absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <p className="font-body text-sm text-muted-foreground italic leading-relaxed pr-8">
          "Before supplements, biohacking, and wellness apps, humans stayed well by doing simple things consistently. 
          Morning light. Cold water. Movement throughout the day. Real food. Rest. Connection. 
          Signal's Daily Practice is built on what our bodies have always known — validated by modern science, 
          traditional Chinese medicine, and Ayurvedic wisdom. You don't need to do everything. 
          You need to do the right things, consistently."
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
