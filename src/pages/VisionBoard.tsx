import { useState } from "react";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import { BotanicalSprig } from "@/components/BotanicalElements";
import DreamStudio from "@/components/journal/DreamStudio";

export default function VisionBoard() {
  const [pinnedEntry, setPinnedEntry] = useState<{ id: string; content: string } | null>(null);

  return (
    <GatedPage requiredTier="nourished">
      <div className="relative">
        <AtmosphericHero size="md">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Vision Board</p>
            <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">
              Dream Studio
            </h1>
            <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-md">
              Visualise the life you're creating.
            </p>
          </div>
        </AtmosphericHero>

        <ContentSection className="px-5 md:px-4">
          <DreamStudio pinnedEntry={pinnedEntry} />
          <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
          <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
        </ContentSection>
      </div>
    </GatedPage>
  );
}
