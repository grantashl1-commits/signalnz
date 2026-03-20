import { useRef, useCallback, useEffect, useMemo } from "react";
import type { DreamElement, DreamConnection } from "@/lib/journal-store";
import BoardElement from "./BoardElement";
import BoardConnections from "./BoardConnections";
import BoardMiniMap from "./BoardMiniMap";

interface Props {
  elements: DreamElement[];
  connections: DreamConnection[];
  zoom: number;
  panX: number;
  panY: number;
  selectedId: string | null;
  connectingFrom: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<DreamElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onStartConnect: (id: string) => void;
  onCompleteConnect: (toId: string) => void;
  onRemoveConnection: (id: string) => void;
  setPanX: (v: number) => void;
  setPanY: (v: number) => void;
  setZoom: (v: number) => void;
  children?: React.ReactNode;
}

export default function BoardCanvas({
  elements, connections, zoom, panX, panY, selectedId, connectingFrom,
  onSelect, onUpdate, onDelete, onDuplicate,
  onBringForward, onSendBackward,
  onStartConnect, onCompleteConnect, onRemoveConnection,
  setPanX, setPanY, setZoom, children,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  // Check if event target is the background surface (not an element)
  const isSurface = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return target.classList.contains("board-surface") || target === canvasRef.current;
  };

  // Mouse pan: left-click on surface OR middle-click anywhere
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const onSurface = isSurface(e.target);
    if (onSurface && e.button === 0) {
      onSelect(null);
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
    }
    if (e.button === 1) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
    }
  }, [panX, panY, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning.current) {
      setPanX(panStart.current.panX + (e.clientX - panStart.current.x));
      setPanY(panStart.current.panY + (e.clientY - panStart.current.y));
    }
  }, [setPanX, setPanY]);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch: one-finger pan, two-finger pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isSurface(e.target)) {
      onSelect(null);
      isPanning.current = true;
      const t = e.touches[0];
      panStart.current = { x: t.clientX, y: t.clientY, panX, panY };
    }
    if (e.touches.length === 2) {
      isPanning.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, [panX, panY, onSelect]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning.current) {
      const t = e.touches[0];
      setPanX(panStart.current.panX + (t.clientX - panStart.current.x));
      setPanY(panStart.current.panY + (t.clientY - panStart.current.y));
    }
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / lastTouchDist.current;
      const newZoom = Math.max(0.25, Math.min(3, zoom * scale));
      setZoom(newZoom);
      lastTouchDist.current = dist;

      // Pan while pinching
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (lastTouchCenter.current) {
        setPanX(panX + (cx - lastTouchCenter.current.x));
        setPanY(panY + (cy - lastTouchCenter.current.y));
      }
      lastTouchCenter.current = { x: cx, y: cy };
    }
  }, [zoom, panX, panY, setZoom, setPanX, setPanY]);

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    lastTouchDist.current = null;
    lastTouchCenter.current = null;
  }, []);

  // Wheel: scroll to pan, ctrl/cmd+scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      const mx = e.clientX - (rect?.left ?? 0);
      const my = e.clientY - (rect?.top ?? 0);
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const newZoom = Math.max(0.25, Math.min(3, zoom + delta));
      // Zoom toward cursor
      const ratio = newZoom / zoom;
      setPanX(mx - ratio * (mx - panX));
      setPanY(my - ratio * (my - panY));
      setZoom(newZoom);
    } else {
      setPanX(panX - e.deltaX);
      setPanY(panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPanX, setPanY]);

  const dotSpacing = 32 * zoom;

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isPanning.current ? "grabbing" : connectingFrom ? "crosshair" : "grab",
        backgroundColor: "#faf8f5",
        touchAction: "none",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 board-surface"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(25 18% 80% / 0.28) 1px, transparent 1px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
          backgroundPosition: `${panX % dotSpacing}px ${panY % dotSpacing}px`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none board-surface"
        style={{ background: `radial-gradient(ellipse at center, transparent 60%, hsl(25 18% 80% / 0.08) 100%)` }}
      />

      {/* Connection lines */}
      <BoardConnections
        connections={connections}
        elements={elements}
        zoom={zoom}
        panX={panX}
        panY={panY}
        onRemove={onRemoveConnection}
      />

      {/* Transform layer */}
      <div
        className="absolute origin-top-left board-surface"
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, width: "8000px", height: "8000px" }}
      >
        {elements.map((el) => (
          <BoardElement
            key={el.id}
            element={el}
            selected={selectedId === el.id}
            zoom={zoom}
            isConnecting={connectingFrom !== null && connectingFrom !== el.id}
            onSelect={() => {
              if (connectingFrom && connectingFrom !== el.id) {
                onCompleteConnect(el.id);
              } else {
                onSelect(el.id);
              }
            }}
            onUpdate={(updates) => onUpdate(el.id, updates)}
            onDelete={() => onDelete(el.id)}
            onDuplicate={() => onDuplicate(el.id)}
            onBringForward={() => onBringForward(el.id)}
            onSendBackward={() => onSendBackward(el.id)}
            onStartConnect={() => onStartConnect(el.id)}
          />
        ))}
      </div>

      {/* Connecting mode indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground font-mono text-[11px] shadow-lg animate-pulse">
          Click another element to connect · ESC to cancel
        </div>
      )}

      {/* Mini-map */}
      <BoardMiniMap
        elements={elements}
        zoom={zoom}
        panX={panX}
        panY={panY}
        canvasRef={canvasRef}
        setPanX={setPanX}
        setPanY={setPanY}
      />

      {children}
    </div>
  );
}
