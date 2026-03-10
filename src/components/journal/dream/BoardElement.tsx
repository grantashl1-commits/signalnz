import { useState, useRef, useCallback } from "react";
import { Trash2, Copy, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import type { DreamElement } from "@/lib/journal-store";

interface Props {
  element: DreamElement;
  selected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<DreamElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

const MIN_W = 120;
const MIN_H = 60;

const STYLES: Record<string, { bg: string; border: string; labelColor: string; label: string }> = {
  text: { bg: "bg-card", border: "border-border", labelColor: "text-muted-foreground", label: "Note" },
  quote: { bg: "bg-primary/5", border: "border-primary/20", labelColor: "text-primary", label: "Quote" },
  goal: { bg: "bg-phase-follicular/5", border: "border-phase-follicular/20", labelColor: "text-phase-follicular", label: "Goal" },
  affirmation: { bg: "bg-accent/5", border: "border-accent/15", labelColor: "text-accent", label: "Affirmation" },
  image: { bg: "bg-secondary/40", border: "border-border", labelColor: "text-muted-foreground", label: "Image" },
  label: { bg: "bg-transparent", border: "border-transparent", labelColor: "text-muted-foreground/60", label: "" },
  prompt: { bg: "bg-primary/[0.03]", border: "border-primary/10 border-dashed", labelColor: "text-primary/60", label: "Prompt" },
};

export default function BoardElement({ element, selected, zoom, onSelect, onUpdate, onDelete, onDuplicate, onBringForward, onSendBackward }: Props) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ex: 0, ey: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const s = STYLES[element.type] || STYLES.text;

  // ── Drag ───────────────────────────────────────
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
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  // ── Resize ─────────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: element.width, h: element.height };

    const onMove = (ev: MouseEvent) => {
      const dw = (ev.clientX - resizeStart.current.mx) / zoom;
      const dh = (ev.clientY - resizeStart.current.my) / zoom;
      onUpdate({
        width: Math.max(MIN_W, resizeStart.current.w + dw),
        height: Math.max(MIN_H, resizeStart.current.h + dh),
      });
    };
    const onUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [element.width, element.height, zoom, onUpdate]);

  // ── Touch drag ─────────────────────────────────
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
    const onEnd = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  // ── Render content ─────────────────────────────
  const renderContent = () => {
    if (element.type === "label") {
      return editing ? (
        <input
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={() => setEditing(false)}
          className="w-full bg-transparent font-display text-2xl font-bold italic text-foreground/70 focus:outline-none"
          style={{ fontSize: "24px" }}
          autoFocus
        />
      ) : (
        <p
          onDoubleClick={() => setEditing(true)}
          className="font-display text-2xl font-bold italic text-foreground/70 cursor-text select-none"
        >
          {element.content || "Section label"}
        </p>
      );
    }

    if (element.type === "image" && element.imageUrl) {
      return (
        <div className="w-full h-full overflow-hidden rounded-xl">
          <img src={element.imageUrl} alt={element.content} className="w-full h-full object-cover" />
        </div>
      );
    }

    if (element.type === "quote") {
      return (
        <div className="p-4">
          {s.label && <span className={`font-mono text-[10px] uppercase tracking-wider ${s.labelColor} block mb-1.5`}>{s.label}</span>}
          {editing ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={() => setEditing(false)}
              className="w-full bg-transparent font-display text-[15px] italic text-foreground resize-none focus:outline-none leading-relaxed"
              style={{ fontSize: "16px" }}
              autoFocus
            />
          ) : (
            <p onDoubleClick={() => setEditing(true)} className="font-display text-[15px] italic text-foreground leading-relaxed cursor-text select-none">
              "{element.content || "Tap to add quote..."}"
            </p>
          )}
        </div>
      );
    }

    if (element.type === "prompt") {
      return (
        <div className="p-4 flex items-center">
          <p className="font-display text-[15px] italic text-primary/70 leading-relaxed">
            {element.content || "What does your next chapter feel like?"}
          </p>
        </div>
      );
    }

    // Default: note, goal, affirmation
    return (
      <div className="p-4">
        {s.label && <span className={`font-mono text-[10px] uppercase tracking-wider ${s.labelColor} block mb-1.5`}>{s.label}</span>}
        {element.type === "goal" && element.targetDate && (
          <span className="font-mono text-[9px] text-muted-foreground/50 block mb-1">Target: {element.targetDate}</span>
        )}
        {editing ? (
          <textarea
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setEditing(false)}
            className="w-full bg-transparent font-display text-sm italic text-foreground resize-none focus:outline-none leading-relaxed"
            style={{ fontSize: "16px", height: `${element.height - 60}px` }}
            autoFocus
          />
        ) : (
          <p onDoubleClick={() => setEditing(true)} className={`font-display text-sm italic leading-relaxed cursor-text select-none ${element.content ? "text-foreground" : "text-muted-foreground/40"}`}>
            {element.content || "Double-click to edit..."}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`absolute group ${element.type === "label" ? "" : `rounded-2xl border ${s.border} ${s.bg}`} ${selected ? "ring-2 ring-primary/40 shadow-lg" : "hover:shadow-md"} transition-shadow`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.type === "label" ? "auto" : element.height,
        zIndex: element.zIndex,
        cursor: dragging ? "grabbing" : editing ? "text" : "grab",
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleTouchStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {renderContent()}

      {/* Context actions */}
      {selected && !editing && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-card border border-border rounded-xl shadow-lg px-1.5 py-1 z-50" style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center" }}>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBringForward(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Bring forward">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSendBackward(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Send backward">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Resize handle */}
      {selected && element.type !== "label" && (
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 cursor-se-resize z-50 flex items-center justify-center"
          onMouseDown={handleResizeStart}
        >
          <div className="w-3 h-3 rounded-sm border-2 border-primary/40 bg-card" />
        </div>
      )}
    </div>
  );
}
