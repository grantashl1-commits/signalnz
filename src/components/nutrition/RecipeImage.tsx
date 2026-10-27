/**
 * Unified recipe image component.
 * Shows the recipe's own illustration, else a drawing of the same kind of dish,
 * else (or if the file fails to load) a quiet placeholder rather than another dish.
 */
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { getRecipeIllustration } from "@/lib/category-illustrations";

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
  const fallback = getRecipeIllustration(recipeName, recipeId);
  const [failed, setFailed] = useState<string[]>([]);
  const src = [recipeImage, fallback].find((s): s is string => !!s && !failed.includes(s));
  const onError = () => src && setFailed((f) => [...f, src]);

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

  const placeholder = (size: string) => (
    <span
      role="img"
      aria-label={recipeName}
      className={`flex items-center justify-center rounded-full bg-secondary/40 text-muted-foreground/60 ${size}`}
    >
      <UtensilsCrossed className="h-1/2 w-1/2" strokeWidth={1.25} />
    </span>
  );

  if (variant === "thumb") {
    return src ? (
      <img
        src={src}
        alt={recipeName}
        onError={onError}
        className={`rounded-lg object-contain bg-secondary/20 flex-shrink-0 ${sizeClasses.thumb} ${className}`}
        loading="lazy"
      />
    ) : (
      <span className={`flex-shrink-0 ${className}`}>{placeholder(sizeClasses.thumb)}</span>
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
      {src ? (
        <img
          src={src}
          alt={recipeName}
          onError={onError}
          className={`${sizeClasses[variant]} object-contain`}
          loading="lazy"
        />
      ) : (
        placeholder(variant === "detail" ? "h-[104px] w-[104px]" : "h-[60px] w-[60px]")
      )}
    </div>
  );
}
