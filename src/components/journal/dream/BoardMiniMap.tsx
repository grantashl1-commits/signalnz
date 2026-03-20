/**
 * Mini-map thumbnail for the Dream Studio canvas.
 * Shows element positions and a viewport rectangle indicating the visible area.
 * Click/drag on the mini-map to pan the canvas.
 */
import { useRef, useMemo, useCallback } from "react";
import type { DreamElement } from "@/lib/journal-store";

const MAP_W = 140;
const MAP_H = 100;
const PADDING = 80;

const TYPE_COLORS: Record<string, string> = {
  text: "hsl(32 35% 78%)",
  quote: "hsl(284 22% 70%)",
  goal: "hsl(258 30% 70%)",
  affirmation: "hsl(340 25% 72%)",
  prompt: "hsl(284 18% 72%)",
  image: "hsl(25 22% 72%)",
  label: "hsl(25 18% 68%)",
};

interface Props {
  elements: DreamElement[];
  zoom: number;
  panX: number;
  panY: number;
  canvasRef: React.RefObject<HTMLDivElement>;
  setPanX: (v: number) => void;
  setPanY: (v: number) => void;
}

export default function BoardMiniMap({ elements, zoom, panX, panY, canvasRef, setPanX, setPanY }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Compute bounding box of all elements with padding
  const bounds = useMemo(() => {
    if (elements.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of elements) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
    return {
      minX: minX - PADDING,
      minY: minY - PADDING,
      maxX: maxX + PADDING,
      maxY: maxY + PADDING,
    };
  }, [elements]);

  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const scaleX = MAP_W / worldW;
  const scaleY = MAP_H / worldH;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle in world coords
  const canvasW = canvasRef.current?.clientWidth ?? 800;
  const canvasH = canvasRef.current?.clientHeight ?? 600;
  const vpX = (-panX / zoom - bounds.minX) * scale;
  const vpY = (-panY / zoom - bounds.minY) * scale;
  const vpW = (canvasW / zoom) * scale;
  const vpH = (canvasH / zoom) * scale;

  // Click/drag to pan
  const panToMapPos = useCallback((clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    // Convert minimap position to world position, centering the viewport there
    const worldX = mx / scale + bounds.minX;
    const worldY = my / scale + bounds.minY;
    setPanX(-(worldX - canvasW / zoom / 2) * zoom);
    setPanY(-(worldY - canvasH / zoom / 2) * zoom);
  }, [scale, bounds, zoom, canvasW, canvasH, setPanX, setPanY]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    panToMapPos(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => {
      if (dragging.current) panToMapPos(ev.clientX, ev.clientY);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panToMapPos]);

  if (elements.length === 0) return null;

  return (
    <div
      ref={mapRef}
      className="absolute bottom-5 right-5 z-50 rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm overflow-hidden cursor-crosshair"
      style={{ width: MAP_W, height: MAP_H }}
      onMouseDown={handleMouseDown}
    >
      {/* Element dots */}
      <svg width={MAP_W} height={MAP_H} className="absolute inset-0">
        {elements.map((el) => {
          const x = (el.x - bounds.minX) * scale;
          const y = (el.y - bounds.minY) * scale;
          const w = Math.max(el.width * scale, 3);
          const h = Math.max(el.height * scale, 2);
          return (
            <rect
              key={el.id}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={1.5}
              fill={TYPE_COLORS[el.type] || "hsl(25 18% 72%)"}
              opacity={0.7}
            />
          );
        })}
        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, vpX)}
          y={Math.max(0, vpY)}
          width={Math.min(vpW, MAP_W)}
          height={Math.min(vpH, MAP_H)}
          fill="hsl(var(--primary) / 0.06)"
          stroke="hsl(var(--primary) / 0.35)"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  );
}
