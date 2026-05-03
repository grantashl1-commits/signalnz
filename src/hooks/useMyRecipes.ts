import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserRecipe {
  id: string;
  user_id: string;
  title: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  estimated_time: number | null;
  rating: number | null;
  image_url: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRecipeInput = Omit<UserRecipe, "id" | "user_id" | "created_at" | "updated_at">;

export function useMyRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setRecipes([]); setLoading(false); return; }
    const { data } = await supabase
      .from("user_recipes" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRecipes(((data as unknown) as UserRecipe[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const addRecipe = useCallback(async (input: UserRecipeInput): Promise<UserRecipe | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("user_recipes" as any)
      .insert({ ...input, user_id: user.id } as any)
      .select()
      .single();
    if (error) throw error;
    await fetch();
    return data as UserRecipe;
  }, [user, fetch]);

  const updateRecipe = useCallback(async (id: string, input: Partial<UserRecipeInput>): Promise<void> => {
    if (!user) return;
    const { error } = await supabase
      .from("user_recipes" as any)
      .update(input as any)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    await fetch();
  }, [user, fetch]);

  const deleteRecipe = useCallback(async (id: string): Promise<void> => {
    if (!user) return;
    await supabase
      .from("user_recipes" as any)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    await fetch();
  }, [user, fetch]);

  const setRating = useCallback(async (id: string, rating: number): Promise<void> => {
    await updateRecipe(id, { rating });
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, rating } : r));
  }, [updateRecipe]);

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, setRating, refetch: fetch };
}
