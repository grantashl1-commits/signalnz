import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * A member's two lists of library recipes, both kept in user_saved_recipes:
 *  - saved: recipes she means to try (the + on a recipe tile, shown in Saved)
 *  - favourite: recipes she has cooked and loved (the heart on a recipe, shown in Favourites)
 * Favourites are stored under a "favourite:" prefix on recipe_id, so the existing
 * table and its own-rows rules serve both lists.
 */
export type RecipeList = "saved" | "favourite";

const FAVOURITE = "favourite:";
const key = (list: RecipeList, recipeId: string) => (list === "favourite" ? FAVOURITE + recipeId : recipeId);

export function useSavedRecipes() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setKeys(new Set()); setLoading(false); return; }
    let live = true;
    setLoading(true);
    supabase
      .from("user_saved_recipes")
      .select("recipe_id")
      .eq("user_id", user.id)
      .order("saved_at")
      .then(({ data }) => {
        if (!live) return;
        if (data) setKeys(new Set(data.map((r) => r.recipe_id)));
        setLoading(false);
      });
    return () => { live = false; };
  }, [user?.id]);

  const has = useCallback((list: RecipeList, recipeId: string) => keys.has(key(list, recipeId)), [keys]);

  /** Adds or removes the recipe; resolves to whether it is now on the list, or null if nothing changed. */
  const toggle = useCallback(async (list: RecipeList, recipeId: string): Promise<boolean | null> => {
    const k = key(list, recipeId);
    const adding = !keys.has(k);
    if (!user) { toast("Sign in to keep recipes."); return null; }
    const flip = (add: boolean) => setKeys((prev) => {
      const next = new Set(prev);
      if (add) next.add(k); else next.delete(k);
      return next;
    });
    flip(adding);
    const { error } = adding
      ? await supabase.from("user_saved_recipes").insert({ user_id: user.id, recipe_id: k })
      : await supabase.from("user_saved_recipes").delete().eq("user_id", user.id).eq("recipe_id", k);
    // 23505: it was already there (a double tap), which is the state we wanted.
    if (error && error.code !== "23505") {
      flip(!adding);
      toast.error("That didn't save. Try again in a moment.");
      return null;
    }
    return adding;
  }, [keys, user]);

  /** Recipe ids on a list, newest last. */
  const ids = useCallback((list: RecipeList) =>
    [...keys]
      .filter((k) => k.startsWith(FAVOURITE) === (list === "favourite"))
      .map((k) => (list === "favourite" ? k.slice(FAVOURITE.length) : k)),
  [keys]);

  const toggleSaved = useCallback(async (recipeId: string) => {
    const now = await toggle("saved", recipeId);
    if (now !== null) toast(now ? "Saved. It's waiting in your Saved tab." : "Removed from Saved.");
  }, [toggle]);

  const toggleFavourite = useCallback(async (recipeId: string) => {
    const now = await toggle("favourite", recipeId);
    if (now !== null) toast(now ? "Added to Favourites." : "Removed from Favourites.");
  }, [toggle]);

  return { has, toggle, ids, loading, toggleSaved, toggleFavourite };
}
