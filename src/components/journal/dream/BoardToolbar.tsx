import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, StickyNote, Target, Image, Quote, Tag,
  Heart, HelpCircle, ZoomIn, ZoomOut, Maximize, X,
} from "lucide-react";

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onAddElement: (type: string) => void;
  onAddImage: () => void;
}

const PRIMARY_TOOLS = [
  { type: "text", label: "Note", hint: "Free-form sticky note", icon: StickyNote },
  { type: "image", label: "Image", hint: "Upload or paste URL", icon: Image },
  { type: "goal", label: "Goal", hint: "Trackable with checkbox", icon: Target },
  { type: "quote", label: "Quote", hint: "Italic styled card", icon: Quote },
  { type: "label", label: "Section Header", hint: "Organise your board", icon: Tag },
];

const MORE_TOOLS = [
  { type: "affirmation", label: "Affirmation", hint: "Centred intention", icon: Heart },
  { type: "prompt", label: "Prompt Card", hint: "Reflective question", icon: HelpCircle },
];

export default function BoardToolbar({ zoom, onZoomIn, onZoomOut, onFit, onAddElement, onAddImage }: Props) {
  const [open, setOpen] = useState(false);

  const handleAdd = (type: string) => {
    if (type === "image") {
      onAddImage();
    } else {
      onAddElement(type);
    }
    setOpen(false);
  };

  const ToolRow = ({ tool }: { tool: typeof PRIMARY_TOOLS[0] }) => (
    <button
      onClick={() => handleAdd(tool.type)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/[0.06] active:bg-primary/[0.10] transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-[10px] bg-primary/[0.06] flex items-center justify-center group-hover:bg-primary/[0.12] transition-colors flex-shrink-0">
        <tool.icon className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
      </div>
      <div className="min-w-0">
        <span className="font-display text-[13px] italic text-foreground/75 group-hover:text-foreground transition-colors block leading-tight">
          {tool.label}
        </span>
        <span className="font-body text-[9px] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors leading-tight">
          {tool.hint}
        </span>
      </div>
    </button>
  );

  return (
    <>
      {/* ── Add button + flyout ────────────────────────────── */}
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
              className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_40px_-8px_hsl(25_20%_50%/0.2)] p-2 min-w-[220px]"
            >
              <p className="font-body text-[9px] uppercase tracking-[0.15em] text-muted-foreground/45 px-3 pt-2 pb-1.5 select-none">
                Add to board
              </p>
              <div className="space-y-0.5">
                {PRIMARY_TOOLS.map((t) => <ToolRow key={t.type} tool={t} />)}
              </div>
              {/* Divider */}
              <div className="h-px bg-border/40 mx-3 my-2" />
              <p className="font-body text-[9px] uppercase tracking-[0.15em] text-muted-foreground/35 px-3 pb-1 select-none">
                More
              </p>
              <div className="space-y-0.5">
                {MORE_TOOLS.map((t) => <ToolRow key={t.type} tool={t} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Zoom controls — bottom left ────────────────────── */}
      <div className="absolute bottom-5 left-5 z-50 flex items-center gap-0.5 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-[0_2px_16px_-4px_hsl(25_20%_50%/0.10)] px-2 py-1.5">
        <button onClick={onZoomOut} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/55 hover:text-foreground transition-colors">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="font-body text-[10px] text-muted-foreground/45 w-10 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={onZoomIn} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/55 hover:text-foreground transition-colors">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-border/40 mx-1" />
        <button onClick={onFit} className="p-2 rounded-xl hover:bg-primary/[0.06] text-muted-foreground/55 hover:text-foreground transition-colors" title="Reset view">
          <Maximize className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
