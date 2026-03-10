import { useRef, useCallback, useState, useEffect } from "react";
import type { DreamElement } from "@/lib/journal-store";
import BoardElement from "./BoardElement";

interface Props {
  elements: DreamElement[];
  zoom: number;
  panX: number;
  panY: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<DreamElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  setPanX: (v: number) => void;
  setPanY: (v: number) => void;
  setZoom: (v: number) => void;
  children?: React.ReactNode;
}

export default function BoardCanvas({
  elements, zoom, panX, panY, selectedId,
  onSelect, onUpdate, onDelete, onDuplicate,
  onBringForward, onSendBackward,
  setPanX, setPanY, setZoom, children,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Middle-click or space+drag panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan on middle click or if clicking empty canvas
    if (e.button === 1 || (e.target === canvasRef.current?.querySelector(".board-surface"))) {
      if (e.target === canvasRef.current?.querySelector(".board-surface") && e.button === 0) {
        onSelect(null);
      }
      if (e.button === 1) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
      }
    }
  }, [panX, panY, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning.current) {
      setPanX(panStart.current.panX + (e.clientX - panStart.current.x));
      setPanY(panStart.current.panY + (e.clientY - panStart.current.y));
    }
  }, [setPanX, setPanY]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(Math.max(0.25, Math.min(3, zoom + delta)));
    } else {
      // Regular scroll = pan
      setPanX(panX - e.deltaX);
      setPanY(panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPanX, setPanY]);

  // Click empty canvas to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("board-surface")) {
      onSelect(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      style={{ cursor: isPanning.current ? "grabbing" : "default" }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 board-surface"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${panX % (24 * zoom)}px ${panY % (24 * zoom)}px`,
        }}
      />

      {/* Transform layer */}
      <div
        className="absolute origin-top-left board-surface"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          width: "6000px",
          height: "6000px",
        }}
        onClick={handleCanvasClick}
      >
        {elements.map((el) => (
          <BoardElement
            key={el.id}
            element={el}
            selected={selectedId === el.id}
            zoom={zoom}
            onSelect={() => onSelect(el.id)}
            onUpdate={(updates) => onUpdate(el.id, updates)}
            onDelete={() => onDelete(el.id)}
            onDuplicate={() => onDuplicate(el.id)}
            onBringForward={() => onBringForward(el.id)}
            onSendBackward={() => onSendBackward(el.id)}
          />
        ))}
      </div>

      {/* Overlay UI */}
      {children}
    </div>
  );
}
