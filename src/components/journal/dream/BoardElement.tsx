/**
 * Redesigned Milanote-style Board Element
 * Rich card aesthetics with colour-coded types, better shadows, refined typography
 */
import { useState, useRef, useCallback } from "react";
import { Trash2, Copy, ArrowUp, ArrowDown, Link2 } from "lucide-react";
import type { DreamElement } from "@/lib/journal-store";

interface Props {
  element: DreamElement;
  selected: boolean;
  zoom: number;
  isConnecting: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DreamElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onStartConnect: () => void;
}

const MIN_W = 140;
const MIN_H = 70;

// Type-specific accent colours (HSL values for consistency)
const TYPE_ACCENTS: Record<string, { bg: string; border: string; label: string; accent: string }> = {
  text: {
    bg: "hsl(30 33% 99%)",
    border: "hsl(25 25% 88%)",
    label: "hsl(25 20% 60%)",
    accent: "hsl(25 25% 88%)",
  },
  quote: {
    bg: "hsl(284 30% 98%)",
    border: "hsl(284 22% 85%)",
    label: "hsl(284 22% 55%)",
    accent: "hsl(284 22% 44%)",
  },
  goal: {
    bg: "hsl(258 30% 98%)",
    border: "hsl(258 25% 85%)",
    label: "hsl(258 36% 49%)",
    accent: "hsl(258 36% 49%)",
  },
  affirmation: {
    bg: "hsl(340 25% 98%)",
    border: "hsl(340 20% 87%)",
    label: "hsl(340 30% 55%)",
    accent: "hsl(340 30% 60%)",
  },
  prompt: {
    bg: "hsl(284 20% 97%)",
    border: "hsl(284 15% 88%)",
    label: "hsl(284 22% 55%)",
    accent: "hsl(284 22% 44%)",
  },
  image: {
    bg: "transparent",
    border: "hsl(25 25% 88%)",
    label: "hsl(25 20% 60%)",
    accent: "hsl(25 25% 88%)",
  },
  label: {
    bg: "transparent",
    border: "transparent",
    label: "hsl(25 20% 60%)",
    accent: "transparent",
  },
};

