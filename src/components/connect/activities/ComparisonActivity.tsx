import { useState } from "react";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { title?: string; columnA: { label: string; items: string[] }; columnB: { label: string; items: string[] }; reflection?: string };
  onComplete: (response: any) => void;
}

export default function ComparisonActivity({ content, onComplete }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);
  const maxRows = Math.max(content.columnA.items.length, content.columnB.items.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        {content.title && <p className="font-body text-sm font-bold text-foreground">{content.title}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="font-body text-xs font-bold text-primary mb-2 text-center">{content.columnA.label}</p>
          <div className="space-y-2">
            {content.columnA.items.map((item, i) => (
              <p key={i} className="font-body text-xs text-foreground leading-relaxed">{item}</p>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-secondary border border-border">
          <p className="font-body text-xs font-bold text-muted-foreground mb-2 text-center">{content.columnB.label}</p>
          <div className="space-y-2">
            {content.columnB.items.map((item, i) => (
              <p key={i} className="font-body text-xs text-foreground leading-relaxed">{item}</p>
            ))}
          </div>
        </div>
      </div>
      {content.reflection && <p className="font-body text-sm text-muted-foreground italic">{content.reflection}</p>}
      {!acknowledged && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { haptic("light"); setAcknowledged(true); onComplete({ viewed: true }); }}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">I've reflected on this</motion.button>
      )}
    </div>
  );
}
