/**
 * Mobile Dream Board — Milanote-style stacked card UI
 * Default mobile view: vertical scrollable list + bottom action bar.
 * Users can flip to the canvas via the View toggle.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Sparkles, LayoutGrid, Layers, Map as MapIcon,
  StickyNote, Image as ImageIcon, Target, Quote, Tag, Heart, HelpCircle,
  X, Check,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { haptic } from "@/hooks/use-mobile";
import BoardStackedView from "./BoardStackedView";
import BoardEmptyState from "./BoardEmptyState";
import type { DreamElement, DreamConnection, DreamBoard } from "@/lib/journal-store";

const ADD_TOOLS = [
  { type: "text", label: "Note", icon: StickyNote, color: "hsl(25 40% 55%)" },
  { type: "image", label: "Image", icon: ImageIcon, color: "hsl(25 40% 55%)" },
  { type: "goal", label: "Goal", icon: Target, color: "hsl(258 36% 49%)" },
  { type: "quote", label: "Quote", icon: Quote, color: "hsl(284 22% 44%)" },
  { type: "affirmation", label: "Affirm", icon: Heart, color: "hsl(340 30% 55%)" },
  { type: "prompt", label: "Prompt", icon: HelpCircle, color: "hsl(284 22% 55%)" },
  { type: "label", label: "Section", icon: Tag, color: "hsl(25 20% 60%)" },
];

interface Props {
  elements: DreamElement[];
  connections: DreamConnection[];
  selectedId: string | null;
  activeBoard: DreamBoard | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<DreamElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddElement: (type: string) => void;
  onAddImage: () => void;
  onStartRitual: (
    elements: Array<{ type: string; content: string; x: number; y: number; width: number; height: number; imageUrl?: string }>
  ) => void;
  onOpenBoards: () => void;
  onOpenRituals: () => void;
  onSwitchToCanvas: () => void;
}

export default function MobileBoardView({
  elements, connections, selectedId, activeBoard,
  onSelect, onUpdate, onDelete, onDuplicate,
  onAddElement, onAddImage, onStartRitual,
  onOpenBoards, onOpenRituals, onSwitchToCanvas,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = (type: string) => {
    haptic("medium");
    if (type === "image") onAddImage();
    else onAddElement(type);
    setAddOpen(false);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-260px)] pb-24">
      {/* Compact header strip */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <button
          onClick={onOpenBoards}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border min-w-0"
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: activeBoard?.coverColor || "hsl(284 22% 44%)" }}
          />
          <span className="font-display text-[13px] italic text-foreground truncate">
            {activeBoard?.title || "My Board"}
          </span>
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground/50 ml-auto flex-shrink-0" />
        </button>

        <button
          onClick={onSwitchToCanvas}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border"
          aria-label="Switch to canvas view"
        >
          <MapIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-body text-[11px] text-muted-foreground">Canvas</span>
        </button>
      </div>

      {/* Element count strip */}
      {elements.length > 0 && (
        <div className="flex items-center gap-1.5 px-2 mb-3 font-body text-[10px] text-muted-foreground/50">
          <Layers className="h-3 w-3" />
          <span>{elements.length} {elements.length === 1 ? "element" : "elements"}</span>
          {connections.length > 0 && <span>· {connections.length} connections</span>}
        </div>
      )}

      {/* Empty state OR stacked cards */}
      {elements.length === 0 ? (
        <div className="px-1">
          <BoardEmptyState
            onAddNote={() => onAddElement("text")}
            onAddImage={onAddImage}
            onStartRitual={onStartRitual}
          />
        </div>
      ) : (
        <BoardStackedView
          elements={elements}
          connections={connections}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}

      {/* ── Bottom action bar (Milanote-style) ─────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-3 pt-2 pointer-events-none"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto max-w-md mx-auto bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_8px_32px_-8px_hsl(25_20%_30%/0.18)] flex items-center gap-1 p-1.5"
        >
          <button
            onClick={() => { haptic("light"); setAddOpen(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-display text-[13px] italic active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
          <button
            onClick={onOpenRituals}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-secondary/50 text-foreground/80 font-display text-[13px] italic transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary/70" /> Rituals
          </button>
          <button
            onClick={onOpenBoards}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl hover:bg-secondary/50 text-foreground/80 font-display text-[13px] italic transition-colors"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-primary/70" /> Boards
          </button>
        </motion.div>
      </div>

      {/* ── Add element bottom sheet ───────────────────────── */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border bg-card p-0 max-h-[80vh]"
        >
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                Add to board
              </p>
              <h3 className="font-display text-xl italic text-foreground mt-0.5">
                What do you want to capture?
              </h3>
            </div>
            <button
              onClick={() => setAddOpen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="grid grid-cols-3 gap-2.5 px-5 pt-3 pb-8"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
          >
            {ADD_TOOLS.map((tool) => (
              <button
                key={tool.type}
                onClick={() => handleAdd(tool.type)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary/25 hover:bg-primary/[0.04] active:scale-[0.97] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${tool.color} 12%, transparent)` }}
                >
                  <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                </div>
                <span className="font-display text-[12px] italic text-foreground/80">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
