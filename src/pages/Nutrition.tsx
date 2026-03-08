import { useState } from "react";
import { motion } from "framer-motion";
import PhaseBadge from "@/components/PhaseBadge";
import { getCycleInfo, getLastPeriodStart, Phase } from "@/lib/cycle-utils";
import { Loader2 } from "lucide-react";

const PHASE_PRINCIPLES: Record<Phase, string[]> = {
  menstrual: [
    "Iron-rich foods + vitamin C to aid absorption",
    "Anti-inflammatory foods — ginger, turmeric, dark leafy greens",
    "Magnesium-rich foods for cramps and mood",
  ],
  follicular: [
    "Complex low-GI carbs as estrogen rises",
    "Fermented foods to support the gut-estrogen axis",
    "Lighter eating — appetite is naturally lower",
  ],
  ovulatory: [
    "Antioxidants + folate + zinc for peak hormonal output",
    "Raw and lightly cooked vegetables",
    "Appetite at its lowest — focus on nutrient density, not quantity",
  ],
  luteal: [
    "Higher calorie needs are normal and healthy",
    "Nutrient-dense complex carbs — sweet potato, oats, legumes",
    "Magnesium + B6 for PMS. Never skip meals — progesterone needs steady glucose",
  ],
};

interface MealIdea {
  name: string;
  description: string;
  hormonal_benefit: string;
}

export default function NutritionPage() {
  const info = getCycleInfo(getLastPeriodStart());
  const principles = PHASE_PRINCIPLES[info.phase];
  const [ingredients, setIngredients] = useState("");
  const [meals, setMeals] = useState<MealIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetMeals = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError("");
    setMeals([]);

    // Mock AI response since Cloud isn't connected yet
    setTimeout(() => {
      setMeals([
        {
          name: "Golden Turmeric Bowl",
          description: `A warming bowl with ${ingredients.split(",")[0]?.trim() || "seasonal vegetables"}, turmeric, and tahini dressing over quinoa.`,
          hormonal_benefit: `Supports ${info.phase} phase with anti-inflammatory properties and complex carbohydrates.`,
        },
        {
          name: "Green Goddess Wrap",
          description: `Fresh collard wraps filled with hummus, avocado, and ${ingredients.split(",")[1]?.trim() || "mixed greens"}.`,
          hormonal_benefit: "Rich in magnesium and B vitamins to support hormonal balance.",
        },
        {
          name: "Nourish Stir-fry",
          description: `A quick stir-fry with ${ingredients.split(",")[0]?.trim() || "tofu"}, sesame, ginger, and seasonal vegetables over brown rice.`,
          hormonal_benefit: "Phytoestrogens from soy combined with blood-sugar stabilising complex carbs.",
        },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Nutrition</h1>
        <p className="text-muted-foreground mt-1">Eat for your cycle, not against it</p>
      </div>

      <PhaseBadge phase={info.phase} cycleDay={info.cycleDay} />

      {/* Phase principles */}
      <section className="card-warm p-6">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Phase Principles</h2>
        <ul className="space-y-3">
          {principles.map((p, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 text-sm text-foreground"
            >
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
              <span className="leading-relaxed">{p}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* AI Meal Ideas */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">What's in your fridge?</h2>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g., sweet potato, spinach, chickpeas, avocado..."
          className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none h-28"
        />
        <button
          onClick={handleGetMeals}
          disabled={loading || !ingredients.trim()}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Finding meals for your phase..." : "Get Meal Ideas"}
        </button>

        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm animate-pulse-gentle">Finding meals for your phase...</span>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {meals.length > 0 && (
          <div className="grid gap-4">
            {meals.map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="card-warm p-5"
              >
                <h3 className="font-display text-lg font-semibold text-foreground">{meal.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{meal.description}</p>
                <p className="text-xs text-accent mt-3 font-medium">{meal.hormonal_benefit}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
