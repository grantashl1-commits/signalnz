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
      {/* Left toolbar */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
        {/* Add button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>

        {/* Tool palette */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-xl p-2 space-y-0.5 min-w-[180px]"
            >
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary active:bg-secondary/80 transition-colors text-left"
                >
                  <t.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-display text-sm italic text-foreground">{t.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom controls - bottom left */}
      <div className="absolute bottom-4 left-4 z-50 flex items-center gap-1 bg-card border border-border rounded-xl shadow-lg px-1.5 py-1">
        <button onClick={onZoomOut} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="font-mono text-[11px] text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button onClick={onFit} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Fit to screen">
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
