import { motion } from "framer-motion";
import { Type, Image, Sparkles } from "lucide-react";
import { WildStar } from "@/components/BotanicalElements";

const STARTER_RITUALS = [
  {
    id: "dream-morning",
    title: "Build Your Dream Morning",
    elements: [
      { type: "label" as const, content: "My Dream Morning", x: 100, y: 80, width: 300, height: 50 },
      { type: "prompt" as const, content: "What time do you wake up? What does the light look like?", x: 100, y: 150, width: 280, height: 100 },
      { type: "text" as const, content: "", x: 100, y: 270, width: 220, height: 140 },
      { type: "text" as const, content: "", x: 340, y: 150, width: 220, height: 140 },
      { type: "image" as const, content: "My peaceful morning", x: 420, y: 80, width: 200, height: 200, imageUrl: "" },
    ],
  },
  {
    id: "soft-life",
    title: "Design Your Soft Life",
    elements: [
      { type: "label" as const, content: "My Soft Life", x: 100, y: 80, width: 260, height: 50 },
      { type: "affirmation" as const, content: "I am allowed to live gently.", x: 100, y: 150, width: 240, height: 100 },
      { type: "prompt" as const, content: "What does softness look like in your daily life?", x: 360, y: 80, width: 260, height: 100 },
      { type: "text" as const, content: "", x: 360, y: 200, width: 240, height: 140 },
      { type: "quote" as const, content: "The most powerful thing you can do is be gentle with yourself.", x: 100, y: 270, width: 280, height: 120 },
    ],
  },
  {
    id: "safe-home",
    title: "Create Your Safe Home Vision",
    elements: [
      { type: "label" as const, content: "My Safe Home", x: 100, y: 80, width: 280, height: 50 },
      { type: "prompt" as const, content: "What does your space smell like? What textures surround you?", x: 100, y: 150, width: 280, height: 100 },
      { type: "text" as const, content: "", x: 400, y: 80, width: 220, height: 140 },
      { type: "affirmation" as const, content: "Home is a feeling I carry with me.", x: 100, y: 270, width: 260, height: 100 },
    ],
  },
  {
    id: "romanticise",
    title: "Romanticise Your Next Chapter",
    elements: [
      { type: "label" as const, content: "My Next Chapter", x: 100, y: 80, width: 300, height: 50 },
      { type: "prompt" as const, content: "What does the next season of your life look like?", x: 100, y: 150, width: 280, height: 100 },
      { type: "goal" as const, content: "", x: 400, y: 80, width: 220, height: 140 },
      { type: "text" as const, content: "", x: 100, y: 270, width: 220, height: 140 },
      { type: "quote" as const, content: "Let yourself want what you want.", x: 340, y: 240, width: 280, height: 100 },
    ],
  },
  {
    id: "future-protect",
    title: "What Does Future You Protect?",
    elements: [
      { type: "label" as const, content: "Future Me", x: 100, y: 80, width: 240, height: 50 },
      { type: "prompt" as const, content: "What does she no longer tolerate?", x: 100, y: 150, width: 260, height: 100 },
      { type: "affirmation" as const, content: "I protect my peace.", x: 380, y: 80, width: 220, height: 100 },
      { type: "text" as const, content: "", x: 380, y: 200, width: 220, height: 140 },
    ],
  },
  {
    id: "grounded-self",
    title: "Your Most Grounded Self",
    elements: [
      { type: "label" as const, content: "My Grounded Self", x: 100, y: 80, width: 300, height: 50 },
      { type: "prompt" as const, content: "How does she hold her body? How does she respond to stress?", x: 100, y: 150, width: 280, height: 100 },
      { type: "affirmation" as const, content: "I move through life with ease.", x: 400, y: 80, width: 220, height: 100 },
      { type: "text" as const, content: "", x: 100, y: 270, width: 220, height: 140 },
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
      <div className="text-center max-w-lg pointer-events-auto px-6">
        {/* Floating star */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <WildStar size={56} className="mx-auto mb-5" />
        </motion.div>

        <h2 className="font-display text-3xl italic text-foreground mb-2">Dream Studio</h2>
        <p className="font-hand text-sm font-bold text-primary mb-3">Build the life you are quietly imagining.</p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          Add images, goals, notes, and dreams to create a board that reflects the future you are calling in.
        </p>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <button onClick={onAddNote} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm italic hover:opacity-90 transition-opacity">
            <Type className="h-4 w-4" /> Add your first note
          </button>
          <button onClick={onAddImage} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-foreground font-display text-sm italic hover:bg-secondary transition-colors">
            <Image className="h-4 w-4" /> Add dream image
          </button>
        </div>

        {/* Starter rituals */}
        <div className="text-left">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-3 text-center">Or start with a ritual</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {STARTER_RITUALS.map((r) => (
              <button
                key={r.id}
                onClick={() => onStartRitual(r.elements)}
                className="text-left p-3 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/20 transition-all group"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors mb-1.5" />
                <p className="font-display text-[13px] italic text-foreground leading-snug">{r.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
