/**
 * Board Switcher Sidebar
 * Shows all boards with create/rename/delete, Milanote-style
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, X, LayoutGrid } from "lucide-react";
import type { DreamBoard } from "@/lib/journal-store";
import { haptic } from "@/hooks/use-mobile";

const COVER_COLORS = [
  "hsl(284 22% 44%)", "hsl(258 36% 49%)", "hsl(340 30% 55%)",
  "hsl(25 40% 55%)", "hsl(180 30% 45%)", "hsl(45 50% 55%)",
];

interface Props {
  boards: DreamBoard[];
  activeBoardId: string | null;
  onSwitch: (id: string) => void;
  onCreate: (title: string, color?: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function BoardSwitcher({ boards, activeBoardId, onSwitch, onCreate, onRename, onDelete, onClose }: Props) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(COVER_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    haptic("medium");
    onCreate(newTitle.trim(), newColor);
    setNewTitle("");
    setCreating(false);
  };

  const handleRename = (id: string) => {
    if (!editTitle.trim()) return;
    onRename(id, editTitle.trim());
    setEditingId(null);
  };

  return (
    <div className="absolute top-0 right-0 w-80 h-full z-40 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary/60" />
            <p className="font-display text-lg italic text-foreground">My Boards</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Board list */}
        <div className="space-y-2 mb-4">
          {boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                board.id === activeBoardId
                  ? "border-primary/25 bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/15 hover:bg-secondary/30"
              }`}
              onClick={() => { haptic("light"); onSwitch(board.id); }}
            >
              {/* Colour dot */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: board.coverColor || COVER_COLORS[0] }} />
                {editingId === board.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRename(board.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(board.id)}
                    className="flex-1 bg-transparent font-display text-[14px] italic text-foreground focus:outline-none"
                    style={{ fontSize: "16px" }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="font-display text-[14px] italic text-foreground/80 flex-1 truncate">
                    {board.title}
                  </span>
                )}
              </div>

              {/* Meta */}
              <p className="font-body text-[9px] text-muted-foreground/40 mt-1.5 pl-6">
                {board.elements.length} elements · {board.connections.length} connections
              </p>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingId(board.id); setEditTitle(board.title); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
                {boards.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); haptic("medium"); onDelete(board.id); }}
                    className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground/50 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create new */}
        <AnimatePresence>
          {creating ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 space-y-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Board name..."
                  className="w-full bg-transparent font-display text-[14px] italic text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
                <div className="flex gap-2">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full transition-all ${newColor === c ? "ring-2 ring-offset-2 ring-primary/40" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCreating(false)} className="flex-1 rounded-xl border border-border py-2 font-display text-xs italic text-muted-foreground">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 rounded-xl bg-primary py-2 font-display text-xs italic text-primary-foreground">Create</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-muted-foreground/50 hover:border-primary/20 hover:text-primary/60 transition-all font-display text-[13px] italic"
            >
              <Plus className="h-4 w-4" /> New board
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
