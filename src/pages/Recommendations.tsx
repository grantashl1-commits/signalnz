import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SeedGeometry, BotanicalSprig } from "@/components/BotanicalElements";
import { SelfCareHandIcon } from "@/components/SelfCareIcons";

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.06 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

const SUPPLEMENT_SPONSORS = [
  { name: "Brand name here", product: "Premium vegan omega-3 supplement.", code: "MINDCAST10", nz: true },
  { name: "Brand name here", product: "Magnesium glycinate for cycle support.", code: "MINDCAST15", nz: true },
  { name: "Brand name here", product: "Seed cycling blend — pumpkin, flax, sunflower, sesame.", code: "MINDCAST10", nz: true },
  { name: "Brand name here", product: "B-complex formulated for hormonal health.", code: "MINDCAST10", nz: true },
];

const SELF_CARE_SPONSORS = [
  { name: "Massage gun brand", product: "Percussive therapy for post-workout recovery.", code: "MINDCAST10", nz: true, slot: "Massage Gun" },
  { name: "Red light therapy brand", product: "Full-face red light mask for skin and collagen.", code: "MINDCAST10", nz: true, slot: "Red Light Therapy" },
  { name: "Sauna brand", product: "Full-spectrum infrared sauna for home use.", code: "MINDCAST10", nz: true, slot: "Infrared Sauna (e.g. Clearlight NZ)" },
  { name: "Cold therapy brand", product: "Ice plunge bath designed for home cold therapy.", code: "MINDCAST10", nz: true, slot: "Recovery / Cold Therapy" },
  { name: "Bath & mineral brand", product: "Pure magnesium flakes and Epsom salts for soaking.", code: "MINDCAST10", nz: true, slot: "Bath & Mineral Soak" },
];

export default function RecommendationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 relative">
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 pointer-events-none">
        <SeedGeometry size={130} opacity={0.06} className="md:hidden" />
        <SeedGeometry size={200} opacity={0.08} className="hidden md:block" />
      </div>

      <div>
        <p className="font-hand text-sm font-bold text-primary">curated</p>
        <h1 className="font-display text-[1.75rem] md:text-4xl font-bold italic text-foreground">Recommendations</h1>
        <p className="font-display text-sm italic text-muted-foreground mt-1">
          Products and tools we trust for cycle-synced wellness.
        </p>
        <BotanicalSprig width={180} className="mt-3 mx-auto md:hidden" />
        <BotanicalSprig width={250} className="mt-3 mx-auto hidden md:block" />
      </div>

      {/* Supplements Section */}
      <section>
        <h2 className="font-display text-xl italic font-bold text-foreground mb-4">Supplements we trust.</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SUPPLEMENT_SPONSORS.map((sponsor, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              className="card-warm p-5 border-t-[3px]"
              style={{ borderTopColor: "hsl(var(--sage-mist))" }}
            >
              <p className="font-hand text-sm text-muted-foreground">{sponsor.name}</p>
              <p className="font-body text-sm text-foreground mt-1">{sponsor.product}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  Code: {sponsor.code}
                </span>
                <button className="touch-btn flex items-center gap-1 font-hand text-xs font-bold text-primary">
                  Learn more <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              {sponsor.nz && (
                <p className="font-body text-[10px] italic text-muted-foreground mt-2">
                  Available in New Zealand.
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Self Care Tools Section */}
      <section>
        <h2 className="font-display text-xl italic font-bold text-foreground mb-1">Tools we love.</h2>
        <p className="font-display text-sm italic text-muted-foreground mb-4">
          Self care tools for your home practice.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SELF_CARE_SPONSORS.map((sponsor, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              className="card-warm p-5 border-t-[3px]"
              style={{ borderTopColor: "hsl(var(--bloom-blush))" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <SelfCareHandIcon size={24} color="#F2A7C3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-hand text-sm text-muted-foreground">{sponsor.name}</p>
                  <p className="font-hand text-[10px] text-bloom">{sponsor.slot}</p>
                  <p className="font-body text-sm text-foreground mt-1">{sponsor.product}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  Code: {sponsor.code}
                </span>
                <button className="touch-btn flex items-center gap-1 font-hand text-xs font-bold text-primary">
                  Learn more <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              {sponsor.nz && (
                <p className="font-body text-[10px] italic text-muted-foreground mt-2">
                  Available in New Zealand.
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
