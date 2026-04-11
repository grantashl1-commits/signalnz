/**
 * Unified recipe image component.
 * Shows the recipe's own illustration if available,
 * otherwise falls back to a category-matched hand-drawn PNG.
 */
import { getCategoryIllustration } from "@/lib/category-illustrations";

interface RecipeImageProps {
  recipeName: string;
  recipeId?: string;
  recipeImage?: string;
  height?: number;
  className?: string;
  /** Use "card" for grid cards, "detail" for expanded views */
  variant?: "card" | "detail" | "thumb";
}

export default function RecipeImage({
  recipeName,
  recipeId,
  recipeImage,
  height = 100,
  className = "",
  variant = "card",
}: RecipeImageProps) {
  const src = recipeImage || getCategoryIllustration(recipeName, recipeId);

  const sizeClasses = {
    card: "h-[72px] w-auto max-w-[72px]",
    detail: "h-[128px] w-auto max-w-[128px]",
    thumb: "h-12 w-12",
  };

  const containerHeight = {
    card: Math.round(height * 0.8),
    detail: Math.round(height * 0.8),
    thumb: height,
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
      className={`w-full flex items-center justify-center ${
        variant === "detail" ? "rounded-t-[20px]" : "rounded-t-[16px]"
      } ${className}`}
      style={{
        height: containerHeight[variant],
        background: 'transparent',
      }}
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
