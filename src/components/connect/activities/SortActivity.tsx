import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, CheckCircle2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { instruction?: string; items: string[]; correctOrder?: string[] };
  onComplete: (response: any) => void;
}

export default function SortActivity({ content, onComplete }: Props) {
  const [items, setItems] = useState(() => [...content.items].sort(() => Math.random() - 0.5));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    haptic("light");
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ orderedItems: items });
  };

  return (
    <div className="space-y-4">
      {content.instruction && <p className="font-body text-sm text-muted-foreground">{content.instruction}</p>}
      <p className="font-body text-xs text-muted-foreground">Tap arrows to reorder</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div key={item} layout className={`flex items-center gap-3 p-4 rounded-xl border ${submitted ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <span className="font-body text-sm flex-1">{item}</span>
            {!submitted && (
              <div className="flex flex-col gap-1">
                <button onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30">▲</button>
                <button onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30">▼</button>
              </div>
            )}
            {submitted && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
          </motion.div>
        ))}
      </div>
      {!submitted && (
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">
          Lock In My Order
        </motion.button>
      )}
    </div>
  );
}
