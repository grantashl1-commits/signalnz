import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  onSave: (content: string, wordCount: number) => void;
  onClose: () => void;
}

export default function OneLineEditor({ onSave, onClose }: Props) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    haptic("medium");
    setSaved(true);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    onSave(text.trim(), wordCount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-display text-lg italic text-foreground">One Line</h2>
        <button onClick={onClose} className="text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <p className="font-display text-xl italic text-foreground mb-6 text-center">How are you today?</p>
        <textarea
          value={text}
          onChange={(e) => { if (e.target.value.length <= 140) setText(e.target.value); }}
          rows={3}
          className="w-full max-w-md resize-none bg-transparent font-hand text-lg text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none text-center"
          placeholder="One sentence..."
          autoFocus
          style={{ fontSize: "18px" }}
        />
        <p className="font-mono text-[11px] text-muted-foreground/50 mt-2">{text.length} / 140</p>
      </div>

      <div className="px-5 pb-6 pt-3">
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="touch-btn w-full rounded-xl bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.div>
  );
}
