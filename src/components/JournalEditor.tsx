import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

interface Props {
  type: "expressive" | "gratitude" | "future-self";
  onClose: () => void;
}

const PROMPTS: Record<string, { title: string; prompts: string[] }> = {
  expressive: {
    title: "Expressive Writing",
    prompts: ["Write about something emotionally difficult for 15 minutes. No editing, no stopping, no judgement. This is private."],
  },
  gratitude: {
    title: "Gratitude Journal",
    prompts: ["What went well today?", "Who helped you, even in a small way?", "What are you looking forward to?"],
  },
  "future-self": {
    title: "Future Self",
    prompts: ["Write a letter from your future self, 5 years from now, to who you are today. What does she want you to know?"],
  },
};

export default function JournalEditor({ type, onClose }: Props) {
  const config = PROMPTS[type];
  const [promptIdx, setPromptIdx] = useState(0);
  const [texts, setTexts] = useState<string[]>(config.prompts.map(() => ""));
  const [saved, setSaved] = useState(false);

  const wordCount = texts[promptIdx].split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    const key = `mindcast_journal_${type}_${new Date().toISOString().split("T")[0]}`;
    localStorage.setItem(key, JSON.stringify(texts));
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const handleNext = () => {
    if (promptIdx < config.prompts.length - 1) setPromptIdx(promptIdx + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border">
        <h2 className="font-display text-lg md:text-xl italic text-foreground">{config.title}</h2>
        <button onClick={onClose} className="text-muted-foreground active:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-btn">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 md:px-6 pb-6 pt-4 scroll-y">
        <p className="font-display text-base md:text-lg italic text-muted-foreground mb-4 leading-relaxed">
          "{config.prompts[promptIdx]}"
        </p>

        <textarea
          value={texts[promptIdx]}
          onChange={(e) => {
            const next = [...texts];
            next[promptIdx] = e.target.value;
            setTexts(next);
          }}
          className="flex-1 w-full resize-none bg-transparent font-hand text-lg text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none min-h-[200px]"
          placeholder="start writing..."
          autoFocus
          style={{ caretColor: "hsl(14, 100%, 64%)", fontSize: "18px" }}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <span className="font-mono text-xs text-muted-foreground">{wordCount} words</span>
          <div className="flex gap-3">
            {config.prompts.length > 1 && promptIdx < config.prompts.length - 1 && (
              <button onClick={handleNext} className="touch-btn flex-1 sm:flex-none rounded-xl bg-secondary px-5 py-3 min-h-[52px] font-body text-sm font-medium text-foreground active:bg-secondary/80 transition-colors">
                Next prompt
              </button>
            )}
            <button onClick={handleSave}
              className="touch-btn flex-1 sm:flex-none rounded-xl bg-primary px-5 py-3 min-h-[52px] font-body text-sm font-bold text-primary-foreground active:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Saved" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
