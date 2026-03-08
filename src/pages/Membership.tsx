import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";

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
    features: [
      "AI meal ideas for your phase",
      "Full movement library",
      "Breathwork guides",
      "Journaling tools",
    ],
  },
  {
    name: "Thriving",
    price: "$39",
    period: "/mo",
    popular: false,
    features: [
      "Full module library",
      "AI nervous system check-in",
      "Weekly phase reports",
      "Priority features",
    ],
  },
];

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Membership</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">Choose the level of support that fits your wellness journey</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-warm p-6 flex flex-col relative ${
              tier.popular ? "ring-2 ring-accent shadow-lg" : ""
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground uppercase tracking-wider">
                Most Popular
              </span>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {tier.name === "Thriving" && <Crown className="h-5 w-5 text-gold" />}
                <h3 className="font-display text-xl font-semibold text-foreground">{tier.name}</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
            </div>

            <ul className="space-y-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-medium transition-opacity ${
                tier.popular
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-foreground hover:bg-accent/10"
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
