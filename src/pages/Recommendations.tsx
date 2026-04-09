import { motion } from "framer-motion";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { BotanicalSprig } from "@/components/BotanicalElements";

export default function RecommendationsPage() {
  return (
    <GatedPage requiredTier="thriving">
      <div className="relative">
        <AtmosphericHero size="sm">
          <SignalPulse />
          <div className="text-center relative z-10">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">curated</p>
            <h1 className="font-display text-[2.5rem] md:text-[3rem] font-extrabold text-primary-foreground leading-[1.02]">
              Recommendations
            </h1>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          <div className="max-w-lg mx-auto py-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <p className="font-body text-[10px] tracking-widest uppercase text-primary mb-3">
                curating now
              </p>
              <h2 className="font-display text-3xl italic text-foreground/90 mb-4">
                Recommendations
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                We're building a carefully selected collection of supplements, tools, and brands aligned with your cycle — no noise, no greenwashing. Back soon.
              </p>
            </motion.div>
          </div>
          <BotanicalSprig width={140} className="mx-auto mt-6" />
        </ContentSection>
      </div>
    </GatedPage>
  );
}