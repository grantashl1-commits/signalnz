/**
 * Favourites: library recipes a member has cooked and loved (the heart on a
 * recipe). LibraryRecipeGrid also shows the recipes she saved with + in Saved.
 */
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import type { Recipe } from "@/data/meal-plans";
import { CATALOG_RECIPES } from "@/lib/all-recipes";
import { useSavedRecipes, type RecipeList } from "@/hooks/useSavedRecipes";
import { RecipeCard, RecipeDetailSheet } from "@/components/nutrition/DiscoverTab";

const BY_ID = new Map(CATALOG_RECIPES.map((r) => [r.id, r]));

type Lists = ReturnType<typeof useSavedRecipes>;

/** The recipes on one list, newest first, each opening the full recipe. */
export function LibraryRecipeGrid({ list, lists }: { list: RecipeList; lists: Lists }) {
  const [open, setOpen] = useState<Recipe | null>(null);
  const recipes = useMemo(
    () => lists.ids(list).reverse().map((id) => BY_ID.get(id)).filter((r): r is Recipe => !!r),
    [lists.ids, list],
  );
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {recipes.map((recipe, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={lists.has("saved", recipe.id)}
            onToggleSave={() => (list === "favourite" ? lists.toggleFavourite(recipe.id) : lists.toggleSaved(recipe.id))}
            favourite={list === "favourite"}
            onSelect={() => setOpen(recipe)}
            index={i}
          />
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <RecipeDetailSheet
            recipe={open}
            isSaved={lists.has("saved", open.id)}
            onToggleSave={() => lists.toggleSaved(open.id)}
            isFavourite={lists.has("favourite", open.id)}
            onToggleFavourite={() => lists.toggleFavourite(open.id)}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function FavouritesTab() {
  const lists = useSavedRecipes();
  const count = lists.ids("favourite").filter((id) => BY_ID.has(id)).length;

  if (lists.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
          <Heart className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-base italic text-foreground">Your tried and tested recipes</p>
          <p className="font-body text-xs text-muted-foreground">
            Cooked something and loved it? Open the recipe and tap the heart, and it lives here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-base italic text-foreground">{count} favourite{count !== 1 ? "s" : ""}</p>
        <p className="font-body text-[10px] text-muted-foreground mt-0.5">Tried, tested and loved</p>
      </div>
      <LibraryRecipeGrid list="favourite" lists={lists} />
    </div>
  );
}
