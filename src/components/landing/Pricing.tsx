import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { TIERS } from "@/data/membership-tiers";
import { FadeUp, RevealLines } from "./primitives";

/** Membership on the landing page — prices and features come from the same data as /membership. */
export default function Pricing() {
  return (
    <section id="pricing" className="bg-secondary px-6 md:px-12 py-24 md:py-32" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-muted-foreground mb-4">Membership · NZD</p>
        <RevealLines
          as="h2"
          className="display-serif max-w-3xl text-[2.75rem] md:text-[4.5rem] text-foreground"
          lines={["Start free.", <>Go deeper <em className="text-primary">when you're ready.</em></>]}
        />
        <h2 id="pricing-heading" className="sr-only">Membership plans</h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => {
            const featured = tier.popular;
            const features = tier.sections[tier.sections.length - 1].features.slice(0, 4);
            return (
              <FadeUp key={tier.key} delay={i * 0.06} className="h-full">
                <article
                  className={`flex h-full flex-col rounded-[28px] p-6 md:p-7 ${
                    featured ? "bg-aubergine text-background shadow-elevated" : "border border-border bg-card text-foreground shadow-soft"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="display-serif text-[2rem]">{tier.name}</h3>
                    {featured && <span className="rounded-full bg-background/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Most chosen</span>}
                  </div>
                  <p className={`mt-1 text-[13px] ${featured ? "text-background/70" : "text-muted-foreground"}`}>{tier.tagline}</p>
                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="display-serif text-[3rem] leading-none">{tier.monthlyPrice}</span>
                    <span className={`text-[13px] ${featured ? "text-background/60" : "text-muted-foreground"}`}>{tier.period === "forever" ? "forever" : "/ month"}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {features.map((f) => (
                      <li key={f} className={`flex gap-2.5 text-[13px] leading-snug ${featured ? "text-background/85" : "text-foreground/80"}`}>
                        <Check className={`mt-0.5 h-3.5 w-3.5 flex-none ${featured ? "text-[hsl(var(--plum-glow))]" : "text-primary"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={tier.key === "free" ? "/auth" : "/membership"}
                    className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-[14px] font-semibold transition-transform hover:scale-[1.02] ${
                      featured ? "bg-background text-foreground" : "bg-foreground text-background"
                    }`}
                  >
                    {tier.key === "free" ? "Start free" : `Choose ${tier.name}`}
                  </Link>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
