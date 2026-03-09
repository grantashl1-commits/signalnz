import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import MealIllustration from "@/components/MealIllustration";
import { WildStar } from "@/components/BotanicalElements";
import { Phase, PHASE_SHORT, getWaterCount, setWaterCount } from "@/lib/cycle-utils";
import { Meal } from "@/data/meal-plans";
import KidsDinnerAlt from "@/components/nutrition/KidsDinnerAlt";
import { haptic } from "@/hooks/use-mobile";

const PHASE_HEX: Record<Phase, string> = {
  menstrual: "#C4526E",
  follicular: "#7D9E82",
  ovulatory: "#E8A030",
  luteal: "#9B89B4",
};

const MEAL_SHORT = ["B", "S", "L", "S", "D"];

interface TodayTabProps {
  meals: Meal[];
  phase: Phase;
  cycleDay: number;
}

export default function TodayTab({ meals, phase, cycleDay }: TodayTabProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [eaten, setEaten] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored: Record<string, boolean> = {};
    meals.forEach((m) => {
      const key = `eaten:${today}:${m.type.toLowerCase().replace(/\s/g, "-")}`;
      if (localStorage.getItem(key) === "true") stored[m.type] = true;
    });
    return stored;
  });
  const [water, setWaterState] = useState(getWaterCount());

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = (idx: number) => {
    haptic("light");
    emblaApi?.scrollTo(idx);
  };

  const markEaten = (mealType: string) => {
    haptic("medium");
    const today = new Date().toISOString().split("T")[0];
    const key = `eaten:${today}:${mealType.toLowerCase().replace(/\s/g, "-")}`;
    localStorage.setItem(key, "true");
    setEaten((prev) => ({ ...prev, [mealType]: true }));
  };

  const addWater = () => {
    haptic("light");
    const n = Math.min(water + 1, 8);
    setWaterState(n);
    setWaterCount(n);
  };

  const phaseColor = PHASE_HEX[phase];

  return (
    <div className="space-y-4">
      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-3">
        {meals.map((m, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="touch-btn flex flex-col items-center gap-1"
          >
            <div
              className="w-3 h-3 rounded-full transition-all duration-200"
              style={{
                backgroundColor: i === activeIndex ? phaseColor : "hsl(var(--border))",
                transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
              }}
            />
            <span className="font-mono text-[9px] text-muted-foreground">
              {MEAL_SHORT[i] || m.type[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Swipeable cards */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {meals.map((meal, i) => {
            const expanded = expandedMeal === meal.type;
            const isEaten = eaten[meal.type];
            const isDinner = meal.type.toLowerCase() === "dinner";
            // Extract single-line benefit.
            const shortBenefit = meal.phaseBenefit.split(".")[0] + ".";

            return (
              <div key={meal.type} className="flex-[0_0_100%] min-w-0 px-1">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className="card-warm overflow-hidden"
                >
                  {/* Image area */}
                  <div className="relative">
                    <MealIllustration
                      mealName={meal.name}
                      mealType={meal.type}
                      phase={phase}
                      height={200}
                    />
                    {meal.prepTime && (
                      <div className="absolute bottom-3 right-4">
                        <span className="font-hand text-xs bg-card/80 backdrop-blur-sm rounded-full px-3 py-1 text-muted-foreground">
                          {meal.prepTime}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold italic text-foreground leading-tight">
                      {meal.name}
                    </h3>

                    <p className="font-display text-[15px] italic mt-2 leading-relaxed" style={{ color: phaseColor }}>
                      {shortBenefit}
                    </p>

                    {/* Kids dinner alternative */}
                    {isDinner && (
                      <KidsDinnerAlt dinnerName={meal.name} phase={phase} />
                    )}

                    {/* Nutrient badges */}
                    {meal.calories && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {meal.calories && (
                          <span
                            className="rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase"
                            style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
                          >
                            {meal.calories}
                          </span>
                        )}
                        {meal.protein && (
                          <span
                            className="rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase"
                            style={{ backgroundColor: `${phaseColor}15`, color: phaseColor }}
                          >
                            {meal.protein}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expand toggle */}
                    <button
                      onClick={() => {
                        haptic("light");
                        setExpandedMeal(expanded ? null : meal.type);
                      }}
                      className="touch-btn flex items-center gap-1.5 mt-3 font-body text-xs text-muted-foreground"
                      style={{ fontWeight: 300 }}
                    >
                      {expanded ? "Show less" : "Ingredients + benefits"}
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
                          <div className="pt-3 space-y-3 border-t border-border mt-3">
                            {meal.ingredients && (
                              <div>
                                <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Ingredients</p>
                                <p className="font-body text-xs text-muted-foreground mt-1">{meal.ingredients}</p>
                              </div>
                            )}
                            <div>
                              <p className="font-hand text-sm font-bold" style={{ color: phaseColor }}>Phase benefit</p>
                              <p className="font-display text-xs italic text-muted-foreground mt-1">{meal.phaseBenefit}</p>
                            </div>
                            {(meal.calories || meal.protein) && (
                              <div className="flex gap-2">
                                {meal.calories && <span className="font-mono text-[10px]" style={{ color: phaseColor }}>{meal.calories}</span>}
                                {meal.protein && <span className="font-mono text-[10px]" style={{ color: phaseColor }}>{meal.protein}</span>}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mark as eaten */}
                    <button
                      onClick={() => !isEaten && markEaten(meal.type)}
                      disabled={isEaten}
                      className="touch-btn w-full mt-4 rounded-full py-3 min-h-[48px] font-body text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: isEaten ? phaseColor : "transparent",
                        color: isEaten ? "white" : phaseColor,
                        border: `2px solid ${phaseColor}`,
                      }}
                    >
                      {isEaten ? (
                        <>Eaten <WildStar size={14} color="white" /></>
                      ) : (
                        "Mark as eaten"
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Water tracker */}
      <div className="card-warm p-4 md:p-5">
        <p className="font-hand text-sm font-bold text-muted-foreground mb-3">Water today</p>
        <div className="flex gap-2 mb-2">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              onClick={i === water ? addWater : undefined}
              className={`touch-btn h-7 w-7 rounded-full border transition-all ${
                i < water
                  ? "border-[hsl(var(--phase-follicular))] bg-[hsl(var(--phase-follicular))]/30"
                  : "border-border"
              }`}
              style={i < water ? { backgroundColor: `${PHASE_HEX.follicular}30`, borderColor: `${PHASE_HEX.follicular}60` } : {}}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">{water}/8</span>
          <button
            onClick={addWater}
            disabled={water >= 8}
            className="touch-btn rounded-full px-3 py-1.5 min-h-[36px] font-mono text-[10px] active:opacity-70 disabled:opacity-30"
            style={{ backgroundColor: `${PHASE_HEX.follicular}15`, color: PHASE_HEX.follicular }}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
