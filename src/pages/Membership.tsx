import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { SeedGeometry, BotanicalSprig, CymatiSketch } from "@/components/BotanicalElements";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    popular: false,
    features: ["Cycle tracker", "Daily check-in", "Basic phase guidance"],
  },
  {
    name: "Nourished",
    price: "$19",
    period: "/mo",
    popular: true,
    features: ["AI meal ideas for your phase", "Full movement library", "Breathwork guides", "Journaling tools"],
  },
  {
    name: "Thriving",
    price: "$39",
    period: "/mo",
    popular: false,
    features: ["Full module library", "AI nervous system check-in", "Weekly phase reports", "Priority features"],
  },
];

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 relative">
      <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 pointer-events-none">
        <SeedGeometry size={180} opacity={0.08} />
      </div>

      <div className="text-center">
        <p className="font-hand text-lg text-primary mb-2">join the journey</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold italic text-foreground">Membership</h1>
        <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">Choose the level of support that feels right</p>
      </div>

      <BotanicalSprig width={200} className="mx-auto" />

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-warm p-6 flex flex-col relative overflow-hidden ${tier.popular ? "ring-1 ring-primary" : ""}`}
          >
            {tier.popular && (
              <span className="absolute -top-0 left-0 right-0 h-[2px] bg-primary" />
            )}
            {tier.popular && (
              <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 font-hand text-[11px] font-bold text-primary-foreground">
                Popular
              </span>
            )}

            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-[0.05]">
              <CymatiSketch phase={i === 0 ? "menstrual" : i === 1 ? "follicular" : "ovulatory"} size={80} opacity={1} />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {tier.name === "Thriving" && <Crown className="h-5 w-5 text-phase-ovulatory" />}
                <h3 className="font-display text-xl italic text-foreground">{tier.name}</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl text-foreground">{tier.price}</span>
                <span className="font-body text-sm text-muted-foreground">{tier.period}</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 font-body text-sm text-foreground/80">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`mt-6 w-full rounded-xl px-4 py-3 font-body text-sm font-bold transition-opacity ${
                tier.popular
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {tier.price === "$0" ? "Get Started" : "Subscribe"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
