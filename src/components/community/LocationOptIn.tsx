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
          <HandDrawnPin size={48} color="hsl(var(--primary))" className="mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold italic text-foreground mb-2">See who's nearby</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Discover neighbours using the app in your area. Your exact address is{" "}
            <strong className="text-primary font-semibold">never shared</strong> — only your suburb is shown to others.
          </p>
        </div>

        <div className="rounded-2xl p-5 mb-5 border border-border/60" style={{ backgroundColor: "#FAF7F2" }}>
          <p className="font-body text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">What others will see</p>
          {[
            { positive: true, text: "Your first name and profile" },
            { positive: true, text: "Your suburb (e.g. Ponsonby)" },
            { positive: true, text: "Your skills and what you offer" },
            { positive: false, text: "Your street address", emphasis: "never shared" },
            { positive: false, text: "Your exact GPS location", emphasis: "never shared" },
            { positive: false, text: "When you're at home specifically" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 mb-2.5 items-start">
              <span className="flex-shrink-0 mt-0.5">
                {item.positive ? (
                  <HandDrawnCheck size={16} color="#7A9E7E" />
                ) : (
                  <HandDrawnCross size={16} color="#C97B7B" />
                )}
              </span>
              <span className="font-body text-[15px] leading-snug text-foreground/80">
                {item.text}
                {(item as any).emphasis && (
                  <> — <strong className="text-primary font-semibold">{(item as any).emphasis}</strong></>
                )}
              </span>
            </div>
          ))}
        </div>

        <p className="font-body text-[11px] text-muted-foreground text-center mb-4 leading-relaxed">
          You can turn this off at any time in your profile settings.
        </p>

        <button
          onClick={onAccept}
          className="touch-btn w-full py-4 rounded-card bg-primary text-primary-foreground font-display text-[17px] italic mb-2.5 active:scale-[0.97]"
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
