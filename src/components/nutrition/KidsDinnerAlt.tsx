import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Phase } from "@/lib/cycle-utils";
import { findKidsRecipe, type KidsRecipe } from "@/data/kids-recipes";
import { getKidAlternative } from "@/data/kids-alternatives";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#5C4A9E",
  ovulatory: "#C47A8A",
  luteal: "#9B89B4",
};

interface KidsDinnerAltProps {
  dinnerName: string;
  phase: Phase;
}

export default function KidsDinnerAlt({ dinnerName, phase }: KidsDinnerAltProps) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const phaseColor = PHASE_HEX[phase];

  // Find 2 protein-matched kids recipes
  const option1 = findKidsRecipe(dinnerName, "dinner", [], "", [], 0);
  const option2 = findKidsRecipe(dinnerName, "dinner", [], "", option1 ? [option1.id] : [], 1);
  const fallbackTip = getKidAlternative(dinnerName);

  const hasOptions = option1 || option2;

  return (
    <div className="mt-2">
      <button
        onClick={() => {
          haptic("light");
          setExpanded(!expanded);
        }}
        className="touch-btn flex items-center gap-1 font-body text-[13px] italic text-muted-foreground"
        style={{ fontWeight: 300 }}
      >
        Kids won't eat this? →
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {hasOptions ? (
                <>
                  <p className="font-body text-[10px] text-muted-foreground italic">
                    Let them choose — two protein-matched options:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[option1, option2].filter(Boolean).map((opt) => {
                      const recipe = opt as KidsRecipe;
                      const isSelected = selected === recipe.id;
                      return (
                        <button
                          key={recipe.id}
                          onClick={() => {
                            haptic("light");
                            setSelected(isSelected ? null : recipe.id);
                          }}
                          className="rounded-xl p-3 text-left transition-all"
                          style={{
                            borderLeft: `3px solid ${phaseColor}`,
                            backgroundColor: isSelected ? `${phaseColor}15` : `${phaseColor}08`,
                            outline: isSelected ? `2px solid ${phaseColor}` : "none",
                          }}
                        >
                          <p className="font-hand text-xs font-bold" style={{ color: phaseColor }}>
                            {recipe.name}
                          </p>
                          <p className="font-body text-[10px] text-muted-foreground mt-1">
                            {recipe.prepTime} · {recipe.serves} serves
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 pt-2 border-t border-border"
                            >
                              <p className="font-body text-[10px] text-muted-foreground mb-1 font-medium">Ingredients:</p>
                              <ul className="space-y-0.5">
                              {recipe.ingredients.map((ing, i) => (
                                  <li key={i} className="font-body text-[9px] text-muted-foreground">• {ing}</li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-body text-[9px] text-muted-foreground/60 italic">
                    Giving children 2 choices builds autonomy and reduces mealtime battles — research-backed from Adele Faber & Sarah Ockwell-Smith.
                  </p>
                </>
              ) : (
                <div
                  className="rounded-xl p-3"
                  style={{
                    borderLeft: `3px solid ${phaseColor}`,
                    backgroundColor: `${phaseColor}08`,
                  }}
                >
                  <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>
                    Kid-friendly version
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                    {fallbackTip}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
