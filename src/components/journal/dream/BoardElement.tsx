import { useState, useRef, useCallback } from "react";
import { Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";
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

const MIN_W = 140;
const MIN_H = 70;

export default function BoardElement({ element, selected, zoom, onSelect, onUpdate, onDelete, onDuplicate, onBringForward, onSendBackward }: Props) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ex: 0, ey: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

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

  // ── Wrapper styles per type ────────────────────
  const wrapperStyles = (): string => {
    const base = "absolute transition-all duration-150";

    if (element.type === "label") {
      return `${base} px-1`;
    }

    if (element.type === "image") {
      return `${base} rounded-[20px] overflow-hidden shadow-[0_2px_16px_-4px_hsl(25_20%_50%/0.12)] ${
        selected
          ? "ring-[2.5px] ring-primary/30 shadow-[0_4px_24px_-4px_hsl(284_22%_44%/0.18)]"
          : "hover:shadow-[0_4px_20px_-4px_hsl(25_20%_50%/0.16)]"
      }`;
    }

    if (element.type === "quote") {
      return `${base} rounded-[20px] bg-[hsl(30_33%_97%)] border border-primary/[0.12] shadow-[0_1px_8px_-2px_hsl(284_22%_44%/0.06)] ${
        selected
          ? "ring-[2.5px] ring-primary/25 shadow-[0_4px_24px_-4px_hsl(284_22%_44%/0.14)] border-primary/20"
          : "hover:shadow-[0_3px_16px_-4px_hsl(284_22%_44%/0.1)]"
      }`;
    }

    if (element.type === "affirmation") {
      return `${base} rounded-[20px] bg-[hsl(284_30%_97%)] border border-accent/[0.1] shadow-[0_1px_8px_-2px_hsl(284_22%_44%/0.05)] ${
        selected
          ? "ring-[2.5px] ring-accent/25 shadow-[0_4px_24px_-4px_hsl(284_22%_44%/0.14)]"
          : "hover:shadow-[0_3px_16px_-4px_hsl(284_22%_44%/0.08)]"
      }`;
    }

    if (element.type === "goal") {
      return `${base} rounded-[20px] bg-[hsl(30_33%_98%)] border border-phase-follicular/[0.12] shadow-[0_1px_8px_-2px_hsl(258_36%_49%/0.05)] ${
        selected
          ? "ring-[2.5px] ring-phase-follicular/25 shadow-[0_4px_24px_-4px_hsl(258_36%_49%/0.14)]"
          : "hover:shadow-[0_3px_16px_-4px_hsl(258_36%_49%/0.08)]"
      }`;
    }

    if (element.type === "prompt") {
      return `${base} rounded-[20px] border-[1.5px] border-dashed border-primary/[0.15] bg-[hsl(284_22%_98%/0.5)] ${
        selected
          ? "ring-[2.5px] ring-primary/20 border-primary/25 bg-[hsl(284_22%_97%/0.7)]"
          : "hover:border-primary/20 hover:bg-[hsl(284_22%_97%/0.6)]"
      }`;
    }

    // Note (text)
    return `${base} rounded-[20px] bg-[hsl(30_33%_99%)] border border-[hsl(25_25%_88%)] shadow-[0_1px_8px_-2px_hsl(25_20%_50%/0.08)] ${
      selected
        ? "ring-[2.5px] ring-primary/25 shadow-[0_4px_24px_-4px_hsl(284_22%_44%/0.14)] border-primary/20"
        : "hover:shadow-[0_3px_16px_-4px_hsl(25_20%_50%/0.12)]"
    }`;
  };

  // ── Render content ─────────────────────────────
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
        <p
          onDoubleClick={() => setEditing(true)}
          className="font-display text-[28px] font-bold italic text-foreground/50 cursor-text select-none tracking-tight leading-tight"
        >
          {element.content || "Section label"}
        </p>
      );
    }

    if (element.type === "image" && element.imageUrl) {
      return (
        <div className="w-full h-full overflow-hidden">
          <img
            src={element.imageUrl}
            alt={element.content}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: selected ? "scale(1.02)" : "scale(1)" }}
          />
          {/* Soft overlay for caption on hover */}
          {element.content && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="font-display text-xs italic text-primary-foreground/90 truncate">{element.content}</p>
            </div>
          )}
        </div>
      );
    }

    if (element.type === "quote") {
      return (
        <div className="p-5 flex flex-col h-full">
          <span className="font-display text-[32px] leading-none text-primary/20 mb-1 select-none">&ldquo;</span>
          {editing ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={() => setEditing(false)}
              className="w-full flex-1 bg-transparent font-display text-[15px] italic text-foreground/80 resize-none focus:outline-none leading-[1.7]"
              style={{ fontSize: "16px" }}
              autoFocus
            />
          ) : (
            <p onDoubleClick={() => setEditing(true)} className="font-display text-[15px] italic text-foreground/80 leading-[1.7] cursor-text select-none flex-1">
              {element.content || "Add an inspiring quote..."}
            </p>
          )}
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary/30 mt-2 select-none">Quote</span>
        </div>
      );
    }

    if (element.type === "prompt") {
      return (
        <div className="p-5 flex items-center h-full">
          <p className="font-display text-[15px] italic text-primary/50 leading-[1.7]">
            {element.content || "What does your next chapter feel like?"}
          </p>
        </div>
      );
    }

    if (element.type === "affirmation") {
      return (
        <div className="p-5 flex flex-col justify-center h-full">
          {editing ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={() => setEditing(false)}
              className="w-full bg-transparent font-display text-[15px] italic text-foreground/80 resize-none focus:outline-none leading-[1.7] text-center"
              style={{ fontSize: "16px" }}
              autoFocus
            />
          ) : (
            <p onDoubleClick={() => setEditing(true)} className="font-display text-[15px] italic text-foreground/80 leading-[1.7] cursor-text select-none text-center">
              {element.content || "I am..."}
            </p>
          )}
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent/40 mt-3 text-center select-none">Affirmation</span>
        </div>
      );
    }

    // Default: note, goal
    const typeLabel = element.type === "goal" ? "Goal" : "Note";
    const labelColor = element.type === "goal" ? "text-phase-follicular/40" : "text-muted-foreground/30";

    return (
      <div className="p-5 flex flex-col h-full">
        {element.type === "goal" && element.targetDate && (
          <span className="font-mono text-[9px] text-muted-foreground/40 mb-1 select-none">Target: {element.targetDate}</span>
        )}
        {editing ? (
          <textarea
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setEditing(false)}
            className="w-full flex-1 bg-transparent font-display text-[14px] italic text-foreground/80 resize-none focus:outline-none leading-[1.8]"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        ) : (
          <p onDoubleClick={() => setEditing(true)} className={`font-display text-[14px] italic leading-[1.8] cursor-text select-none flex-1 ${element.content ? "text-foreground/80" : "text-muted-foreground/30"}`}>
            {element.content || "Double-click to edit..."}
          </p>
        )}
        <span className={`font-mono text-[9px] uppercase tracking-[0.15em] ${labelColor} mt-2 select-none`}>{typeLabel}</span>
      </div>
    );
  };

  return (
    <div
      className={`${wrapperStyles()} group`}
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

      {/* Context toolbar */}
      {selected && !editing && (
        <div
          className="absolute -top-12 left-1/2 flex items-center gap-0.5 bg-[hsl(30_33%_99%)] border border-[hsl(25_25%_88%)] rounded-2xl shadow-[0_4px_20px_-4px_hsl(25_20%_50%/0.15)] px-2 py-1.5 z-50 backdrop-blur-sm"
          style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center" }}
        >
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBringForward(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Bring forward">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSendBackward(); }} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Send backward">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-border/60 mx-1" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl hover:bg-destructive/8 text-muted-foreground/60 hover:text-destructive transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Resize handles — elegant corner dots */}
      {selected && element.type !== "label" && (
        <>
          {/* Bottom-right main resize */}
          <div
            className="absolute -bottom-[5px] -right-[5px] w-[10px] h-[10px] cursor-se-resize z-50"
            onMouseDown={handleResizeStart}
          >
            <div className="w-[10px] h-[10px] rounded-full bg-primary/40 border-2 border-[hsl(30_33%_99%)] shadow-sm transition-colors hover:bg-primary/60" />
          </div>
          {/* Corner accent dots */}
          <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] rounded-full bg-primary/20 pointer-events-none" />
          <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] rounded-full bg-primary/20 pointer-events-none" />
          <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] rounded-full bg-primary/20 pointer-events-none" />
        </>
      )}
    </div>
  );
}
