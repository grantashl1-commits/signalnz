import { Phase } from "@/lib/cycle-utils";

export interface NutritionInsight {
  text: string;
  source?: string;
  phase?: Phase | "all";
  cycleMode?: string;
  exerciseGoal?: string;
}

export const PHASE_INSIGHTS: Record<Phase, NutritionInsight[]> = {
  menstrual: [
    { text: "Iron-rich foods replenish what's lost this week. Red meat, lentils, spinach, and pumpkin seeds are your best sources.", phase: "menstrual" },
    { text: "Magnesium reduces cramping and supports sleep. Dark chocolate, leafy greens, and almonds are the best sources.", source: "Sims", phase: "menstrual" },
    { text: "Your body is doing real work this week. Eating enough is part of the recovery.", phase: "menstrual" },
  ],
  follicular: [
    { text: "Oestrogen supports muscle protein synthesis this week — it's a great time to hit your protein target.", source: "Sims", phase: "follicular" },
    { text: "Your insulin sensitivity is at its best in the follicular phase — lighter carbs work well right now.", source: "Inchauspé", phase: "follicular" },
    { text: "Energy is building — this is the ideal phase to try new recipes and expand your food variety.", phase: "follicular" },
  ],
  ovulatory: [
    { text: "Eating vegetables before carbs reduces your glucose spike by up to 75% — try it at your next meal.", source: "Inchauspé", phase: "ovulatory" },
    { text: "Your appetite may dip slightly this week — oestrogen briefly suppresses hunger. Eat anyway.", source: "Sims", phase: "ovulatory" },
    { text: "Fibre feeds the gut bacteria that metabolise oestrogen. Aim for 30g of fibre today.", source: "Bulsiewicz", phase: "ovulatory" },
  ],
  luteal: [
    { text: "Progesterone increases protein breakdown — your body genuinely needs more food this week. This is biology, not a lack of willpower.", source: "Sims", phase: "luteal" },
    { text: "Luteal cravings are real and hormonal. Prioritise protein and complex carbs — restriction makes symptoms worse.", phase: "luteal" },
    { text: "Magnesium glycinate before bed supports PMS symptoms and sleep quality this phase.", source: "Sims", phase: "luteal" },
  ],
};

export const PERIMENOPAUSE_INSIGHTS: NutritionInsight[] = [
  { text: "30g protein per meal triggers muscle protein synthesis in perimenopause. One egg isn't enough — pair it with Greek yoghurt, cottage cheese, or chicken.", source: "Sims", cycleMode: "perimenopause" },
  { text: "Calcium needs increase in perimenopause. Dairy, tinned salmon, edamame, and almonds all count.", source: "Haver", cycleMode: "perimenopause" },
  { text: "Phytoestrogens — found in edamame, flaxseed, and tofu — may support hormonal balance in perimenopause.", source: "Haver", cycleMode: "perimenopause" },
];

export const EXERCISE_GOAL_INSIGHTS: Record<string, NutritionInsight> = {
  muscle_building: { text: "Leucine is the amino acid that triggers muscle protein synthesis. Chicken, salmon, eggs, and Greek yoghurt are your highest sources.", source: "Lyon", exerciseGoal: "muscle_building" },
  hiit_performance: { text: "On high-intensity days your body needs carbohydrates — skipping them impairs performance and recovery.", source: "Clark", exerciseGoal: "hiit_performance" },
  nervous_system: { text: "Omega-3 fatty acids support nervous system function and reduce inflammation. Aim for oily fish 2–3 times this week.", exerciseGoal: "nervous_system" },
  strength_power: { text: "Creatine (3-5g/day) has strong evidence for female strength performance — discuss with your GP.", source: "Sims", exerciseGoal: "strength_power" },
  fat_loss_cardio: { text: "Protein keeps you full for longer and preserves lean muscle during a deficit. Don't skip it at any meal.", source: "Lyon", exerciseGoal: "fat_loss_cardio" },
};

export const SUPPLEMENT_GUIDE: Record<string, { name: string; reason: string }[]> = {
  menstrual: [
    { name: "Magnesium glycinate", reason: "Reduces cramping and supports sleep quality" },
    { name: "Iron", reason: "Replenishes stores lost during bleeding (if heavy periods)" },
    { name: "Omega-3", reason: "Anti-inflammatory — reduces prostaglandin-driven pain" },
  ],
  follicular: [
    { name: "Vitamin D", reason: "Supports immune function and bone health" },
    { name: "B vitamins (B12, folate)", reason: "Supports energy metabolism and cell growth" },
    { name: "Zinc", reason: "Supports follicular development and immune function" },
  ],
  ovulatory: [
    { name: "No specific supplements", reason: "Body is at peak — focus on whole-food nutrition" },
  ],
  luteal: [
    { name: "Magnesium glycinate", reason: "Mood, sleep, and cramp support" },
    { name: "Vitamin B6", reason: "May reduce PMS symptoms" },
    { name: "Calcium + Vitamin D", reason: "Supports mood and reduces PMS" },
  ],
  perimenopause: [
    { name: "Creatine (3-5g/day)", reason: "Evidence for women's muscle and cognitive health" },
    { name: "Vitamin D3 + K2", reason: "Bone density support as oestrogen declines" },
    { name: "Magnesium glycinate", reason: "Sleep, mood, and muscle recovery" },
    { name: "Omega-3 (EPA/DHA)", reason: "Anti-inflammatory and cardiovascular support" },
  ],
};

export function getTodayInsight(phase: Phase, cycleMode: string, goalSlug?: string): NutritionInsight {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  // Build pool
  const pool: NutritionInsight[] = [...PHASE_INSIGHTS[phase]];
  if (cycleMode === "perimenopause" || cycleMode === "post_menopause") {
    pool.push(...PERIMENOPAUSE_INSIGHTS);
  }
  if (goalSlug && EXERCISE_GOAL_INSIGHTS[goalSlug]) {
    pool.push(EXERCISE_GOAL_INSIGHTS[goalSlug]);
  }

  return pool[dayOfYear % pool.length];
}
