/**
 * Milanote-style Board Element
 * Draggable, resizable sticky-note cards with distinct styles per type:
 *   text note (warm cream), image card, goal card (checkbox), quote card (italic serif)
 */
import { useState, useRef, useCallback } from "react";
import { Trash2, Copy, ArrowUp, ArrowDown, Link2, Check } from "lucide-react";
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
const GRID = 16; // snap grid (half the 32px dot spacing for finer control)
const snap = (v: number) => Math.round(v / GRID) * GRID;

/* ── Type-specific visual themes ─────────────────────────── */
const TYPE_THEMES: Record<string, {
  bg: string; border: string; borderSelected: string;
  label: string; accent: string;
  shadow: string; shadowSelected: string;
}> = {
  text: {
    bg: "hsl(36 40% 97%)",
    border: "hsl(32 30% 89%)",
    borderSelected: "hsl(32 40% 76%)",
    label: "hsl(25 20% 58%)",
    accent: "hsl(32 40% 76%)",
    shadow: "0 1px 4px -1px hsl(30 20% 50% / 0.08), 0 2px 10px -3px hsl(30 20% 50% / 0.06)",
    shadowSelected: "0 8px 28px -6px hsl(30 30% 50% / 0.18), 0 2px 8px -2px hsl(30 20% 50% / 0.10)",
  },
  quote: {
    bg: "hsl(284 28% 97%)",
    border: "hsl(284 18% 87%)",
    borderSelected: "hsl(284 22% 70%)",
    label: "hsl(284 22% 52%)",
    accent: "hsl(284 22% 44%)",
    shadow: "0 1px 4px -1px hsl(284 20% 40% / 0.06), 0 2px 10px -3px hsl(284 20% 40% / 0.05)",
    shadowSelected: "0 8px 28px -6px hsl(284 22% 44% / 0.16), 0 2px 8px -2px hsl(284 22% 44% / 0.08)",
  },
  goal: {
    bg: "hsl(258 28% 97%)",
    border: "hsl(258 20% 87%)",
    borderSelected: "hsl(258 30% 70%)",
    label: "hsl(258 36% 49%)",
    accent: "hsl(258 36% 49%)",
    shadow: "0 1px 4px -1px hsl(258 20% 40% / 0.06), 0 2px 10px -3px hsl(258 20% 40% / 0.05)",
    shadowSelected: "0 8px 28px -6px hsl(258 36% 49% / 0.16), 0 2px 8px -2px hsl(258 36% 49% / 0.08)",
  },
  affirmation: {
    bg: "hsl(340 22% 97%)",
    border: "hsl(340 16% 88%)",
    borderSelected: "hsl(340 24% 72%)",
    label: "hsl(340 30% 55%)",
    accent: "hsl(340 30% 60%)",
    shadow: "0 1px 4px -1px hsl(340 20% 40% / 0.06), 0 2px 10px -3px hsl(340 20% 40% / 0.05)",
    shadowSelected: "0 8px 28px -6px hsl(340 30% 55% / 0.14), 0 2px 8px -2px hsl(340 30% 55% / 0.07)",
  },
  prompt: {
    bg: "hsl(284 18% 96%)",
    border: "hsl(284 12% 89%)",
    borderSelected: "hsl(284 20% 72%)",
    label: "hsl(284 22% 52%)",
    accent: "hsl(284 22% 44%)",
    shadow: "0 1px 4px -1px hsl(284 15% 40% / 0.06), 0 2px 10px -3px hsl(284 15% 40% / 0.04)",
    shadowSelected: "0 8px 28px -6px hsl(284 22% 44% / 0.14), 0 2px 8px -2px hsl(284 22% 44% / 0.07)",
  },
  image: {
    bg: "hsl(30 20% 98%)",
    border: "hsl(25 20% 89%)",
    borderSelected: "hsl(25 25% 72%)",
    label: "hsl(25 20% 60%)",
    accent: "hsl(25 25% 72%)",
    shadow: "0 2px 8px -2px hsl(25 20% 30% / 0.10), 0 4px 16px -4px hsl(25 20% 30% / 0.08)",
    shadowSelected: "0 10px 32px -8px hsl(25 20% 30% / 0.20), 0 4px 12px -2px hsl(25 20% 30% / 0.10)",
  },
  label: {
    bg: "transparent",
    border: "transparent",
    borderSelected: "transparent",
    label: "hsl(25 20% 60%)",
    accent: "transparent",
    shadow: "none",
    shadowSelected: "none",
  },
};

