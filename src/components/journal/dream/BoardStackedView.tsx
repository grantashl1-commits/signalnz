/**
 * Mobile stacked card view for Dream Studio
 * Shows board elements as a scrollable list instead of infinite canvas
 */
import { motion } from "framer-motion";
import { Trash2, Copy, Link2, GripVertical } from "lucide-react";
import type { DreamElement, DreamConnection } from "@/lib/journal-store";
import { useState } from "react";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  text: { label: "Note", color: "hsl(25 40% 55%)" },
  quote: { label: "Quote", color: "hsl(284 22% 44%)" },
  goal: { label: "Goal", color: "hsl(258 36% 49%)" },
  affirmation: { label: "Affirm", color: "hsl(340 30% 55%)" },
  prompt: { label: "Prompt", color: "hsl(284 22% 55%)" },
  image: { label: "Image", color: "hsl(25 40% 55%)" },
  label: { label: "Section", color: "hsl(25 20% 60%)" },
};

interface Props {
  elements: DreamElement[];
  connections: DreamConnection[];
  onUpdate: (id: string, updates: Partial<DreamElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
}

export default function BoardStackedView({ elements, connections, onUpdate, onDelete, onDuplicate, onSelect, selectedId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sort by y position (top to bottom) then x
  const sorted = [...elements].sort((a, b) => a.y - b.y || a.x - b.x);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3 px-1">
      {sorted.map((el, i) => {
        const meta = TYPE_LABELS[el.type] || TYPE_LABELS.text;
        const isEditing = editingId === el.id;
        const isSelected = selectedId === el.id;
        const connCount = connections.filter((c) => c.fromId === el.id || c.toId === el.id).length;

        if (el.type === "label") {
          return (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="pt-4 pb-1"
            >
              {isEditing ? (
                <input
                  value={el.content}
                  onChange={(e) => onUpdate(el.id, { content: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  className="w-full bg-transparent font-display text-xl font-bold italic text-foreground/60 focus:outline-none"
                  style={{ fontSize: "20px" }}
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setEditingId(el.id)}
                  className="font-display text-xl font-bold italic text-foreground/50 cursor-text"
                >
                  {el.content || "Section label"}
                </p>
              )}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={el.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`rounded-2xl border overflow-hidden transition-all ${
              isSelected
                ? "border-primary/25 shadow-md"
                : "border-border hover:border-primary/15"
            }`}
            style={{
              background: el.type === "image" ? "transparent" : `color-mix(in srgb, ${meta.color} 4%, hsl(30 33% 99%))`,
            }}
            onClick={() => onSelect(el.id)}
          >
            {/* Image type */}
            {el.type === "image" && el.imageUrl && (
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img src={el.imageUrl} alt={el.content} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {/* Type badge + actions row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: meta.color }}>{meta.label}</span>
                  {connCount > 0 && (
                    <span className="flex items-center gap-0.5 font-mono text-[8px] text-muted-foreground/40">
                      <Link2 className="h-2.5 w-2.5" /> {connCount}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 opacity-60">
                  <button onClick={(e) => { e.stopPropagation(); onDuplicate(el.id); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(el.id); }} className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Text content */}
              {el.type !== "image" && (
                isEditing ? (
                  <textarea
                    value={el.content}
                    onChange={(e) => onUpdate(el.id, { content: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    className="w-full bg-transparent font-display text-[14px] italic text-foreground/80 resize-none focus:outline-none leading-[1.8] min-h-[60px]"
                    style={{ fontSize: "16px" }}
                    autoFocus
                  />
                ) : (
                  <p
                    onClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                    className={`font-display text-[14px] italic leading-[1.8] cursor-text ${el.content ? "text-foreground/80" : "text-muted-foreground/30"}`}
                  >
                    {el.content || "Tap to edit..."}
                  </p>
                )
              )}

              {el.type === "image" && el.content && (
                <p className="font-display text-xs italic text-muted-foreground/50 mt-1">{el.content}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
