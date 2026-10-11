import PageHeading from "@/components/ui/PageHeading";
import { Compass as PageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EXPLORE_GROUPS } from "@/lib/navigation";
import { useCycle } from "@/contexts/CycleContext";
import { PHASE_SHORT } from "@/lib/cycle-utils";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Explore() {
  const { currentPhase, currentCycleDay } = useCycle();
  const phaseColor = `hsl(var(--phase-${currentPhase}))`;

  return (
    <div className="member-page mx-auto max-w-5xl px-5 md:px-8 pt-8 md:pt-12 pb-28">
      <PageHeading title="Explore" label="Everything in its place" icon={PageIcon} tone="goals">Your days live in Today, Eat, Move and Reflect. Find the rest here.</PageHeading>

      {/* Cycle lens summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.08, ease }}
      >
        <Link
          to="/cycle"
          className="group relative mb-12 flex items-center gap-5 overflow-hidden rounded-[28px] bg-aubergine p-6 md:p-8 text-background shadow-elevated"
        >
          <div className="aurora opacity-70" aria-hidden="true"><span /><span /><span /></div>
          <div className="grain" aria-hidden="true" />
          <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full border border-background/20">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: phaseColor, boxShadow: `0 0 24px ${phaseColor}` }} />
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="eyebrow text-background/60 mb-1">Your lens today</p>
            <p className="display-serif text-[2rem] md:text-[2.5rem]">
              {PHASE_SHORT[currentPhase]}, day {currentCycleDay}
            </p>
            <p className="mt-1 text-[13px] text-background/65">Meals and training are quietly tuned to this phase.</p>
          </div>
          <ArrowUpRight className="relative z-10 h-5 w-5 flex-none text-background/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      <div className="space-y-12">
        {EXPLORE_GROUPS.map((group, gi) => (
          <motion.section
            key={group.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: gi * 0.03, ease }}
            aria-labelledby={`explore-${group.id}`}
          >
            <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <h2 id={`explore-${group.id}`} className="display-serif text-[1.75rem] md:text-[2.25rem] text-foreground">
                {group.title}
              </h2>
              {group.intent && <p className="hidden sm:block text-[13px] text-muted-foreground">{group.intent}</p>}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex flex-col sm:flex-row items-start gap-3 sm:gap-4 rounded-[22px] border border-border/70 bg-card p-4 sm:p-5 shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:shadow-medium active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-foreground group-hover:text-background">
                    <item.icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="flex-1 min-w-0 w-full">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-foreground">{item.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{item.blurb}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
