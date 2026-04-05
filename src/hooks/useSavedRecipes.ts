import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSavedRecipes() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("user_saved_recipes")
        .select("recipe_id")
        .eq("user_id", user.id);
      if (data) setSavedIds(new Set(data.map(r => r.recipe_id)));
      setLoading(false);
    };
    load();
  }, []);

  const toggleSave = useCallback(async (recipeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isSaved = savedIds.has(recipeId);
    if (isSaved) {
      await supabase
        .from("user_saved_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
      setSavedIds(prev => { const next = new Set(prev); next.delete(recipeId); return next; });
    } else {
      await supabase
        .from("user_saved_recipes")
        .insert({ user_id: user.id, recipe_id: recipeId });
      setSavedIds(prev => new Set(prev).add(recipeId));
    }
  }, [savedIds]);

  const isSaved = useCallback((recipeId: string) => savedIds.has(recipeId), [savedIds]);

  return { savedIds, toggleSave, isSaved, loading };
}
