import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

type PageTone = "eat" | "move" | "reflect" | "goals";

/** Compact editorial heading shared by member pages, never the homepage. */
export default function PageHeading({ title, label, children }: {
  title: string;
  label: string;
  children: ReactNode;
  icon: LucideIcon;
  tone?: PageTone;
}) {
  return (
    <header className="px-5 pt-7 pb-2 md:px-8 md:pt-10">
      <div className="mx-auto max-w-5xl border-b border-border pb-6 flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground mb-2">{label}</p>
          <h1 className="font-editorial text-4xl md:text-5xl font-normal leading-tight text-foreground">{title}</h1>
          <div className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">{children}</div>
        </div>
        <span className="relative shrink-0 w-20 h-20 md:w-28 md:h-28 text-primary pointer-events-none" aria-hidden="true">
          <svg className="w-full h-full opacity-30" viewBox="0 0 400 400" fill="currentColor">
            {[60, 95, 130, 165, 195].map((radius, ring) => {
              const count = 14 + ring * 9;
              return Array.from({ length: count }, (_, dot) => {
                const angle = (2 * Math.PI * dot) / count;
                return <circle key={`${ring}-${dot}`} cx={200 + radius * Math.cos(angle)} cy={200 + radius * Math.sin(angle)} r={Math.max(2.6 - ring * 0.35, 0.9)} />;
              });
            })}
          </svg>
        </span>
      </div>
    </header>
  );
}