export default function BoardElement({
  element, selected, zoom, isConnecting,
  onSelect, onUpdate, onDelete, onDuplicate,
  onBringForward, onSendBackward, onStartConnect,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ex: 0, ey: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const theme = TYPE_ACCENTS[element.type] || TYPE_ACCENTS.text;

  // Drag
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (editing) return;
    e.stopPropagation();
    onSelect();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ex: element.x, ey: element.y };
    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      onUpdate({ x: dragStart.current.ex + dx, y: dragStart.current.ey + dy });
    };
    const onUp = () => { setDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  // Resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: element.width, h: element.height };
    const onMove = (ev: MouseEvent) => {
      const dw = (ev.clientX - resizeStart.current.mx) / zoom;
      const dh = (ev.clientY - resizeStart.current.my) / zoom;
      onUpdate({ width: Math.max(MIN_W, resizeStart.current.w + dw), height: Math.max(MIN_H, resizeStart.current.h + dh) });
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [element.width, element.height, zoom, onUpdate]);

  // Touch drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (editing) return;
    onSelect();
    const touch = e.touches[0];
    dragStart.current = { mx: touch.clientX, my: touch.clientY, ex: element.x, ey: element.y };
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      const dx = (t.clientX - dragStart.current.mx) / zoom;
      const dy = (t.clientY - dragStart.current.my) / zoom;
      onUpdate({ x: dragStart.current.ex + dx, y: dragStart.current.ey + dy });
    };
    const onEnd = () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  // Render content
  const renderContent = () => {
    if (element.type === "label") {
      return editing ? (
        <input
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={() => setEditing(false)}
          className="w-full bg-transparent font-display text-[28px] font-bold italic text-foreground/60 focus:outline-none tracking-tight"
          style={{ fontSize: "28px" }}
          autoFocus
        />
      ) : (
        <p onDoubleClick={() => setEditing(true)} className="font-display text-[28px] font-bold italic text-foreground/50 cursor-text select-none tracking-tight leading-tight">
          {element.content || "Section label"}
        </p>
      );
    }

    if (element.type === "image" && element.imageUrl) {
      return (
        <div className="w-full h-full overflow-hidden rounded-[16px]">
          <img src={element.imageUrl} alt={element.content} className="w-full h-full object-cover transition-transform duration-300" style={{ transform: selected ? "scale(1.02)" : "scale(1)" }} />
          {element.content && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-[16px]">
              <p className="font-display text-xs italic text-primary-foreground/90 truncate">{element.content}</p>
            </div>
          )}
        </div>
      );
    }

    if (element.type === "quote") {
      return (
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-start gap-2 mb-1">
            <span className="font-display text-[36px] leading-none select-none" style={{ color: theme.accent, opacity: 0.3 }}>&ldquo;</span>
            <div className="w-8 h-[2px] mt-4 rounded-full" style={{ background: theme.accent, opacity: 0.2 }} />
          </div>
          {editing ? (
            <textarea value={element.content} onChange={(e) => onUpdate({ content: e.target.value })} onBlur={() => setEditing(false)} className="w-full flex-1 bg-transparent font-display text-[15px] italic text-foreground/80 resize-none focus:outline-none leading-[1.7]" style={{ fontSize: "16px" }} autoFocus />
          ) : (
            <p onDoubleClick={() => setEditing(true)} className="font-display text-[15px] italic text-foreground/80 leading-[1.7] cursor-text select-none flex-1">{element.content || "Add an inspiring quote..."}</p>
          )}
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-2 select-none" style={{ color: theme.label }}>Quote</span>
        </div>
      );
    }

    if (element.type === "prompt") {
      return (
        <div className="p-5 flex items-center h-full">
          <div>
            <div className="w-5 h-[2px] rounded-full mb-3" style={{ background: theme.accent, opacity: 0.3 }} />
            <p className="font-display text-[15px] italic leading-[1.7]" style={{ color: theme.label }}>
              {element.content || "What does your next chapter feel like?"}
            </p>
          </div>
        </div>
      );
    }

    if (element.type === "affirmation") {
      return (
        <div className="p-5 flex flex-col justify-center h-full">
          {editing ? (
            <textarea value={element.content} onChange={(e) => onUpdate({ content: e.target.value })} onBlur={() => setEditing(false)} className="w-full bg-transparent font-display text-[15px] italic text-foreground/80 resize-none focus:outline-none leading-[1.7] text-center" style={{ fontSize: "16px" }} autoFocus />
          ) : (
            <p onDoubleClick={() => setEditing(true)} className="font-display text-[15px] italic text-foreground/80 leading-[1.7] cursor-text select-none text-center">{element.content || "I am..."}</p>
          )}
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-3 text-center select-none" style={{ color: theme.label }}>Affirmation</span>
        </div>
      );
    }

    // Note / Goal
    const typeLabel = element.type === "goal" ? "Goal" : "Note";
    return (
      <div className="p-5 flex flex-col h-full">
        {/* Colour accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[16px]" style={{ background: theme.accent, opacity: 0.4 }} />
        {element.type === "goal" && element.targetDate && (
          <span className="font-mono text-[9px] text-muted-foreground/40 mb-1 select-none">Target: {element.targetDate}</span>
        )}
        {editing ? (
          <textarea value={element.content} onChange={(e) => onUpdate({ content: e.target.value })} onBlur={() => setEditing(false)} className="w-full flex-1 bg-transparent font-display text-[14px] italic text-foreground/80 resize-none focus:outline-none leading-[1.8]" style={{ fontSize: "16px" }} autoFocus />
        ) : (
          <p onDoubleClick={() => setEditing(true)} className={`font-display text-[14px] italic leading-[1.8] cursor-text select-none flex-1 ${element.content ? "text-foreground/80" : "text-muted-foreground/30"}`}>
            {element.content || "Double-click to edit..."}
          </p>
        )}
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-2 select-none" style={{ color: theme.label }}>{typeLabel}</span>
      </div>
    );
  };

  const isLabel = element.type === "label";

  return (
    <div
      className={`absolute transition-shadow duration-200 group ${isConnecting ? "ring-2 ring-primary/40 ring-dashed" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: isLabel ? "auto" : element.height,
        zIndex: element.zIndex,
        cursor: dragging ? "grabbing" : editing ? "text" : "grab",
        borderRadius: isLabel ? 0 : 16,
        background: theme.bg,
        border: isLabel ? "none" : `1px solid ${selected ? theme.accent : theme.border}`,
        boxShadow: selected
          ? `0 8px 32px -8px ${theme.accent}30, 0 2px 8px -2px ${theme.accent}15`
          : `0 1px 6px -2px hsl(25 20% 50% / 0.08)`,
        overflow: isLabel ? "visible" : "hidden",
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleTouchStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {renderContent()}

      {/* Context toolbar */}
      {selected && !editing && (
        <div
          className="absolute -top-12 left-1/2 flex items-center gap-0.5 bg-card border border-border rounded-2xl shadow-lg px-2 py-1.5 z-50 backdrop-blur-sm"
          style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center" }}
        >
          <button onClick={(e) => { e.stopPropagation(); onStartConnect(); }} className="p-2 rounded-xl hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors" title="Connect">
            <Link2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBringForward(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Forward">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSendBackward(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Backward">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-border/60 mx-1" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl hover:bg-destructive/8 text-muted-foreground/60 hover:text-destructive transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Resize handle */}
      {selected && !isLabel && (
        <>
          <div className="absolute -bottom-[5px] -right-[5px] w-[10px] h-[10px] cursor-se-resize z-50" onMouseDown={handleResizeStart}>
            <div className="w-[10px] h-[10px] rounded-full border-2 border-card shadow-sm transition-colors" style={{ background: theme.accent + "66" }} />
          </div>
          <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.accent + "33" }} />
          <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.accent + "33" }} />
          <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.accent + "33" }} />
        </>
      )}
    </div>
  );
}
