import PageHeading from "@/components/ui/PageHeading";
import { Sparkles as PageIcon } from "lucide-react";
import { useState } from "react";
import { GatedPage } from "@/components/FeatureGate";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { BotanicalSprig } from "@/components/BotanicalElements";
import DreamStudio from "@/components/journal/DreamStudio";

export default function VisionBoard() {
  const [pinnedEntry, setPinnedEntry] = useState<{ id: string; content: string } | null>(null);

  return (
    <GatedPage requiredTier="nourished">
      <div className="member-page relative">
        <PageHeading title="Dream Studio" label="Vision Board" icon={PageIcon} tone="goals">Visualise the life you're creating.</PageHeading>

        <ContentSection className="px-5 md:px-4">
          <DreamStudio pinnedEntry={pinnedEntry} />
          <BotanicalSprig width={160} className="mx-auto mt-8 md:hidden" />
          <BotanicalSprig width={200} className="mx-auto mt-10 hidden md:block" />
        </ContentSection>
      </div>
    </GatedPage>
  );
}
