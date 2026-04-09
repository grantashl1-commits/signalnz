/**
 * SVG connection lines between board elements
 * Renders curved arrows with optional labels
 */
import type { DreamElement, DreamConnection } from "@/lib/journal-store";

interface Props {
  connections: DreamConnection[];
  elements: DreamElement[];
  zoom: number;
  panX: number;
  panY: number;
  onRemove: (id: string) => void;
}

function getCenter(el: DreamElement): { x: number; y: number } {
  return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
}

export default function BoardConnections({ connections, elements, zoom, panX, panY, onRemove }: Props) {
  const elMap = new Map(elements.map((e) => [e.id, e]));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999, overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrow-head"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M 0 0 L 8 3 L 0 6 Z" fill="hsl(284 22% 44% / 0.4)" />
        </marker>
      </defs>
      <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
        {connections.map((conn) => {
          const from = elMap.get(conn.fromId);
          const to = elMap.get(conn.toId);
          if (!from || !to) return null;

          const a = getCenter(from);
          const b = getCenter(to);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          // Offset control point perpendicular to the line
          const cx = (a.x + b.x) / 2 - dy * 0.15;
          const cy = (a.y + b.y) / 2 + dx * 0.15;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;

          return (
            <g key={conn.id}>
              {/* Connection line */}
              <path
                d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                fill="none"
                stroke={conn.color || "hsl(284 22% 44% / 0.25)"}
                strokeWidth={1.5}
                strokeDasharray="6 4"
                markerEnd="url(#arrow-head)"
              />
              {/* Clickable hit area */}
              <path
                d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                className="pointer-events-auto cursor-pointer"
                onClick={() => onRemove(conn.id)}
              />
              {/* Label */}
              {conn.label && (
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  className="pointer-events-none"
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-body)",
                    fill: "hsl(284 22% 44% / 0.5)",
                  }}
                >
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
