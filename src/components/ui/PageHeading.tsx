import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

type PageTone = "eat" | "move" | "reflect" | "goals";
const tones: Record<PageTone, string> = {
  eat: "text-eat bg-eat/10",
  move: "text-move bg-move/10",
  reflect: "text-reflect bg-reflect/10",
  goals: "text-goals bg-goals/10",
};

/** Compact editorial heading shared by member pages, never the homepage. */
export default function PageHeading({ title, label, children, icon: Icon, tone = "reflect" }: {
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
        <span className={`flex shrink-0 items-center justify-center w-12 h-12 rounded-full ${tones[tone]}`} aria-hidden="true">
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </span>
      </div>
    </header>
  );
}