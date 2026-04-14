import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, ChevronDown, ChevronUp, ShieldCheck, Info, Sparkles, Plus, Check } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCycle } from "@/contexts/CycleContext";
import { HABIT_LIBRARY, type LibraryHabit } from "@/data/habit-library";
import { haptic } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Get all supplement habits from the library
const ALL_SUPPLEMENTS = HABIT_LIBRARY.filter(h => h.category === "supplements");

interface RecommendationReason {
  label: string;
  detail: string;
}

interface SupplementRecommendation {
  supplement: LibraryHabit;
  priority: "essential" | "recommended" | "consider";
  reasons: RecommendationReason[];
  phaseNote?: string;
}

function getRecommendations(
  phase: string,
  profile: {
    dietaryPreferences?: string[] | null;
    dietaryDislikes?: string[] | null;
    fitnessLevel?: string | null;
    weightKg?: number | null;
    heightCm?: number | null;
    dateOfBirth?: string | null;
    cycleMode?: string;
  }
): SupplementRecommendation[] {
  const results: SupplementRecommendation[] = [];

  const isVegan = profile.dietaryPreferences?.some(p =>
    ["vegan", "plant-based"].includes(p.toLowerCase())
  );
  const isVegetarian = profile.dietaryPreferences?.some(p =>
    ["vegetarian"].includes(p.toLowerCase())
  );
  const isDairyFree = profile.dietaryDislikes?.some(d =>
    ["dairy", "milk", "lactose"].includes(d.toLowerCase())
  );
  const isGlutenFree = profile.dietaryDislikes?.some(d =>
    ["gluten", "wheat"].includes(d.toLowerCase())
  );
  const isPerimenopause = profile.cycleMode === "perimenopause";
  const isPostMenopause = profile.cycleMode === "post-menopause";
  const isActive = profile.fitnessLevel && ["intermediate", "advanced"].includes(profile.fitnessLevel);

  // Age calculation
  let age: number | null = null;
  if (profile.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  for (const supp of ALL_SUPPLEMENTS) {
    const reasons: RecommendationReason[] = [];
    let priority: "essential" | "recommended" | "consider" = "consider";

    // --- Magnesium ---
    if (supp.id === "lib-magnesium") {
      reasons.push({ label: "Foundation", detail: "Involved in 600+ enzymatic reactions. Most NZ women are deficient." });
      if (phase === "luteal" || phase === "menstrual") {
        reasons.push({ label: "Phase-specific", detail: "Progesterone depletes magnesium — increase during luteal & menstrual." });
      }
      if (isPerimenopause) reasons.push({ label: "Perimenopause", detail: "Supports sleep, mood, and bone density during transition." });
      priority = "essential";
    }

    // --- Vitamin D3 ---
    if (supp.id === "lib-vitamin-d3") {
      reasons.push({ label: "NZ-specific", detail: "~32% of NZ adults are deficient. Essential May–August." });
      if (isDairyFree) reasons.push({ label: "Dairy-free", detail: "Without fortified dairy, supplementation is critical." });
      priority = "essential";
    }

    // --- Omega-3 ---
    if (supp.id === "lib-omega-3") {
      if (isVegan || isVegetarian) {
        reasons.push({ label: "Plant-based diet", detail: "Algae-based EPA+DHA needed without oily fish." });
        priority = "essential";
      } else {
        reasons.push({ label: "Anti-inflammatory", detail: "Supports brain, heart, and hormonal health." });
        priority = "recommended";
      }
      if (phase === "menstrual") reasons.push({ label: "Phase-specific", detail: "Reduces prostaglandin-driven inflammation." });
    }

    // --- Iron ---
    if (supp.id === "lib-iron") {
      if (isVegan || isVegetarian) {
        reasons.push({ label: "Plant-based diet", detail: "Non-heme iron is less bioavailable. Consider supplementation." });
        priority = "recommended";
      }
      if (phase === "menstrual") {
        reasons.push({ label: "Phase-specific", detail: "Iron lost through menstrual blood — supplement during your period." });
        priority = "recommended";
      }
      if (!reasons.length) {
        reasons.push({ label: "Test first", detail: "Only supplement if blood test confirms low ferritin." });
      }
    }

    // --- B Complex ---
    if (supp.id === "lib-b-complex") {
      reasons.push({ label: "Energy & mood", detail: "Essential co-factors for energy metabolism and PMS support." });
      if (isVegan) reasons.push({ label: "Plant-based", detail: "B12 is only found in animal products — supplementation essential." });
      priority = isVegan ? "essential" : "recommended";
    }

    // --- Zinc ---
    if (supp.id === "lib-zinc") {
      reasons.push({ label: "Immune & skin", detail: "Supports 300+ enzymatic reactions including thyroid conversion." });
      if (phase === "follicular") reasons.push({ label: "Phase-specific", detail: "Supports oestrogen metabolism and collagen synthesis." });
      priority = "recommended";
    }

    // --- Probiotics ---
    if (supp.id === "lib-probiotics") {
      reasons.push({ label: "Gut-hormone axis", detail: "The estrobolome regulates oestrogen levels via gut bacteria." });
      priority = "recommended";
    }

    // --- Ashwagandha ---
    if (supp.id === "lib-ashwagandha") {
      if (isActive) reasons.push({ label: "Active lifestyle", detail: "Reduces exercise-induced cortisol and supports recovery." });
      if (phase === "luteal") reasons.push({ label: "Phase-specific", detail: "Most beneficial when cortisol is highest — late luteal." });
      if (isPerimenopause) reasons.push({ label: "Perimenopause", detail: "Supports thyroid function and stress resilience." });
      if (reasons.length) priority = "recommended";
      else {
        reasons.push({ label: "Stress support", detail: "Reduces cortisol by 30% in clinical trials." });
      }
    }

    // --- Creatine ---
    if (supp.id === "lib-creatine") {
      if (isActive) {
        reasons.push({ label: "Training support", detail: "Increases strength output by 5–10%. Strong evidence for women." });
        priority = "recommended";
      }
      if (isPerimenopause || isPostMenopause) {
        reasons.push({ label: "Perimenopause+", detail: "Supports muscle, cognitive function, and bone density." });
        priority = "recommended";
      }
      if (!reasons.length) {
        reasons.push({ label: "Strength & brain", detail: "One of the most evidence-based supplements for women." });
      }
    }

    // --- Collagen ---
    if (supp.id === "lib-collagen") {
      if (age && age >= 30) {
        reasons.push({ label: "Age 30+", detail: "Collagen production declines ~1% per year from age 25." });
        priority = "recommended";
      }
      if (phase === "follicular") reasons.push({ label: "Phase-specific", detail: "Collagen synthesis peaks with rising oestrogen." });
      if (!reasons.length) reasons.push({ label: "Skin & joints", detail: "Supports skin elasticity, joint health, and gut lining." });
    }

    // --- CoQ10 ---
    if (supp.id === "lib-coq10") {
      if (age && age >= 35) {
        reasons.push({ label: "Age 35+", detail: "CoQ10 levels decline with age. Supports mitochondrial energy." });
        priority = "consider";
      } else {
        reasons.push({ label: "Cellular energy", detail: "Supports ATP production and heart health." });
      }
    }

    // --- Iodine ---
    if (supp.id === "lib-iodine") {
      reasons.push({ label: "NZ-specific", detail: "NZ soils are iodine-depleted. Essential for thyroid function." });
      if (isGlutenFree) reasons.push({ label: "Gluten-free", detail: "Without fortified bread, iodine intake drops significantly." });
      priority = isGlutenFree ? "essential" : "recommended";
    }

    // --- Vitamin C ---
    if (supp.id === "lib-vitamin-c") {
      reasons.push({ label: "Foundation", detail: "Enhances iron absorption, collagen synthesis, and immune function." });
      priority = "consider";
    }

    // --- Folate ---
    if (supp.id === "lib-folate") {
      reasons.push({ label: "Women's health", detail: "Essential for DNA synthesis and cell division." });
      priority = "recommended";
    }

    // --- Greens Powder ---
    if (supp.id === "lib-greens-powder") {
      reasons.push({ label: "Gap filler", detail: "Concentrated phytonutrients for when diet isn't perfect." });
    }

    if (reasons.length === 0) continue;

    // Phase note
    const phaseNote = supp.rdi?.phaseNotes?.[phase as keyof typeof supp.rdi.phaseNotes];

    results.push({ supplement: supp, priority, reasons, phaseNote: phaseNote || undefined });
  }

  // Sort: essential first, then recommended, then consider
  const order = { essential: 0, recommended: 1, consider: 2 };
  results.sort((a, b) => order[a.priority] - order[b.priority]);

  return results;
}

const PRIORITY_BADGE = {
  essential: { label: "Essential", bg: "bg-primary/15", text: "text-primary" },
  recommended: { label: "Recommended", bg: "bg-accent/20", text: "text-accent-foreground" },
  consider: { label: "Consider", bg: "bg-secondary", text: "text-muted-foreground" },
};

// Wellness Stack localStorage helpers
function getWellnessStack(): string[] {
  try {
    const stored = localStorage.getItem("signal_wellness_stack");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function toggleWellnessStackItem(suppId: string): boolean {
  const stack = getWellnessStack();
  const idx = stack.indexOf(suppId);
  if (idx >= 0) {
    stack.splice(idx, 1);
    localStorage.setItem("signal_wellness_stack", JSON.stringify(stack));
    return false;
  } else {
    stack.push(suppId);
    localStorage.setItem("signal_wellness_stack", JSON.stringify(stack));
    return true;
  }
}

export function getWellnessStackSupplements(): LibraryHabit[] {
  const stack = getWellnessStack();
  return ALL_SUPPLEMENTS.filter(s => stack.includes(s.id));
}

export default function SupplementRecommender() {
  const { currentPhase } = useCycle();
  const profile = useProfile();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>(getWellnessStack);

  const recommendations = useMemo(() => {
    return getRecommendations(currentPhase, {
      dietaryPreferences: profile.dietaryPreferences,
      dietaryDislikes: profile.dietaryDislikes,
      fitnessLevel: profile.fitnessLevel,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      dateOfBirth: profile.dateOfBirth,
      cycleMode: profile.cycleMode,
    });
  }, [currentPhase, profile]);

  const handleToggleStack = useCallback((suppId: string, suppName: string) => {
    haptic("medium");
    const added = toggleWellnessStackItem(suppId);
    setStack(getWellnessStack());
    if (added) {
      toast.success(`${suppName} added to your Wellness Stack`, { description: "View in Habits → Supplements" });
    } else {
      toast(`${suppName} removed from your Wellness Stack`);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-body text-xs uppercase tracking-widest font-medium" style={{ color: 'hsl(var(--label-color))' }}>
          Personalised for you
        </h3>
      </div>

      <p className="font-body text-xs text-muted-foreground leading-relaxed">
        Based on your profile, dietary preferences, cycle phase ({currentPhase}), and NZ availability.
      </p>

      <div className="space-y-2">
        {recommendations.map((rec) => {
          const badge = PRIORITY_BADGE[rec.priority];
          const isExpanded = expandedId === rec.supplement.id;

          return (
            <motion.div
              key={rec.supplement.id}
              layout
              className="rounded-[16px] bg-card overflow-hidden"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <button
                onClick={() => {
                  haptic("light");
                  setExpandedId(isExpanded ? null : rec.supplement.id);
                }}
                className="w-full flex items-center gap-3 p-3.5 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-body text-sm font-medium text-foreground truncate">{rec.supplement.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="font-body text-[11px] text-muted-foreground line-clamp-1">
                    {rec.reasons[0]?.detail}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 space-y-3">
                      {/* Reasons */}
                      <div className="space-y-1.5">
                        {rec.reasons.map((r, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="font-body text-[10px] uppercase tracking-wide text-primary font-medium w-20 flex-shrink-0 pt-0.5">
                              {r.label}
                            </span>
                            <p className="font-body text-xs text-foreground/70 leading-relaxed flex-1">{r.detail}</p>
                          </div>
                        ))}
                      </div>

                      {/* Phase note */}
                      {rec.phaseNote && (
                        <div className="rounded-xl bg-primary/5 p-3">
                          <p className="font-body text-[10px] uppercase tracking-wide text-primary font-medium mb-1">
                            {currentPhase} phase note
                          </p>
                          <p className="font-body text-xs text-foreground/70 leading-relaxed">{rec.phaseNote}</p>
                        </div>
                      )}

                      {/* Dosage & brands */}
                      {rec.supplement.rdi && (
                        <div className="rounded-xl bg-secondary/60 p-3 space-y-1">
                          <p className="font-body text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Dosage</p>
                          <p className="font-body text-xs text-foreground/70">
                            {rec.supplement.rdi.amount} · {rec.supplement.rdi.timing}
                          </p>
                          {rec.supplement.rdi.foodSources.length > 0 && (
                            <p className="font-body text-[11px] text-muted-foreground">
                              Food sources: {rec.supplement.rdi.foodSources.join(", ")}
                            </p>
                          )}
                        </div>
                      )}

                      {rec.supplement.nzBrands && (
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                            <span className="font-medium text-foreground/60">NZ brands:</span> {rec.supplement.nzBrands}
                          </p>
                        </div>
                      )}

                      {rec.supplement.note && (
                        <div className="flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="font-body text-[11px] text-muted-foreground leading-relaxed italic">{rec.supplement.note}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="font-body text-[10px] text-muted-foreground/60 text-center italic pt-2">
        Always consult your doctor or pharmacist before starting supplements.
      </p>
    </div>
  );
}
