import { useRef, useCallback, useEffect } from "react";
import type { DreamElement, DreamConnection } from "@/lib/journal-store";
import BoardElement from "./BoardElement";
import BoardConnections from "./BoardConnections";

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(Math.max(0.25, Math.min(3, zoom + delta)));
    } else {
      setPanX(panX - e.deltaX);
      setPanY(panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPanX, setPanY]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("board-surface")) {
      onSelect(null);
    }
  };

  const dotSpacing = 32 * zoom;

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden rounded-2xl"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      style={{ cursor: isPanning.current ? "grabbing" : connectingFrom ? "crosshair" : "default", backgroundColor: "hsl(30 33% 96%)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 board-surface"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(25 20% 78% / 0.35) 1px, transparent 1px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
          backgroundPosition: `${panX % dotSpacing}px ${panY % dotSpacing}px`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none board-surface"
        style={{ background: `radial-gradient(ellipse at center, transparent 50%, hsl(25 20% 78% / 0.12) 100%)` }}
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
        onClick={handleCanvasClick}
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

      {children}
    </div>
  );
}
