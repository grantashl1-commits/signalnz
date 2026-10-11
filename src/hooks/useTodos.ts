import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  archived: boolean;
  sort_order: number;
  created_at: string;
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user) { setTodos([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("completed", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) { toast.error("Could not load your tasks. Please retry."); setLoading(false); return; }
    setTodos((data as Todo[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const addTodo = useCallback(async (title: string) => {
    if (!user || !title.trim()) return;
    const { error } = await supabase.from("todos").insert({ user_id: user.id, title: title.trim() } as any);
    if (error) { toast.error("Your task could not be saved. Please retry."); return; }
    await fetchTodos();
  }, [user, fetchTodos]);

  const toggleTodo = useCallback(async (id: string, completed: boolean) => {
    if (!user) return;
    const { error } = await supabase.from("todos").update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as any).eq("id", id).eq("user_id", user.id);
    if (error) { toast.error("Your task could not be saved. Please retry."); return; }
    await fetchTodos();
  }, [user, fetchTodos]);

  const archiveTodo = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("todos").update({ archived: true } as any).eq("id", id).eq("user_id", user.id);
    if (error) { toast.error("Your task could not be saved. Please retry."); return; }
    await fetchTodos();
  }, [user, fetchTodos]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id);
    if (error) { toast.error("Your task could not be saved. Please retry."); return; }
    await fetchTodos();
  }, [user, fetchTodos]);

  return { todos, loading, addTodo, toggleTodo, archiveTodo, deleteTodo };
}
