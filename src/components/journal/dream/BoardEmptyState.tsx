import { motion } from "framer-motion";
import { Type, Image, Sparkles } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";

const STARTER_RITUALS = [
  {
    id: "dream-morning",
    title: "Build Your Dream Morning",
    elements: [
      { type: "label" as const, content: "My Dream Morning", x: 100, y: 80, width: 300, height: 50 },
      { type: "prompt" as const, content: "What time do you wake up? What does the light look like?", x: 100, y: 150, width: 280, height: 120 },
      { type: "text" as const, content: "", x: 100, y: 290, width: 240, height: 160 },
      { type: "text" as const, content: "", x: 360, y: 150, width: 240, height: 160 },
      { type: "image" as const, content: "My peaceful morning", x: 440, y: 80, width: 220, height: 220, imageUrl: "" },
    ],
  },
  {
    id: "soft-life",
    title: "Design Your Soft Life",
    elements: [
      { type: "label" as const, content: "My Soft Life", x: 100, y: 80, width: 260, height: 50 },
      { type: "affirmation" as const, content: "I am allowed to live gently.", x: 100, y: 150, width: 260, height: 120 },
      { type: "prompt" as const, content: "What does softness look like in your daily life?", x: 380, y: 80, width: 280, height: 120 },
      { type: "text" as const, content: "", x: 380, y: 220, width: 260, height: 160 },
      { type: "quote" as const, content: "The most powerful thing you can do is be gentle with yourself.", x: 100, y: 290, width: 300, height: 140 },
    ],
  },
  {
    id: "safe-home",
    title: "Create Your Safe Home Vision",
    elements: [
      { type: "label" as const, content: "My Safe Home", x: 100, y: 80, width: 280, height: 50 },
      { type: "prompt" as const, content: "What does your space smell like? What textures surround you?", x: 100, y: 150, width: 300, height: 120 },
      { type: "text" as const, content: "", x: 420, y: 80, width: 240, height: 160 },
      { type: "affirmation" as const, content: "Home is a feeling I carry with me.", x: 100, y: 290, width: 280, height: 120 },
    ],
  },
  {
    id: "romanticise",
    title: "Romanticise Your Next Chapter",
    elements: [
      { type: "label" as const, content: "My Next Chapter", x: 100, y: 80, width: 300, height: 50 },
      { type: "prompt" as const, content: "What does the next season of your life look like?", x: 100, y: 150, width: 300, height: 120 },
      { type: "goal" as const, content: "", x: 420, y: 80, width: 240, height: 160 },
      { type: "text" as const, content: "", x: 100, y: 290, width: 240, height: 160 },
      { type: "quote" as const, content: "Let yourself want what you want.", x: 360, y: 260, width: 300, height: 120 },
    ],
  },
  {
    id: "future-protect",
    title: "What Does Future You Protect?",
    elements: [
      { type: "label" as const, content: "Future Me", x: 100, y: 80, width: 260, height: 50 },
      { type: "prompt" as const, content: "What does she no longer tolerate?", x: 100, y: 150, width: 280, height: 120 },
      { type: "affirmation" as const, content: "I protect my peace.", x: 400, y: 80, width: 240, height: 120 },
      { type: "text" as const, content: "", x: 400, y: 220, width: 240, height: 160 },
    ],
  },
  {
    id: "grounded-self",
    title: "Your Most Grounded Self",
    elements: [
      { type: "label" as const, content: "My Grounded Self", x: 100, y: 80, width: 320, height: 50 },
      { type: "prompt" as const, content: "How does she hold her body? How does she respond to stress?", x: 100, y: 150, width: 300, height: 120 },
      { type: "affirmation" as const, content: "I move through life with ease.", x: 420, y: 80, width: 240, height: 120 },
      { type: "text" as const, content: "", x: 100, y: 290, width: 240, height: 160 },
    ],
  },
];

interface Props {
  onAddNote: () => void;
  onAddImage: () => void;
  onStartRitual: (elements: Array<{ type: string; content: string; x: number; y: number; width: number; height: number; imageUrl?: string }>) => void;
}

export default function BoardEmptyState({ onAddNote, onAddImage, onStartRitual }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center max-w-xl pointer-events-auto px-8">
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${15 + i * 14}%`,
                top: `${25 + (i % 3) * 18}%`,
                backgroundColor: `hsl(284 22% 44% / ${0.06 + i * 0.02})`,
              }}
              animate={{ y: [0, -16, 0], opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: 6 + i * 1.2, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </div>

        {/* Floating star */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <WildStar size={48} className="mx-auto mb-6 opacity-60" />
        </motion.div>

        <h2 className="font-display text-[32px] italic text-foreground/80 mb-2 tracking-tight">Dream Studio</h2>
        <p className="font-hand text-[13px] font-bold text-primary/60 mb-3 tracking-wide">Build the life you are quietly imagining.</p>
        <p className="font-body text-[13px] text-muted-foreground/60 leading-[1.8] mb-10 max-w-sm mx-auto">
          Add images, goals, notes, and dreams to create a board that reflects the future you are calling in.
        </p>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={onAddNote}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display text-[13px] italic shadow-[0_2px_16px_-4px_hsl(284_22%_44%/0.25)] hover:shadow-[0_4px_24px_-4px_hsl(284_22%_44%/0.35)] transition-all active:scale-[0.97]"
          >
            <Type className="h-4 w-4" /> Add your first note
          </button>
          <button
            onClick={onAddImage}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[hsl(30_33%_99%)] border border-[hsl(25_25%_88%)] text-foreground/70 font-display text-[13px] italic shadow-[0_1px_8px_-2px_hsl(25_20%_50%/0.08)] hover:shadow-[0_3px_16px_-4px_hsl(25_20%_50%/0.14)] hover:border-primary/15 transition-all active:scale-[0.97]"
          >
            <Image className="h-4 w-4 text-primary/50" /> Add dream image
          </button>
        </div>

        {/* Starter rituals */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Or start with a ritual</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {STARTER_RITUALS.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => onStartRitual(r.elements)}
                className="text-left p-4 rounded-2xl bg-[hsl(30_33%_99%/0.6)] border border-[hsl(25_25%_88%/0.5)] hover:bg-[hsl(30_33%_99%)] hover:border-primary/15 hover:shadow-[0_3px_16px_-4px_hsl(284_22%_44%/0.08)] transition-all group"
              >
                <Sparkles className="h-3 w-3 text-primary/25 group-hover:text-primary/50 transition-colors mb-2" />
                <p className="font-display text-[12px] italic text-foreground/60 group-hover:text-foreground/80 leading-snug transition-colors">{r.title}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
