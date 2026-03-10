import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Type, Target, Heart, Image, Quote, Tag, HelpCircle,
  ZoomIn, ZoomOut, Maximize, X,
} from "lucide-react";

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onAddElement: (type: string) => void;
  onAddImage: () => void;
}

const TOOLS = [
  { type: "text", label: "Note", icon: Type },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "goal", label: "Goal", icon: Target },
  { type: "affirmation", label: "Affirmation", icon: Heart },
  { type: "image", label: "Image", icon: Image },
  { type: "label", label: "Section Label", icon: Tag },
  { type: "prompt", label: "Prompt Card", icon: HelpCircle },
];

export default function BoardToolbar({ zoom, onZoomIn, onZoomOut, onFit, onAddElement, onAddImage }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Left toolbar — glass morphism */}
      <div className="absolute top-5 left-5 z-50 flex flex-col gap-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_2px_16px_-4px_hsl(284_22%_44%/0.3)] hover:shadow-[0_4px_20px_-4px_hsl(284_22%_44%/0.4)] transition-all active:scale-95"
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[hsl(30_33%_99%/0.92)] backdrop-blur-xl border border-[hsl(25_25%_88%)] rounded-2xl shadow-[0_8px_40px_-8px_hsl(25_20%_50%/0.2)] p-2 space-y-0.5 min-w-[200px]"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 px-3 pt-2 pb-1 select-none">Add to board</p>
              {TOOLS.map((t) => (
                <button
                  key={t.type}
                  onClick={() => {
                    if (t.type === "image") {
                      onAddImage();
                    } else {
                      onAddElement(t.type);
                    }
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/[0.06] active:bg-primary/[0.1] transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/[0.06] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors">
                    <t.icon className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-display text-[13px] italic text-foreground/70 group-hover:text-foreground transition-colors">{t.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom controls — bottom left, glass */}
      <div className="absolute bottom-5 left-5 z-50 flex items-center gap-0.5 bg-[hsl(30_33%_99%/0.88)] backdrop-blur-xl border border-[hsl(25_25%_88%)] rounded-2xl shadow-[0_2px_16px_-4px_hsl(25_20%_50%/0.12)] px-2 py-1.5">
        <button onClick={onZoomOut} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/60 hover:text-foreground transition-colors">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="font-mono text-[10px] text-muted-foreground/50 w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/60 hover:text-foreground transition-colors">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <button onClick={onFit} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/60 hover:text-foreground transition-colors" title="Reset view">
          <Maximize className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