/* ── Hand-drawn style SVG checkbox ───────────────────────── */
function GoalCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="flex-shrink-0 w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center transition-all duration-200"
      style={{
        borderColor: checked ? "hsl(258 36% 49%)" : "hsl(258 20% 80%)",
        background: checked ? "hsl(258 36% 49%)" : "transparent",
      }}
    >
      {checked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
    </button>
  );
}

export default function BoardElement({
  element, selected, zoom, isConnecting,
  onSelect, onUpdate, onDelete, onDuplicate,
  onBringForward, onSendBackward, onStartConnect,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ex: 0, ey: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const theme = TYPE_THEMES[element.type] || TYPE_THEMES.text;

  /* ── Drag ────────────────────────────────────────────────── */
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
    const onUp = (ev: MouseEvent) => {
      setDragging(false);
      // Snap to grid on release
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      onUpdate({ x: snap(dragStart.current.ex + dx), y: snap(dragStart.current.ey + dy) });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  /* ── Resize (snaps on release) ────────────────────────────── */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: element.width, h: element.height };
    const onMove = (ev: MouseEvent) => {
      const dw = (ev.clientX - resizeStart.current.mx) / zoom;
      const dh = (ev.clientY - resizeStart.current.my) / zoom;
      onUpdate({ width: Math.max(MIN_W, resizeStart.current.w + dw), height: Math.max(MIN_H, resizeStart.current.h + dh) });
    };
    const onUp = (ev: MouseEvent) => {
      const dw = (ev.clientX - resizeStart.current.mx) / zoom;
      const dh = (ev.clientY - resizeStart.current.my) / zoom;
      onUpdate({ width: snap(Math.max(MIN_W, resizeStart.current.w + dw)), height: snap(Math.max(MIN_H, resizeStart.current.h + dh)) });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [element.width, element.height, zoom, onUpdate]);

  /* ── Touch drag ─────────────────────────────────────────── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (editing) return;
    e.stopPropagation();
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
      onUpdate({ x: snap(element.x), y: snap(element.y) });
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [editing, element.x, element.y, zoom, onUpdate, onSelect]);

  const startEditing = () => { if (!editing) setEditing(true); };

  /* ── Content renderer per type ──────────────────────────── */
  const renderContent = () => {
    /* ─── Section label ───── */
    if (element.type === "label") {
      return editing ? (
        <input
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          className="w-full bg-transparent font-display text-[26px] font-bold italic text-foreground/55 focus:outline-none tracking-tight"
          style={{ fontSize: "26px" }}
          autoFocus
        />
      ) : (
        <p onDoubleClick={startEditing} className="font-display text-[26px] font-bold italic text-foreground/45 cursor-text select-none tracking-tight leading-tight">
          {element.content || "Section label"}
        </p>
      );
    }

    /* ─── Image card ────── */
    if (element.type === "image") {
      return (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {element.imageUrl ? (
            <div className="flex-1 overflow-hidden">
              <img
                src={element.imageUrl}
                alt={element.content}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{ transform: selected ? "scale(1.03)" : "scale(1)" }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-secondary/30">
              <span className="font-display text-sm italic text-muted-foreground/30">No image</span>
            </div>
          )}
          {/* Caption area */}
          <div className="px-4 py-3 bg-card/80 backdrop-blur-sm border-t border-border/50">
            {editing ? (
              <input
                value={element.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
                placeholder="Add caption..."
                className="w-full bg-transparent font-display text-[13px] italic text-foreground/70 focus:outline-none placeholder:text-muted-foreground/25"
                style={{ fontSize: "16px" }}
                autoFocus
              />
            ) : (
              <p
                onDoubleClick={startEditing}
                className={`font-display text-[13px] italic cursor-text select-none truncate ${element.content ? "text-foreground/70" : "text-muted-foreground/25"}`}
              >
                {element.content || "Add caption..."}
              </p>
            )}
          </div>
        </div>
      );
    }

    /* ─── Quote card (italic serif with large quotation mark) ── */
    if (element.type === "quote") {
      return (
        <div className="p-5 flex flex-col h-full relative">
          {/* Large decorative quote mark */}
          <svg width="32" height="24" viewBox="0 0 32 24" className="mb-2 flex-shrink-0" style={{ opacity: 0.15 }}>
            <path d="M0 18.4C0 12.267 1.867 7.6 5.6 4.4 7.467 2.8 9.6 1.6 12 .8l1.2 3.2C9.867 5.333 8 7.733 7.2 10.4 8 10.133 8.867 10 9.6 10c3.467 0 5.6 2.267 5.6 5.6 0 3.733-2.4 6.4-6 6.4C4.667 22 0 20.267 0 18.4Zm17.6 0C17.6 12.267 19.467 7.6 23.2 4.4 25.067 2.8 27.2 1.6 29.6.8l1.2 3.2c-3.333 1.333-5.2 3.733-6 6.4.8-.267 1.667-.4 2.4-.4 3.467 0 5.6 2.267 5.6 5.6 0 3.733-2.4 6.4-6 6.4-4.533 0-9.2-1.733-9.2-3.6Z" fill={theme.accent} />
          </svg>
          {editing ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={() => setEditing(false)}
              className="w-full flex-1 bg-transparent font-display text-[16px] italic text-foreground/75 resize-none focus:outline-none leading-[1.75]"
              style={{ fontSize: "16px" }}
              autoFocus
            />
          ) : (
            <p onDoubleClick={startEditing} className="font-display text-[16px] italic text-foreground/75 leading-[1.75] cursor-text select-none flex-1">
              {element.content || "Add an inspiring quote..."}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="w-4 h-[2px] rounded-full" style={{ background: theme.accent, opacity: 0.3 }} />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] select-none" style={{ color: theme.label }}>Quote</span>
          </div>
        </div>
      );
    }

    /* ─── Goal card (with interactive checkbox) ──────────── */
    if (element.type === "goal") {
      const isDone = element.status === "done";
      return (
        <div className="p-5 flex flex-col h-full">
          {/* Top accent bar */}
          <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full" style={{ background: theme.accent, opacity: 0.3 }} />
          <div className="flex items-start gap-3 flex-1 mt-1">
            <GoalCheckbox checked={isDone} onChange={() => onUpdate({ status: isDone ? undefined : "done" })} />
            <div className="flex-1 min-w-0">
              {editing ? (
                <textarea
                  value={element.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  onBlur={() => setEditing(false)}
                  className="w-full bg-transparent font-display text-[14px] italic text-foreground/80 resize-none focus:outline-none leading-[1.8]"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
              ) : (
                <p
                  onDoubleClick={startEditing}
                  className={`font-display text-[14px] italic leading-[1.8] cursor-text select-none transition-all ${
                    isDone ? "line-through text-muted-foreground/40" : element.content ? "text-foreground/80" : "text-muted-foreground/25"
                  }`}
                >
                  {element.content || "Define your goal..."}
                </p>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: theme.border }}>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] select-none" style={{ color: theme.label }}>
              {isDone ? "Complete" : "Goal"}
            </span>
            {element.targetDate && (
              <span className="font-mono text-[8px] text-muted-foreground/35 select-none">{element.targetDate}</span>
            )}
          </div>
        </div>
      );
    }

    /* ─── Prompt card ─────────────────────────────────────── */
    if (element.type === "prompt") {
      return (
        <div className="p-5 flex flex-col justify-center h-full">
          <div className="w-6 h-[2px] rounded-full mb-3" style={{ background: theme.accent, opacity: 0.25 }} />
          <p className="font-display text-[15px] italic leading-[1.75]" style={{ color: theme.label }}>
            {element.content || "What does your next chapter feel like?"}
          </p>
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-3 select-none" style={{ color: theme.label, opacity: 0.5 }}>Prompt</span>
        </div>
      );
    }

    /* ─── Affirmation card (centered, warm) ───────────────── */
    if (element.type === "affirmation") {
      return (
        <div className="p-5 flex flex-col justify-center items-center h-full text-center">
          {editing ? (
            <textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={() => setEditing(false)}
              className="w-full bg-transparent font-display text-[15px] italic text-foreground/80 resize-none focus:outline-none leading-[1.75] text-center"
              style={{ fontSize: "16px" }}
              autoFocus
            />
          ) : (
            <p onDoubleClick={startEditing} className={`font-display text-[15px] italic leading-[1.75] cursor-text select-none ${element.content ? "text-foreground/80" : "text-muted-foreground/25"}`}>
              {element.content || "I am..."}
            </p>
          )}
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-3 select-none" style={{ color: theme.label }}>Affirmation</span>
        </div>
      );
    }

    /* ─── Text note (default: warm cream sticky note) ─────── */
    return (
      <div className="p-5 flex flex-col h-full">
        {/* Subtle top fold line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: `linear-gradient(90deg, ${theme.accent}55, ${theme.accent}22)` }} />
        {editing ? (
          <textarea
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setEditing(false)}
            className="w-full flex-1 bg-transparent font-display text-[14px] italic text-foreground/80 resize-none focus:outline-none leading-[1.85]"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        ) : (
          <p
            onDoubleClick={startEditing}
            className={`font-display text-[14px] italic leading-[1.85] cursor-text select-none flex-1 ${element.content ? "text-foreground/80" : "text-muted-foreground/25"}`}
          >
            {element.content || "Double-click to write..."}
          </p>
        )}
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] mt-2 select-none" style={{ color: theme.label }}>Note</span>
      </div>
    );
  };

  const isLabel = element.type === "label";

  return (
    <div
      className={`absolute group ${isConnecting ? "ring-2 ring-primary/30 ring-offset-2" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: isLabel ? "auto" : element.height,
        zIndex: element.zIndex,
        cursor: dragging ? "grabbing" : editing ? "text" : "grab",
        borderRadius: isLabel ? 0 : 14,
        background: theme.bg,
        border: isLabel ? "none" : `1px solid ${selected ? theme.borderSelected : theme.border}`,
        boxShadow: selected ? theme.shadowSelected : theme.shadow,
        overflow: isLabel ? "visible" : "hidden",
        transition: "box-shadow 0.25s ease, border-color 0.2s ease",
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleTouchStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {renderContent()}

      {/* ── Context toolbar (floating above card) ──────────── */}
      {selected && !editing && (
        <div
          className="absolute -top-11 left-1/2 flex items-center gap-0.5 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg px-1.5 py-1 z-50"
          style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center" }}
        >
          <button onClick={(e) => { e.stopPropagation(); onStartConnect(); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary/50 hover:text-primary transition-colors" title="Connect">
            <Link2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/60 hover:text-foreground transition-colors" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBringForward(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/60 hover:text-foreground transition-colors" title="Forward">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSendBackward(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/60 hover:text-foreground transition-colors" title="Backward">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-4 bg-border/50 mx-0.5" />
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Resize handle (corner dot) ─────────────────────── */}
      {selected && !isLabel && (
        <>
          <div className="absolute -bottom-[5px] -right-[5px] w-[12px] h-[12px] cursor-se-resize z-50" onMouseDown={handleResizeStart}>
            <div className="w-[10px] h-[10px] rounded-full border-2 border-card transition-colors" style={{ background: theme.accent, opacity: 0.6 }} />
          </div>
          {/* Selection corner dots */}
          <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.borderSelected, opacity: 0.4 }} />
          <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.borderSelected, opacity: 0.4 }} />
          <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ background: theme.borderSelected, opacity: 0.4 }} />
        </>
      )}
    </div>
  );
}
