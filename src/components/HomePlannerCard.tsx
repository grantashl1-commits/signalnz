import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Check, Trash2, Archive, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useTodos } from "@/hooks/useTodos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loadVault, saveVault, type VaultEntry } from "@/lib/journal-store";
import { useTodayFocus } from "@/hooks/useTodayFocus";

import botanicalCorner from "@/assets/journal/botanical-corner.png";
import botanicalLavender from "@/assets/journal/botanical-lavender.png";

function DottedLine({ className = "" }: { className?: string }) {
  return <div className={`border-b border-dotted border-foreground/10 ${className}`} />;
}

export default function HomePlannerCard() {
  const today = new Date();
  const { user } = useAuth();
  const { focus } = useTodayFocus();
  const { todos, loading, addTodo, toggleTodo, archiveTodo, deleteTodo } = useTodos();
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);

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
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const ve: VaultEntry = {
        id: Date.now().toString(),
        entryId: todo.id,
        category: "wins-firsts",
        title: todo.title,
        preview: `Completed ${todo.completed_at ? new Date(todo.completed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }) : "today"}`,
        date: new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }),
        timestamp: Date.now(),
      };
      const vault = loadVault();
      saveVault([ve, ...vault]);
      if (user) {
        await supabase.from("vault_entries").upsert({
          id: ve.id, user_id: user.id, entry_id: ve.entryId,
          category: ve.category, title: ve.title, preview: ve.preview,
          date: ve.date, timestamp: ve.timestamp,
        } as any);
      }
      toast.success("Held — and added to Look What You've Done ✨", {
        description: "Find it in your Memory Vault",
      });
    }
    await archiveTodo(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="relative overflow-hidden rounded-[20px] bg-card"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* Journal page texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, hsl(var(--foreground)) 28px)`,
      }} />

      {/* Botanical decorations */}
      <img src={botanicalCorner} alt="" className="absolute top-2 right-2 w-14 h-14 opacity-15 pointer-events-none" loading="lazy" />
      <img src={botanicalLavender} alt="" className="absolute bottom-4 left-3 w-8 h-16 opacity-10 pointer-events-none" loading="lazy" />

      <div className="relative p-5 space-y-5">
        {/* Today's Focus */}
        <div>
          <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">✦ Today's Focus</p>
          <div className="space-y-1.5">
            {[
              { label: "eat", value: focus.eat, href: "/nutrition" },
              { label: "move", value: focus.move, href: "/movement" },
              { label: "rest", value: focus.rest, href: "/practice" },
              { label: "cycle", value: focus.cycle, href: "/cycle" },
            ].map(({ label, value, href }) => (
              <Link key={label} to={href} className="flex gap-3 items-start group hover:bg-foreground/[0.03] -mx-2 px-2 py-1.5 rounded-lg transition-colors relative">
                <span className="font-hand text-sm w-10 pt-0.5 text-primary/50">{label}</span>
                <p className="font-hand text-[15px] text-foreground/65 leading-snug flex-1 group-hover:text-foreground transition-colors border-b border-dotted border-foreground/8 pb-1">{value}</p>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all mt-1 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <DottedLine />

        {/* To-Do List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M8 12.5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="font-hand text-[10px] text-muted-foreground/40 uppercase tracking-wider">To-Do</p>
            </div>
            <button
              onClick={() => setShowInput(!showInput)}
              className="text-primary active:opacity-70 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add input */}
          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="What needs doing?"
                    className="flex-1 font-hand text-sm text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
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

          {loading ? (
            <p className="font-hand text-sm italic text-muted-foreground/50 text-center py-2">Loading...</p>
          ) : active.length === 0 && justDone.length === 0 && !showInput ? (
            <p className="font-hand text-[13px] italic text-muted-foreground/40 text-center py-2">
              Nothing on your list — what a beautiful feeling ✨
            </p>
          ) : (
            <div className="space-y-0.5">
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
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-colors"
                    />
                    <p className="flex-1 font-hand text-[14px] text-foreground leading-snug min-w-0">{todo.title}</p>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-muted-foreground/0 group-hover:text-muted-foreground/40 hover:!text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
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
                    <p className="flex-1 font-hand text-[14px] text-muted-foreground/50 line-through leading-snug min-w-0">{todo.title}</p>
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

          {justDone.length > 0 && (
            <p className="font-body text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-2">
              <Sparkles className="h-3 w-3" />
              Tap <Archive className="h-3 w-3 inline" /> to save completed tasks to your "Look What You've Done" vault
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
