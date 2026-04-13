import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { haptic } from "@/hooks/use-mobile";

interface Props {
  content: { prompt: string; placeholder?: string; minWords?: number };
  onComplete: (response: any) => void;
}

export default function OpenResponse({ content, onComplete }: Props) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = content.minWords || 10;
  const ready = wordCount >= minWords;

  const handleSubmit = () => {
    haptic("medium");
    setSubmitted(true);
    onComplete({ text, wordCount });
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-foreground leading-relaxed">{content.prompt}</p>
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted}
        placeholder={content.placeholder || "Share your thoughts..."}
        rows={6}
        className="resize-none rounded-xl border-border focus:border-primary"
      />
      <div className="flex items-center justify-between">
        <span className={`font-body text-xs ${ready ? "text-primary" : "text-muted-foreground"}`}>
          {wordCount} / {minWords} words min
        </span>
        {!submitted && ready && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.95 }}
            onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-bold">
            Save reflection
          </motion.button>
        )}
      </div>
      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="font-body text-xs text-primary">Saved to your couple's vault</p>
        </motion.div>
      )}
    </div>
  );
}
