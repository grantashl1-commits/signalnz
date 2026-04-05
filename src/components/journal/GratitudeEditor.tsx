import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Heart } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

const RELEASE_PROMPTS: Record<string, string> = {
  menstrual: "Something I'm completing or letting go of from this cycle:",
  follicular: "Something I want to leave behind as my energy builds:",
  ovulatory: "Something that's been taking up space that isn't mine:",
  luteal: "Something I'm releasing so I can move forward:",
};

interface Props {
  phase: string;
  onSave: (content: string, wordCount: number) => void;
  onClose: () => void;
}

export default function GratitudeEditor({ phase, onSave, onClose }: Props) {
  const [answers, setAnswers] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);

  const releasePrompt = RELEASE_PROMPTS[phase] || RELEASE_PROMPTS.luteal;

  const prompts = [
    "Something I'm grateful for today:",
    "Something I noticed in myself or my body:",
    releasePrompt,
  ];

  const handleSave = () => {
    const content = prompts.map((p, i) => `${p}\n${answers[i]}`).join("\n\n");
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    haptic("medium");
    setSaved(true);
    onSave(content, wordCount);
  };

  const hasContent = answers.some((a) => a.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg italic text-foreground">Gratitude</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {prompts.map((prompt, i) => (
          <div key={i}>
            <label className="block font-display text-base italic text-foreground mb-2">{prompt}</label>
            <textarea
              value={answers[i]}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              rows={3}
              className="w-full resize-none bg-secondary/30 border border-border rounded-xl px-4 py-3 font-hand text-base text-foreground leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Write here..."
              style={{ fontSize: "16px" }}
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-border/30">
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className="touch-btn w-full rounded-xl bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.div>
  );
}
