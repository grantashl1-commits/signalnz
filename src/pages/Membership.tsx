import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import NetworkBackground from "@/components/NetworkBackground";
import CymaticPattern from "@/components/CymaticPatterns";

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
      <div className="fixed inset-0 -z-10"><NetworkBackground opacity={0.15} /></div>

      <div className="text-center">
        <p className="ui-label mb-3">join the network</p>
        <h1 className="font-display text-4xl md:text-5xl font-light italic text-foreground">Membership</h1>
        <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">Choose the level of support for your signal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-deep p-6 flex flex-col relative overflow-hidden ${tier.popular ? "ring-1 ring-cyan" : ""}`}
          >
            {tier.popular && (
              <span className="absolute -top-0 left-0 right-0 h-[2px] bg-cyan" />
            )}
            {tier.popular && (
              <span className="absolute top-3 right-3 rounded-full bg-cyan px-3 py-1 font-body text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                Popular
              </span>
            )}

            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-[0.05]">
              <CymaticPattern phase={i === 0 ? "menstrual" : i === 1 ? "follicular" : "ovulatory"} size={96} opacity={1} />
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
                  <Check className="h-4 w-4 text-cyan mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`mt-6 w-full rounded-lg px-4 py-3 font-body text-xs font-bold uppercase tracking-widest transition-opacity ${
                tier.popular
                  ? "bg-cyan text-primary-foreground hover:opacity-90"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {tier.price === "$0" ? "Enter the Network" : "Subscribe"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
