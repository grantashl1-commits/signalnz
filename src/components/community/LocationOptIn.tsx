import { motion } from "framer-motion";
import { HandDrawnPin, HandDrawnCheck, HandDrawnCross } from "@/components/BotanicalElements";

interface LocationOptInProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function LocationOptIn({ onAccept, onDecline }: LocationOptInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 flex items-end z-[1000]"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full bg-background rounded-t-3xl px-6 pt-7 max-w-[480px] mx-auto"
        style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />

        <div className="text-center mb-5">
          <HandDrawnPin size={44} color="hsl(var(--primary))" className="mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold italic text-foreground mb-2">See who's nearby</h2>
          <p className="font-display text-sm italic text-muted-foreground leading-relaxed">
            Discover neighbours using the app in your area. Your exact address is{" "}
            <strong className="text-foreground">never shared</strong> — only your suburb is shown to others.
          </p>
        </div>

        <div className="card-warm p-4 mb-5">
          <p className="font-mono text-[11px] text-phase-follicular mb-2.5">What others will see</p>
          {[
            { positive: true, text: "Your first name and profile" },
            { positive: true, text: "Your suburb (e.g. Ponsonby)" },
            { positive: true, text: "Your skills and what you offer" },
            { positive: false, text: "Your street address — never shared" },
            { positive: false, text: "Your exact GPS location — never shared" },
            { positive: false, text: "When you're at home specifically" },
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 mb-2 items-start">
              <span className="flex-shrink-0 mt-0.5">
                {item.positive ? (
                  <HandDrawnCheck size={14} color="hsl(var(--phase-follicular))" />
                ) : (
                  <HandDrawnCross size={14} color="hsl(var(--phase-menstrual))" />
                )}
              </span>
              <span className={`font-mono text-xs leading-snug ${item.positive ? "text-foreground/70" : "text-muted-foreground"}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-muted-foreground text-center mb-4 leading-relaxed">
          You can turn this off at any time in your profile settings.
        </p>

        <button
          onClick={onAccept}
          className="touch-btn w-full py-4 rounded-[14px] bg-primary text-primary-foreground font-display text-[17px] italic mb-2.5 active:scale-[0.97]"
        >
          Yes, show me nearby people
        </button>
        <button
          onClick={onDecline}
          className="touch-btn w-full py-3 text-muted-foreground font-display text-[15px] italic bg-transparent border-none"
        >
          Not right now
        </button>
      </motion.div>
    </motion.div>
  );
}
