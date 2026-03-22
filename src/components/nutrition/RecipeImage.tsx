/**
 * Unified recipe image component.
 * Shows the recipe's own illustration if available,
 * otherwise falls back to a category-matched hand-drawn PNG.
 */
import { getCategoryIllustration } from "@/lib/category-illustrations";

interface RecipeImageProps {
  recipeName: string;
  recipeImage?: string;
  height?: number;
  className?: string;
  /** Use "card" for grid cards, "detail" for expanded views */
  variant?: "card" | "detail" | "thumb";
}

export default function RecipeImage({
  recipeName,
  recipeImage,
  height = 100,
  className = "",
  variant = "card",
}: RecipeImageProps) {
  const src = recipeImage || getCategoryIllustration(recipeName);

  const sizeClasses = {
    card: "h-[90px] w-auto",
    detail: "h-[160px] w-auto",
    thumb: "h-12 w-12",
  };

  if (variant === "thumb") {
    return (
      <img
        src={src}
        alt={recipeName}
        className={`rounded-lg object-contain bg-secondary/20 flex-shrink-0 ${sizeClasses.thumb} ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`w-full flex items-center justify-center bg-secondary/30 ${
        variant === "detail" ? "rounded-t-[20px]" : "rounded-t-[16px]"
      } ${className}`}
      style={{ height }}
    >
      <img
        src={src}
        alt={recipeName}
        className={`${sizeClasses[variant]} object-contain`}
        loading="lazy"
      />
    </div>
  );
}
