import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Archive, Sparkles } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { haptic } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function HomeTodoList() {
  const { user } = useAuth();
  const { todos, loading, addTodo, toggleTodo, archiveTodo, deleteTodo } = useTodos();
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);

  if (!user) return null;

  const active = todos.filter((t) => !t.completed);
  const justDone = todos.filter((t) => t.completed);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    haptic("medium");
    await addTodo(newTask);
    setNewTask("");
    setShowInput(false);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    haptic("light");
    await toggleTodo(id, completed);
  };

  const handleArchive = async (id: string) => {
    haptic("medium");
    await archiveTodo(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="card-warm space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Botanical checkbox icon */}
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-body text-section-label uppercase" style={{ color: 'hsl(var(--label-color))' }}>
            to-do
          </p>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-primary active:opacity-70 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="What needs doing?"
                className="flex-1 font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }}
                autoFocus
              />
              <button
                onClick={handleAdd}
                className="rounded-xl bg-primary px-3.5 py-2 font-body text-xs font-medium text-primary-foreground active:opacity-90"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo items */}
      {loading ? (
        <div className="py-4 text-center">
          <p className="font-display text-sm italic text-muted-foreground/50">Loading...</p>
        </div>
      ) : active.length === 0 && justDone.length === 0 && !showInput ? (
        <div className="py-3 text-center">
          <p className="font-display text-sm italic text-muted-foreground/50">
            Nothing on your list — what a beautiful feeling ✨
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {active.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, height: 0 }}
                className="flex items-center gap-3 group py-1.5"
              >
                <button
                  onClick={() => handleToggle(todo.id, true)}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-colors flex items-center justify-center"
                />
                <p className="flex-1 font-display text-[15px] italic text-foreground leading-snug min-w-0">{todo.title}</p>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:!text-destructive transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Completed items */}
          <AnimatePresence>
            {justDone.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 group py-1.5"
              >
                <button
                  onClick={() => handleToggle(todo.id, false)}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary" />
                </button>
                <p className="flex-1 font-display text-[15px] italic text-muted-foreground/50 line-through leading-snug min-w-0">{todo.title}</p>
                <button
                  onClick={() => handleArchive(todo.id)}
                  title="Archive to vault"
                  className="text-muted-foreground/0 group-hover:text-primary/50 hover:!text-primary transition-colors flex-shrink-0"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Achievement link */}
      {justDone.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-1 border-t border-border/30"
        >
          <p className="font-body text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Tap <Archive className="h-3 w-3 inline" /> to save completed tasks to your "Look What You've Done" vault
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
