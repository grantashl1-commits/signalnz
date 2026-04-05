import type { HabitCategory } from "@/data/self-care-rituals";
import type { Phase } from "@/lib/cycle-utils";

export type HabitTiming = "morning" | "afternoon" | "evening" | "anytime";

export interface SupplementRDI {
  amount: string;
  unit: string;
  nzRdi: string;
  upperLimit?: string;
  timing: string;
  foodSources: string[];
  phaseNotes?: Partial<Record<Phase, string>>;
}

export interface HabitEducation {
  modern: string;
  tcm?: string;
  ayurveda?: string;
  beingHuman?: string;
}

export interface LibraryHabit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  evidenceNote: string;
  icon: string;
  category: HabitCategory | "foundations";
  timing?: HabitTiming;
  womenBadge?: boolean;
  note?: string;
  nzBrands?: string;
  rdi?: SupplementRDI;
  education?: HabitEducation;
}

export const SUPPLEMENT_DISCLAIMER = "Always consult your doctor or pharmacist before starting supplements.";

export const HABIT_LIBRARY: LibraryHabit[] = [
  // ── Supplements ──
  {
    id: "lib-magnesium", name: "Magnesium Glycinate",
    description: "200–300mg elemental magnesium in the evening for sleep, PMS, muscle tension, and mood.",
    frequency: "Evening", evidenceNote: "Magnesium supports sleep quality, muscle relaxation, and menstrual symptom relief.",
    icon: "capsule", category: "supplements", timing: "evening", womenBadge: true,
    note: "Check label for \"elemental magnesium\" — not compound weight.",
    nzBrands: "Ethical Nutrients Mega Magnesium, Good Health Magnesium Sleep, Clinicians Magnesium",
    rdi: {
      amount: "310–320mg", unit: "mg", nzRdi: "310–320mg/day women; 350–400mg/day perimenopause",
      upperLimit: "350mg/day from supplements", timing: "Evening — supports sleep and muscle recovery",
      foodSources: ["Pumpkin seeds", "Dark chocolate", "Almonds", "Spinach", "Black beans"],
      phaseNotes: {
        luteal: "Increase to 400mg — progesterone depletes magnesium rapidly. Reduces PMS, cramping, and sleep disruption.",
        menstrual: "Continue 400mg through day 1–5 for cramping and sleep.",
        follicular: "Standard 310mg — body retains magnesium more efficiently with rising oestrogen.",
        ovulatory: "Standard 310mg — body retains magnesium more efficiently with rising oestrogen.",
      },
    },
    education: {
      modern: "Magnesium is involved in over 600 enzymatic reactions. Deficiency is linked to insomnia, anxiety, muscle cramps, and PMS.",
      tcm: "Magnesium's calming effect mirrors the TCM concept of nourishing Liver Yin — reducing tension, irritability, and restlessness.",
      ayurveda: "Magnesium-rich foods and supplements are considered Vata-pacifying — grounding, calming, and supportive of sleep.",
      beingHuman: "Our ancestors consumed 2–3x more magnesium from mineral-rich water and soil-grown food. Modern farming has depleted soil magnesium by over 50%.",
    },
  },
  {
    id: "lib-vitamin-d3", name: "Vitamin D3 + K2",
    description: "1000–2000 IU with food for immune function, bone density, and mood.",
    frequency: "Daily with food", evidenceNote: "~32% of NZ adults are deficient.",
    icon: "sunVitamin", category: "supplements", timing: "morning",
    nzBrands: "Clinicians Vitamin D3 + K2, Thompson's Vitamin D, Nutra-Life D3",
    rdi: {
      amount: "600 IU", unit: "IU", nzRdi: "600 IU/day; therapeutic 2000–4000 IU",
      upperLimit: "4000 IU/day without GP monitoring", timing: "Morning with fat-containing meal",
      foodSources: ["Oily fish", "Egg yolks", "Fortified milk"],
    },
    note: "New Zealand has one of the highest D-deficiency rates in the world despite sunshine. Most NZers need supplementation from May–August at minimum.",
    education: {
      modern: "Vitamin D is actually a hormone precursor. It regulates calcium absorption, immune function, and mood via serotonin synthesis.",
      tcm: "Vitamin D mirrors Yang Qi cultivation — the body's warming, activating, immune-defensive energy.",
      ayurveda: "Surya (sun) is the primary source of Prana. Vitamin D supplementation compensates for modern indoor lifestyles.",
      beingHuman: "Humans evolved spending 4–10 hours outdoors daily. We are the first generation to live almost entirely under artificial light.",
    },
  },
  {
    id: "lib-omega-3", name: "Omega-3 (EPA + DHA)",
    description: "500mg–1g EPA+DHA combined with food for heart health, brain function, and hormonal balance.",
    frequency: "Daily with food", evidenceNote: "Omega-3 fatty acids support cardiovascular health and reduce inflammation.",
    icon: "droplet", category: "supplements", timing: "morning",
    note: "Check label for EPA+DHA mg — not total fish oil weight.",
    nzBrands: "Blackmores Fish Oil, Nutra-Life Omega 3, Good Health Wild Fish Oil",
    rdi: {
      amount: "1000–2000mg EPA+DHA", unit: "mg", nzRdi: "1.1g ALA/day; therapeutic 1000–2000mg EPA+DHA",
      upperLimit: "3g/day EPA+DHA", timing: "With meals to reduce fishy reflux",
      foodSources: ["Salmon", "Sardines", "Mackerel", "Walnuts", "Flaxseed"],
      phaseNotes: {
        menstrual: "Omega-3 reduces prostaglandin-driven inflammation. Prioritise this phase.",
        luteal: "Supports mood and reduces PMS inflammatory cascade.",
      },
    },
    education: {
      modern: "EPA and DHA are critical for brain structure, inflammatory resolution, and cardiovascular health. Most Western diets are severely deficient.",
      tcm: "Omega-3-rich foods nourish Blood and Yin — reducing internal heat and inflammation.",
      ayurveda: "Oily fish and seeds are considered Snehana (oleating) — lubricating tissues and pacifying Vata.",
      beingHuman: "Our ancestors ate a 1:1 ratio of omega-6 to omega-3. Modern diets are 15:1 or worse — driving chronic inflammation.",
    },
  },
  {
    id: "lib-iron", name: "Iron",
    description: "For energy and red blood cell production, especially during menstruation.",
    frequency: "As directed", evidenceNote: "Only supplement if blood test confirms deficiency.",
    icon: "capsule", category: "supplements", timing: "morning", womenBadge: true,
    note: "Iron deficiency is the most common nutritional deficiency in NZ women. Have ferritin tested, not just haemoglobin — ferritin below 50μg/L affects energy and cognitive function.",
    nzBrands: "Clinicians Iron + C, Floradix (liquid — gentler), Spatone",
    rdi: {
      amount: "18mg", unit: "mg", nzRdi: "18mg/day premenopausal; 8mg/day postmenopausal",
      upperLimit: "45mg/day", timing: "Morning on empty stomach with vitamin C; away from calcium and coffee",
      foodSources: ["Red meat", "Lentils", "Spinach", "Pumpkin seeds", "Fortified cereals"],
      phaseNotes: {
        menstrual: "Iron is actively lost through blood. Take daily during menstruation.",
        luteal: "Build iron stores before your period arrives.",
      },
    },
    education: {
      modern: "Iron is essential for oxygen transport via haemoglobin and myoglobin. Deficiency causes fatigue, brain fog, hair loss, and reduced exercise capacity.",
      tcm: "Iron deficiency mirrors Blood Deficiency in TCM — pale complexion, fatigue, dizziness, and scanty periods.",
      ayurveda: "Iron-rich foods build Rasa and Rakta Dhatu (plasma and blood tissue) — the foundation of vitality.",
      beingHuman: "Menstruating women lose 15–30mg of iron per cycle. Without red meat or deliberate supplementation, deficiency is almost inevitable.",
    },
  },
  {
    id: "lib-folate", name: "Folate (Methylfolate)",
    description: "Essential for cell division, DNA synthesis, and neural tube protection.",
    frequency: "Daily", evidenceNote: "Critical for women trying to conceive.",
    icon: "capsule", category: "supplements", timing: "morning", womenBadge: true,
    note: "Choose methylfolate (5-MTHF) over synthetic folic acid — up to 40% of women have the MTHFR gene variant that reduces folic acid conversion.",
    nzBrands: "Clinicians Methyl B12 + Folate, Solgar Folate",
    rdi: {
      amount: "400μg", unit: "μg", nzRdi: "400μg/day; 600μg/day if pregnant",
      timing: "Morning with food",
      foodSources: ["Leafy greens", "Legumes", "Edamame", "Asparagus", "Avocado"],
    },
    education: {
      modern: "Folate is essential for DNA methylation — the process that turns genes on and off. Critical during rapid cell division.",
      tcm: "Folate-rich greens nourish Liver Blood — supporting menstrual health and fertility.",
      ayurveda: "Green leafy vegetables are Sattvic — pure, nourishing, and supportive of Ojas (vital essence).",
    },
  },
  {
    id: "lib-b-complex", name: "B Complex (methylated)",
    description: "Energy, brain function, mood, and PMS support.",
    frequency: "Daily", evidenceNote: "B vitamins are essential co-factors for energy metabolism.",
    icon: "pillBottle", category: "supplements", timing: "morning", womenBadge: true,
    nzBrands: "Clinicians B Complex, Thompson's B100",
    rdi: {
      amount: "B12 2.4μg; B6 1.3mg", unit: "mg", nzRdi: "B12 2.4μg/day; B6 1.3mg/day",
      timing: "Morning — B vitamins are energising",
      foodSources: ["Eggs", "Nutritional yeast", "Legumes", "Leafy greens"],
      phaseNotes: {
        luteal: "B6 specifically (25–50mg) reduces PMS symptoms and supports progesterone metabolism.",
      },
    },
    education: {
      modern: "B vitamins are co-factors in over 100 enzymatic reactions including energy production, neurotransmitter synthesis, and hormone metabolism.",
      tcm: "B vitamins support Qi and Blood production — essential for menstrual health and energy.",
      ayurveda: "B-rich foods are Rajasic (energising) — taken in the morning they support Agni and mental clarity.",
    },
  },
  {
    id: "lib-zinc", name: "Zinc 15–25mg",
    description: "Immune defence, hormone regulation, skin, and thyroid support.",
    frequency: "Daily", evidenceNote: "Zinc supports over 300 enzymatic reactions.",
    icon: "capsule", category: "supplements", timing: "evening",
    nzBrands: "Ethical Nutrients Zinc Fix, Thompson's Zinc",
    rdi: {
      amount: "8mg", unit: "mg", nzRdi: "8mg/day women",
      upperLimit: "40mg/day", timing: "Evening with food (can cause nausea on empty stomach)",
      foodSources: ["Oysters", "Beef", "Pumpkin seeds", "Hemp seeds", "Chickpeas"],
      phaseNotes: {
        follicular: "Zinc supports oestrogen metabolism and skin health — collagen synthesis peaks this phase.",
      },
    },
    education: {
      modern: "Zinc is required for immune cell function, wound healing, thyroid hormone conversion (T4→T3), and skin integrity.",
      tcm: "Zinc-rich foods tonify Wei Qi (defensive energy) — especially important during seasonal changes.",
      ayurveda: "Zinc supports Agni (digestive fire) and Ojas (immune essence) — the foundation of resilience.",
    },
  },
  {
    id: "lib-vitamin-c", name: "Vitamin C",
    description: "Immune support, collagen production, and iron absorption.",
    frequency: "Daily", evidenceNote: "Potent antioxidant that enhances iron uptake.",
    icon: "pillBottle", category: "supplements", timing: "morning",
    nzBrands: "Clinicians Vitamin C, Nutra-Life Vitamin C",
    note: "Two kiwifruit = your full daily RDI. NZ grows the best kiwifruit in the world — this is an easy one to get from food.",
    rdi: {
      amount: "75mg", unit: "mg", nzRdi: "75mg/day; therapeutic 500–1000mg",
      timing: "With meals — split doses if taking high dose",
      foodSources: ["Kiwifruit", "Capsicum", "Broccoli", "Strawberries"],
    },
    education: {
      modern: "Vitamin C is essential for collagen synthesis, immune cell function, and iron absorption. It's also a potent antioxidant.",
      tcm: "Sour-flavoured vitamin C sources tonify the Liver and support Blood production.",
      ayurveda: "Amalaki (Indian gooseberry) is the Ayurvedic equivalent — the most important Rasayana for Pitta balance and tissue repair.",
    },
  },
  {
    id: "lib-probiotics", name: "Probiotics",
    description: "Gut microbiome, immunity, and mood via gut-brain axis.",
    frequency: "Daily", evidenceNote: "Broad-spectrum probiotics support digestive and vaginal health.",
    icon: "capsule", category: "supplements", timing: "morning", womenBadge: true,
    nzBrands: "Inner Health Plus, Ethical Nutrients Inner Health, Clinicians Flora Restore",
    rdi: {
      amount: "1–10 billion CFU", unit: "CFU", nzRdi: "No formal RDI — evidence supports 1–10 billion CFU/day",
      timing: "Morning on empty stomach OR with food depending on strain",
      foodSources: ["Yoghurt", "Kefir", "Sauerkraut", "Kimchi", "Miso"],
      phaseNotes: {
        menstrual: "Gut microbiome influences oestrogen metabolism (estrobolome). Support it especially during hormonal fluctuations.",
      },
    },
    education: {
      modern: "The gut microbiome produces neurotransmitters (90% of serotonin), regulates immune function, and metabolises oestrogen via the estrobolome.",
      tcm: "Gut health corresponds to Spleen Qi — the TCM Spleen is responsible for transformation and transportation of nutrients.",
      ayurveda: "Fermented foods are considered Agni-kindling — they stoke the digestive fire and prevent Ama (toxic buildup).",
      beingHuman: "Our ancestors consumed far more fermented and fibre-rich food, supporting a microbiome 40% more diverse than modern populations.",
    },
  },
  {
    id: "lib-ashwagandha", name: "Ashwagandha (KSM-66)",
    description: "Stress adaptation, cortisol regulation, adrenal support, and energy.",
    frequency: "Daily", evidenceNote: "Choose KSM-66 or Shoden extract for clinical-grade quality.",
    icon: "capsule", category: "supplements", timing: "evening",
    note: "Choose products specifying KSM-66 or Shoden extract.",
    nzBrands: "Good Health Ashwagandha, Nutra-Life KSM-66 Ashwagandha",
    rdi: {
      amount: "300–600mg KSM-66", unit: "mg", nzRdi: "No formal RDI — evidence base: 300–600mg KSM-66 daily",
      timing: "Evening — adaptogenic, reduces cortisol over time",
      foodSources: [],
      phaseNotes: {
        luteal: "Most beneficial when cortisol is highest — late luteal phase.",
        menstrual: "Supports adrenal recovery during the low-hormone phase.",
      },
    },
    education: {
      modern: "Ashwagandha reduces cortisol by 30% in clinical trials. It supports thyroid function, sleep quality, and exercise recovery.",
      tcm: "Ashwagandha acts as a Kidney Yang and Qi tonic — building resilience and constitutional strength.",
      ayurveda: "Ashwagandha (Withania somnifera) is one of Ayurveda's most important Rasayana (rejuvenating) herbs. Used for over 3,000 years for strength, stamina, and stress resilience.",
      beingHuman: "Adaptogenic herbs were humanity's first medicine — plants that help the body adapt to environmental stress.",
    },
  },
  {
    id: "lib-collagen", name: "Collagen Peptides",
    description: "Skin elasticity, joint health, and gut lining support.",
    frequency: "Daily", evidenceNote: "Look for VERISOL or hydrolysed collagen peptides.",
    icon: "powderScoop", category: "supplements", timing: "morning", womenBadge: true,
    nzBrands: "Great Lakes Collagen, Nutra-Life Collagen",
    rdi: {
      amount: "10–15g", unit: "g", nzRdi: "No formal RDI — evidence base: 10–15g/day",
      timing: "Morning with vitamin C (C is required for collagen synthesis)",
      foodSources: [],
      phaseNotes: {
        follicular: "Collagen synthesis is highest when oestrogen is rising — take with vitamin C for maximum effect.",
        ovulatory: "Oestrogen peak supports collagen production — this is your skin's best window.",
      },
    },
    education: {
      modern: "Hydrolysed collagen peptides stimulate fibroblast activity, improving skin elasticity by 28% in 8 weeks.",
      tcm: "Collagen nourishes Yin and Blood — supporting skin, tendons, and connective tissue integrity.",
      ayurveda: "Collagen-rich bone broth is Snehana (oleating) and builds Asthi Dhatu (bone tissue) and Majja Dhatu (marrow).",
    },
  },
  {
    id: "lib-coq10", name: "CoQ10 / Ubiquinol",
    description: "Cellular energy (ATP), heart health, and antioxidant support.",
    frequency: "Daily with fat", evidenceNote: "Ubiquinone if under 40, ubiquinol if 40+.",
    icon: "capsule", category: "supplements", timing: "morning",
    nzBrands: "Clinicians CoQ10, Thompson's CoQ10 Ubiquinol",
    rdi: {
      amount: "100–200mg", unit: "mg", nzRdi: "No formal RDI — evidence base: 100–200mg/day",
      timing: "Morning with fat-containing meal",
      foodSources: [],
    },
    note: "CoQ10 supports mitochondrial energy production in all phases — especially beneficial in perimenopause when mitochondrial function declines.",
    education: {
      modern: "CoQ10 is essential for mitochondrial ATP production. Levels decline with age and statin use.",
      tcm: "CoQ10 supports Heart Qi — the driving force of blood circulation and vitality.",
      ayurveda: "CoQ10 supports Tejas (subtle fire) — the cellular intelligence that drives metabolism and repair.",
    },
  },
  {
    id: "lib-iodine", name: "Iodine 150mcg",
    description: "Thyroid function and metabolism. NZ soils are iodine-poor.",
    frequency: "Daily", evidenceNote: "NZ soils are naturally low in iodine.",
    icon: "droplet", category: "supplements", timing: "morning",
    nzBrands: "Clinicians Iodine, Most multivitamins include iodine",
    note: "New Zealand soils are iodine-depleted. NZ has mandatory iodine fortification in bread, but many women remain deficient — especially those avoiding bread or dairy.",
    rdi: {
      amount: "150μg", unit: "μg", nzRdi: "150μg/day women; 220μg pregnancy",
      timing: "Morning with food",
      foodSources: ["Seaweed (nori)", "Seafood", "Iodised salt", "Dairy"],
    },
    education: {
      modern: "Iodine is essential for thyroid hormone synthesis (T3 and T4). Deficiency causes fatigue, weight gain, and cognitive impairment.",
      tcm: "Seaweed (a primary iodine source) is used in TCM to soften hardness and resolve phlegm — supporting thyroid nodule resolution.",
      ayurveda: "Iodine-rich seaweed supports Kapha balance — preventing the sluggishness and weight gain of Kapha aggravation.",
    },
  },
  {
    id: "lib-creatine", name: "Creatine 3–5g",
    description: "Muscle strength, recovery, and brain function. Strong evidence for women.",
    frequency: "Daily", evidenceNote: "Not just for men — strong evidence for women, especially perimenopause.",
    icon: "powderScoop", category: "supplements", timing: "anytime", womenBadge: true,
    nzBrands: "Optimum Nutrition Creatine, Bulk Nutrients Creatine Monohydrate",
    rdi: {
      amount: "3–5g", unit: "g", nzRdi: "No formal RDI — evidence base: 3–5g/day",
      timing: "Any time — consistency more important than timing",
      foodSources: [],
    },
    note: "One of the most evidence-based supplements for women. Supports muscle strength, cognitive function, bone density, and mood. Especially important in perimenopause and post-menopause. (Sims, Next Level)",
    education: {
      modern: "Creatine increases phosphocreatine stores, improving strength output by 5–10% and supporting cognitive function under stress.",
      tcm: "Creatine's energy-building effect mirrors Kidney Jing supplementation — building constitutional strength and resilience.",
      ayurveda: "Creatine supports Bala (strength) — one of the key outcomes of proper Rasayana (rejuvenation) therapy.",
      beingHuman: "Our ancestors consumed creatine naturally through organ meats and game. Modern diets provide far less, especially for women.",
    },
  },
  {
    id: "lib-greens-powder", name: "Greens Powder",
    description: "Fills micronutrient gaps. Not a replacement for vegetables.",
    frequency: "Daily", evidenceNote: "Concentrated phytonutrients and alkalising support.",
    icon: "powderScoop", category: "supplements", timing: "morning",
    note: "NZ picks: Nuzest Good Green Vitality (best value), AG1 (NSF certified, made in NZ), Lifestream Greens (organic).",
    nzBrands: "Nuzest, Vital All-In-One, AG1, Lifestream (HealthPost, supplements.co.nz)",
    education: {
      modern: "Greens powders provide concentrated polyphenols, prebiotic fibre, and alkalising minerals that support gut and immune health.",
      ayurveda: "Green plant concentrates are Sattvic — pure, light, and supportive of clarity and Ojas.",
    },
  },

  // ── Nutrition ──
  { id: "lib-30-plants", name: "30 Plant Foods This Week", description: "Aim for 30 different plant foods across the week.", frequency: "Weekly", evidenceNote: "Gut microbiome diversity benchmark from the American Gut Project.", icon: "plantBasket", category: "nutrition", timing: "anytime",
    education: { modern: "The American Gut Project found that people eating 30+ plant species per week had significantly more diverse gut microbiomes.", tcm: "Five-colour eating (red, yellow, green, white, black) ensures all Five Elements and organs are nourished.", ayurveda: "Variety in food is Sattvic — supporting all seven Dhatus (tissue layers).", beingHuman: "Hunter-gatherers consumed 200–300 plant species per year. We average fewer than 20." } },
  { id: "lib-fermented-food", name: "Fermented Food Daily", description: "Include yoghurt, kefir, kimchi, or sauerkraut.", frequency: "Daily", evidenceNote: "Supports microbiome diversity and inflammation reduction.", icon: "fermentedJar", category: "nutrition", timing: "anytime",
    education: { modern: "Stanford study: 6 servings/week of fermented foods reduced inflammatory markers and increased microbiome diversity.", tcm: "Fermented foods support Spleen Qi — the foundation of digestion and nutrient transformation.", ayurveda: "Fermented foods kindle Agni (digestive fire) — essential for preventing Ama (toxic accumulation)." } },
  { id: "lib-oily-fish", name: "Oily Fish 2x This Week", description: "Salmon, sardines, or mackerel for omega-3, vitamin D, and protein.", frequency: "2x weekly", evidenceNote: "Rich source of omega-3 fatty acids linked to cardiovascular health.", icon: "fish", category: "nutrition", timing: "anytime" },
  { id: "lib-seed-cycle", name: "Seed Cycle Daily", description: "Days 1–14: pumpkin + flax seeds. Days 15–28: sunflower + sesame seeds.", frequency: "Daily", evidenceNote: "Supports hormonal balance through phytoestrogen and lignan intake.", icon: "seed", category: "nutrition", timing: "anytime", womenBadge: true },
  { id: "lib-cruciferous", name: "Cruciferous Vegs 3x", description: "Broccoli, cauliflower, or kale for oestrogen detoxification via DIM.", frequency: "3x weekly", evidenceNote: "DIM supports healthy oestrogen metabolism.", icon: "broccoli", category: "nutrition", timing: "anytime" },
  { id: "lib-protein-breakfast", name: "Protein at Breakfast", description: "20–30g protein to stabilise blood sugar, reduce cravings, and support lean muscle.", frequency: "Daily", evidenceNote: "Morning protein supports satiety and blood sugar stability.", icon: "proteinPlate", category: "nutrition", timing: "morning",
    education: { modern: "Protein at breakfast increases satiety hormones (PYY, GLP-1) and reduces ghrelin-driven cravings throughout the day.", tcm: "The Stomach meridian is most active 7–9am — this is the optimal window for nourishing food.", ayurveda: "Agni (digestive fire) is strongest in the morning — heavy, protein-rich food is best digested now.", beingHuman: "Our ancestors broke their overnight fast with the most nutrient-dense food available. Cereal and toast are a 20th-century invention." } },
  { id: "lib-no-processed", name: "No Ultra-Processed Foods", description: "Eliminate ultra-processed foods today.", frequency: "Daily", evidenceNote: "Ultra-processed food consumption is linked to increased disease risk.", icon: "noProcessed", category: "nutrition", timing: "anytime" },
  { id: "lib-water-2l", name: "Drink 2L Water", description: "Drink 2 litres of water throughout the day.", frequency: "Daily", evidenceNote: "Adequate hydration supports digestion, energy, and cognitive function.", icon: "waterGlass", category: "nutrition", timing: "anytime",
    education: { modern: "Even mild dehydration (1–2%) impairs cognitive function, mood, and exercise performance.", tcm: "Water is the foundation of Kidney Yin — the basis of all body fluids, hormones, and tissue lubrication.", ayurveda: "Warm water throughout the day kindles Agni and prevents Ama. Cold water dampens digestive fire.", beingHuman: "Access to clean, abundant water is humanity's most basic health requirement. Our ancestors prioritised water sources above all else." } },
  { id: "lib-leafy-greens", name: "Leafy Greens at Meals", description: "Eat a handful of leafy greens at lunch and dinner.", frequency: "Daily", evidenceNote: "Greens provide fiber, folate, and polyphenols.", icon: "leaf", category: "nutrition", timing: "anytime" },
  { id: "lib-reduce-sugar", name: "Reduce Refined Sugar", description: "Minimise refined sugar intake today.", frequency: "Daily", evidenceNote: "Excess sugar is linked to inflammation and metabolic dysfunction.", icon: "noSugar", category: "nutrition", timing: "anytime" },
  { id: "lib-meal-prep", name: "Meal Prep 3 Days", description: "Prep meals for the next 3 days.", frequency: "2x weekly", evidenceNote: "Meal prep reduces reliance on convenience food.", icon: "mealPrep", category: "nutrition", timing: "anytime" },
  { id: "lib-new-recipe", name: "New Whole Food Recipe", description: "Cook one new whole food recipe this week.", frequency: "Weekly", evidenceNote: "Variety in cooking supports nutrient diversity.", icon: "recipeBook", category: "nutrition", timing: "anytime" },
  { id: "lib-healthy-fat", name: "Healthy Fat Every Meal", description: "Include avocado, olive oil, nuts, or seeds — supports fat-soluble vitamin absorption.", frequency: "Daily", evidenceNote: "Healthy fats aid absorption of vitamins A, D, E, and K.", icon: "avocado", category: "nutrition", timing: "anytime" },
  { id: "lib-no-alcohol", name: "No Alcohol This Week", description: "Abstain from alcohol for the full week.", frequency: "Weekly", evidenceNote: "Even moderate alcohol impacts sleep quality and hormonal balance.", icon: "noAlcohol", category: "nutrition", timing: "anytime" },
  { id: "lib-mindful-eating", name: "Mindful Eating", description: "No screens during meals today.", frequency: "Daily", evidenceNote: "Mindful eating improves digestion and satiety awareness.", icon: "mindfulPlate", category: "nutrition", timing: "anytime" },
  { id: "lib-warm-lemon-water", name: "Warm Lemon Water", description: "First drink of the day — warm water with the juice of half a lemon before food or coffee.", frequency: "Daily", evidenceNote: "Stimulates gastric secretion; mild alkalising effect; provides vitamin C; supports bile flow.", icon: "waterGlass", category: "nutrition", timing: "morning",
    education: { modern: "Warm lemon water stimulates gastric secretion and bile flow, supporting digestion and liver function.", tcm: "Warm water activates the Stomach and Spleen meridians (7–9am is their peak time). Lemon is sour flavour which tonifies the Liver.", ayurveda: "Ushapan — warm water first thing is the most basic Dinacharya practice. Wakes the digestive fire (Agni) gently.", beingHuman: "Our ancestors drank water at ambient temperature first thing. Hot beverages and cold water on waking are both modern inventions." } },

  // ── Movement ──
  { id: "lib-10k-steps", name: "10,000 Steps Today", description: "Hit 10,000 steps throughout the day.", frequency: "Daily", evidenceNote: "Higher step counts are linked with lower mortality risk.", icon: "steps", category: "movement", timing: "anytime" },
  { id: "lib-morning-walk", name: "Morning Walk", description: "20–30 minute morning walk to start the day.", frequency: "Daily", evidenceNote: "Morning light exposure regulates circadian rhythm and cortisol.", icon: "morningWalk", category: "movement", timing: "morning",
    education: { modern: "Morning walking combines circadian light exposure, gentle movement, and grounding — three independent health interventions in one.", tcm: "The Large Intestine meridian is active 5–7am — morning movement supports the body's natural elimination cycle.", ayurveda: "Morning walking is prescribed in Dinacharya — it activates Prana and sets the metabolic tone for the day.", beingHuman: "Walking at dawn was the default human morning for 200,000 years. We are the first generation to skip it." } },
  { id: "lib-strength", name: "Strength Training", description: "Resistance training for muscle and bone health.", frequency: "2–3x weekly", evidenceNote: "Especially important in follicular and ovulatory phases.", icon: "dumbbell", category: "movement", timing: "anytime", womenBadge: true },
  { id: "lib-hiit", name: "HIIT Session", description: "20–30 minutes of high intensity interval training.", frequency: "1–2x weekly", evidenceNote: "HIIT improves cardiovascular fitness and insulin sensitivity.", icon: "hiit", category: "movement", timing: "anytime" },
  { id: "lib-yoga", name: "Yoga or Pilates", description: "Mindful movement and breath coordination, any length.", frequency: "Weekly", evidenceNote: "Improves flexibility, stress reduction, and core strength.", icon: "yogaPose", category: "movement", timing: "anytime" },
  { id: "lib-stretching", name: "Stretching / Mobility", description: "10 minutes of gentle stretching for joints and muscles.", frequency: "Daily", evidenceNote: "Improves flexibility and reduces injury risk.", icon: "stretch", category: "movement", timing: "evening" },
  { id: "lib-swimming", name: "Swimming", description: "Low-impact full-body cardiovascular exercise.", frequency: "Weekly", evidenceNote: "Swimming is joint-friendly and builds aerobic endurance.", icon: "swim", category: "movement", timing: "anytime" },
  { id: "lib-cycling", name: "Cycling", description: "Indoor or outdoor cycling for cardio and leg strength.", frequency: "Weekly", evidenceNote: "Cycling is low-impact and improves cardiovascular health.", icon: "cycle", category: "movement", timing: "anytime" },
  { id: "lib-dance", name: "Dance or Free Movement", description: "Dance class or intuitive free movement.", frequency: "Weekly", evidenceNote: "Dance improves coordination, mood, and cardiovascular fitness.", icon: "dance", category: "movement", timing: "anytime" },
  { id: "lib-rest-day", name: "Rest Day", description: "Active recovery only — walk, gentle stretch, nothing intense.", frequency: "1–2x weekly", evidenceNote: "Recovery is essential for adaptation and injury prevention.", icon: "restDay", category: "movement", timing: "anytime" },
  { id: "lib-movement-break", name: "Movement Break Hourly", description: "Stand or walk briefly every hour.", frequency: "Hourly", evidenceNote: "Breaking up sedentary time improves metabolic health.", icon: "clockBreak", category: "movement", timing: "anytime" },
  { id: "lib-lunch-walk", name: "Lunchtime Walk", description: "Even 15 minutes counts — get outside at lunch.", frequency: "Daily", evidenceNote: "Midday movement improves afternoon focus and energy.", icon: "lunchWalk", category: "movement", timing: "afternoon" },
  { id: "lib-two-strength", name: "Two Strength Sessions", description: "Complete two strength training sessions this week.", frequency: "Weekly", evidenceNote: "Minimum effective dose for strength and bone density.", icon: "twoStrength", category: "movement", timing: "anytime" },
  { id: "lib-zone2", name: "Zone 2 Cardio", description: "30+ minutes at conversational pace for metabolic health, fat oxidation, and longevity.", frequency: "2–3x weekly", evidenceNote: "Best for mitochondrial function and metabolic fitness.", icon: "heartPulse", category: "movement", timing: "anytime" },

  // ── Self Care ──
  { id: "lib-morning-meditation", name: "Morning Meditation", description: "10 minutes of quiet breathing or mindfulness to calm the nervous system.", frequency: "Daily", evidenceNote: "Meditation is supported by strong research for stress reduction.", icon: "capsule", category: "self-care", timing: "morning",
    education: { modern: "Meditation reduces amygdala reactivity and cortisol levels. 8 weeks of practice physically thickens the prefrontal cortex.", tcm: "Meditation cultivates Shen (spirit/consciousness) — the most refined expression of Qi.", ayurveda: "Dhyana (meditation) is one of the eight limbs of yoga — the practice of stilling the fluctuations of the mind.", beingHuman: "Quiet contemplation was a daily practice for most of human history. Constant stimulation is the anomaly." } },
  { id: "lib-evening-breathwork", name: "Evening Breathwork", description: "Slow breathing (4-7-8 or box breathing) to activate the parasympathetic nervous system.", frequency: "Nightly", evidenceNote: "Slow breathing lowers heart rate and improves sleep quality.", icon: "capsule", category: "self-care", timing: "evening" },
  { id: "lib-gratitude-practice", name: "Gratitude Practice", description: "Write three things you are grateful for today.", frequency: "Daily", evidenceNote: "Gratitude journaling is associated with improved mood.", icon: "capsule", category: "self-care", timing: "evening",
    education: { modern: "Gratitude journaling increases serotonin and dopamine production. Pennebaker's research shows expressive writing reduces stress hormones.", tcm: "Gratitude opens the Heart meridian and calms Shen — reducing anxiety and supporting restful sleep.", ayurveda: "Santosha (contentment) is one of the Niyamas — cultivating gratitude is a foundational yogic practice.", beingHuman: "Communal gratitude rituals — sharing food, giving thanks — were universal across ancestral cultures." } },
  { id: "lib-time-in-nature", name: "Time in Nature", description: "Spend time outdoors in green space.", frequency: "Daily or weekly", evidenceNote: "Nature exposure reduces cortisol and improves mood.", icon: "capsule", category: "self-care", timing: "anytime" },
  { id: "lib-digital-sunset", name: "Digital Sunset", description: "No screens 60 minutes before sleep.", frequency: "Nightly", evidenceNote: "Reducing evening blue light supports melatonin production.", icon: "capsule", category: "self-care", timing: "evening",
    education: { modern: "Blue light after sunset suppresses melatonin by up to 50%. Even dim screen light delays sleep onset by 30+ minutes.", tcm: "The Triple Burner meridian is active 9–11pm — this is the wind-down window. Screens overstimulate Yang energy.", ayurveda: "Evening is Kapha time — heavy, slow, grounding. Screens introduce Vata (stimulation) when the body needs stillness.", beingHuman: "For 200,000 years, the only light after sunset was firelight. We are the first generation to bathe in blue light at night." } },
  { id: "lib-sauna-session", name: "Sauna Session", description: "15–20 minutes of heat exposure.", frequency: "3–4x weekly", evidenceNote: "Associated with cardiovascular and longevity benefits.", icon: "capsule", category: "self-care", timing: "anytime" },
  { id: "lib-cold-shower", name: "Cold Shower", description: "Finish shower with 30–60 seconds of cold water.", frequency: "Optional daily", evidenceNote: "Cold exposure increases alertness and norepinephrine.", icon: "capsule", category: "self-care", timing: "morning" },

  // ── Foundations (Being Human) ──
  { id: "lib-morning-sunlight", name: "Morning Sunlight (10–30 min)",
    description: "Stand or sit outside in natural light within 1 hour of waking — no sunglasses for the first 10 minutes. Overcast still counts.",
    frequency: "Daily", evidenceNote: "Sets circadian rhythm; improves sleep quality by 1.7 hours on average.",
    icon: "sunVitamin", category: "foundations", timing: "morning",
    education: {
      modern: "Morning light exposure via the suprachiasmatic nucleus sets your 24-hour cortisol rhythm. This single habit improves sleep quality more than any sleep supplement.",
      tcm: "The Large Intestine and Stomach meridians are active at sunrise — morning light aligns your body's Qi circulation with the natural Yang energy of the day.",
      ayurveda: "Surya (the sun) is the primary source of Prana. Morning sunlight exposure is the first and most important act in Dinacharya.",
      beingHuman: "Humans evolved spending their first hour of daylight outdoors. We are the first generation to wake under artificial light — and it's costing us our sleep.",
    },
  },
  { id: "lib-grounding", name: "Grounding / Earthing",
    description: "Bare feet on grass, soil, sand, or any natural earth surface for a minimum of 10 minutes.",
    frequency: "Daily", evidenceNote: "Electron transfer reduces free radical burden; studies show cortisol normalisation and improved sleep.",
    icon: "leaf", category: "foundations", timing: "anytime",
    education: {
      modern: "Grounding reduces free radicals via electron transfer. Published research shows cortisol normalisation, improved sleep, and reduced inflammation.",
      tcm: "Earth element (Spleen/Stomach) is the centre of all five elements. Physical contact with earth grounds and tonifies this system.",
      ayurveda: "Prithvi (earth) is the primary Vata-pacifying element — bare feet on earth is a fundamental grounding practice prescribed for anxiety and insomnia.",
      beingHuman: "Our ancestors walked barefoot on earth every day. Rubber-soled shoes are less than 100 years old — we've disconnected from the planet's electrical surface.",
    },
  },
  { id: "lib-screen-free-morning", name: "Screen-Free Morning (30 min)",
    description: "No phone, no social media, no email for the first 30 minutes after waking.",
    frequency: "Daily", evidenceNote: "Morning cortisol spike is meant for alertness — checking a phone hijacks this and creates anxiety patterns.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "The Cortisol Awakening Response (CAR) primes alertness in the first 30 minutes. Phone checking immediately hijacks this with external stress.",
      tcm: "The Lung and Large Intestine meridians are active 3–7am — this window benefits from quiet, internal attention, not external stimulation.",
      ayurveda: "Brahma Muhurta — the 90 minutes before sunrise — is considered the most auspicious time for self-reflection and inner work.",
      beingHuman: "For all of human history, the first hour of the day was spent in nature, movement, and quiet. The phone changed that in a single decade.",
    },
  },
  { id: "lib-nature-time", name: "Nature Time (20+ min)",
    description: "Walk, sit, or move in a park, bush, beach, or garden — not just walking on footpaths.",
    frequency: "Daily", evidenceNote: "Forest bathing research: reduces cortisol, blood pressure; 20 minutes is the threshold for measurable benefit.",
    icon: "leaf", category: "foundations", timing: "anytime",
    education: {
      modern: "Forest bathing (Shinrin-yoku) research: reduces cortisol, blood pressure, and adrenaline. NK cell activity increases. 20 minutes is the threshold.",
      tcm: "Wood element (Liver/Gallbladder) resonates with nature, wind, and trees — nature exposure directly tonifies Liver Qi and reduces stagnation.",
      ayurveda: "Vayu (air) and Akasha (space) — open space in nature allows Prana to move freely. Prescribed for all three doshas.",
      beingHuman: "We spent 99.9% of our evolutionary history outdoors. The indoor life is a 200-year experiment — and the data isn't looking good.",
    },
  },
  { id: "lib-intentional-rest", name: "Intentional Rest (NSDR)",
    description: "10–20 minutes of eyes-closed stillness, yoga nidra, or simply lying down — not sleeping.",
    frequency: "Daily", evidenceNote: "Non-Sleep Deep Rest produces the same neurological restoration as equivalent sleep time.",
    icon: "restDay", category: "foundations", timing: "afternoon",
    education: {
      modern: "NSDR produces the same neurological restoration as equivalent sleep time. It accelerates skill learning and reduces cortisol.",
      tcm: "The 1–3pm Small Intestine window — rest here supports the body's natural assimilation and renewal cycle.",
      ayurveda: "Yoga Nidra (psychic sleep) is a core Ayurvedic practice — 20 minutes equals 90 minutes of sleep according to traditional texts.",
      beingHuman: "Afternoon rest was universal across pre-industrial cultures. The 8-hour continuous work block is a factory-era invention.",
    },
  },
  { id: "lib-cold-exposure", name: "Cold Exposure (graduated)",
    description: "Cold shower (finish last 30–60 seconds cold) or cold plunge. Start with 15 seconds, build to 2–3 minutes.",
    frequency: "Daily", evidenceNote: "Dopamine increase up to 250%; noradrenaline increase 300%; sustained for hours post-exposure.",
    icon: "capsule", category: "foundations", timing: "morning",
    note: "Avoid cold plunges on days 1–3 of menstruation — cold contracts blood vessels and worsens cramping. Build this habit in your follicular and ovulatory phases.",
    education: {
      modern: "Cold exposure increases dopamine by 250% and noradrenaline by 300%, sustained for hours. It reduces inflammation and improves mood and resilience.",
      tcm: "Cold exposure tonifies Kidney Yang (vital energy) and stimulates Wei Qi (immune energy at the skin surface).",
      ayurveda: "Contraindicated in Vata imbalance (menstruation, extreme stress). Best in follicular/ovulatory phases and summer. Stimulates Agni and Tejas.",
      beingHuman: "Cold water immersion was a daily reality for most of human history. Central heating is less than 150 years old.",
    },
  },
  { id: "lib-fasting-window", name: "12–14 Hour Overnight Fast",
    description: "Stop eating 2–3 hours before bed. The overnight fast of 12–14 hours is the baseline human metabolic rhythm.",
    frequency: "Daily", evidenceNote: "12-hour fasting aligns with circadian insulin sensitivity; supports mitochondrial repair.",
    icon: "clockBreak", category: "foundations", timing: "evening",
    note: "Avoid extended fasting in the luteal phase — progesterone increases insulin resistance and cortisol sensitivity. Stick to 12-hour windows, not 16+.",
    education: {
      modern: "12-hour overnight fasting aligns with circadian insulin sensitivity, supports mitochondrial repair, and reduces overnight cortisol.",
      tcm: "The Liver detoxifies 1–3am — eating late impairs this function. Stomach time is 7–9am — eating within this window is metabolically optimal.",
      ayurveda: "Agni (digestive fire) follows the sun — it is weakest in the evening. The last meal should be the lightest. Overnight fasting clears Ama.",
      beingHuman: "Our ancestors didn't have refrigerators or late-night snacks. A 12-hour overnight fast was the default human metabolic pattern.",
    },
  },

  // ── Ayurvedic Morning Habits ──
  { id: "lib-tongue-scraping", name: "Tongue Scraping",
    description: "Scrape the tongue from back to front 7–14 times with a copper scraper before anything else in the morning.",
    frequency: "Daily", evidenceNote: "Removes bacteria and biofilm; reduces oral bacteria linked to gut dysbiosis.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "Tongue scraping removes overnight bacterial biofilm and reduces Streptococcus mutans. Emerging research links oral bacteria to gut dysbiosis.",
      tcm: "The tongue maps to internal organ health in TCM — scraping removes Ama and allows tongue diagnosis.",
      ayurveda: "First step of Dinacharya. Removes Ama (undigested metabolic waste) before it is reabsorbed. Copper scrapers are preferred for antimicrobial properties.",
      beingHuman: "Tongue cleaning has been practised across cultures for millennia. Modern oral hygiene neglects the tongue entirely.",
    },
  },
  { id: "lib-oil-pulling", name: "Oil Pulling",
    description: "Swish 1 tablespoon of cold-pressed sesame or coconut oil around the mouth for 5–20 minutes, then spit into a bin.",
    frequency: "Daily", evidenceNote: "Reduces Streptococcus mutans and oral bacteria; emerging gut microbiome connection.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "Oil pulling reduces oral pathogens and improves gum health. Research shows reduction in plaque index comparable to chlorhexidine mouthwash.",
      tcm: "The mouth is the gateway of the Spleen and Stomach meridians — oral health directly impacts digestive Qi.",
      ayurveda: "Gandusha/Kavala — oil pulling strengthens teeth, gums, and jaw. Removes Kapha dosha from the head and throat. Sesame oil is most Vata-pacifying.",
    },
  },
  { id: "lib-abhyanga", name: "Abhyanga (Self-Massage with Oil)",
    description: "Warm sesame oil and massage the entire body — long strokes on limbs, circular on joints. 5–15 minutes before shower.",
    frequency: "Daily", evidenceNote: "Activates parasympathetic nervous system; reduces cortisol; improves lymphatic flow.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "Self-massage activates the parasympathetic nervous system, reduces cortisol, improves lymphatic flow, and supports skin barrier function.",
      tcm: "Activates Wei Qi (defensive energy at the skin surface) and stimulates all meridian pathways.",
      ayurveda: "The most important single practice in Dinacharya. Lubricates joints, nourishes tissues, pacifies all three doshas. Oil type by dosha: Sesame for Vata, Coconut for Pitta.",
      beingHuman: "Self-massage with plant oils was practised across ancient civilisations. It's one of the oldest self-care practices known.",
    },
  },
  { id: "lib-nasya", name: "Nasya (Nasal Oil Application)",
    description: "Apply 2–3 drops of warm sesame or Nasya oil to each nostril, then sniff gently. 30 seconds total.",
    frequency: "Daily", evidenceNote: "The olfactory nerve is the only cranial nerve with direct CNS access; nasal oil reduces pathogen entry.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "Nasal passages are the direct pathway to the brain. Nasal oil application reduces airborne pathogen entry and supports the nasal microbiome.",
      tcm: "Lung meridian opens into the nose — nasal health directly reflects Lung Qi. Nasal breathing is fundamental in TCM energy cultivation.",
      ayurveda: "Nasya is one of the Panchakarma cleansing practices. Lubricates sinuses, clears the head, supports Prana Vata clarity.",
    },
  },
  { id: "lib-nasal-breathing", name: "Nasal Breathing Practice",
    description: "5 minutes of intentional nasal-only breathing upon waking — can be combined with sun exposure.",
    frequency: "Daily", evidenceNote: "Nasal breathing produces nitric oxide, increasing oxygen delivery by 18%.",
    icon: "capsule", category: "foundations", timing: "morning",
    education: {
      modern: "Nasal breathing produces nitric oxide (increases oxygen delivery by 18%), filters air, and activates the parasympathetic nervous system.",
      tcm: "Lung meridian is most active 3–5am. Morning breath practice cultivates Lung Qi.",
      ayurveda: "Pranayama (breath control) is central to all Ayurvedic practice. Anulom Vilom (alternate nostril breathing) is the prescribed morning practice.",
    },
  },
];

export function getLibraryHabitsForCategory(category: HabitCategory | "foundations"): LibraryHabit[] {
  return HABIT_LIBRARY.filter(h => h.category === category);
}

// ── Starter Packs ──
export interface StarterPack {
  id: string;
  name: string;
  description: string;
  habitIds: string[];
}

export const STARTER_PACKS: StarterPack[] = [
  {
    id: "daily-essentials",
    name: "The Daily Essentials",
    description: "Seven habits. Zero equipment. The foundation of human health.",
    habitIds: ["lib-morning-sunlight", "lib-warm-lemon-water", "lib-water-2l", "lib-protein-breakfast", "lib-nature-time", "lib-digital-sunset", "lib-morning-walk"],
  },
  {
    id: "ayurvedic-morning",
    name: "Ayurvedic Morning Ritual",
    description: "The 5,000-year-old morning routine that modern neuroscience supports.",
    habitIds: ["lib-screen-free-morning", "lib-tongue-scraping", "lib-oil-pulling", "lib-warm-lemon-water", "lib-abhyanga", "lib-nasal-breathing"],
  },
  {
    id: "supplement-essentials",
    name: "Supplement Essentials",
    description: "The four supplements with the strongest evidence base for NZ women.",
    habitIds: ["lib-vitamin-d3", "lib-magnesium", "lib-omega-3", "lib-probiotics"],
  },
  {
    id: "nervous-system-reset",
    name: "Nervous System Reset",
    description: "When you're running on empty — this sequence rebuilds your baseline.",
    habitIds: ["lib-morning-sunlight", "lib-evening-breathwork", "lib-cold-exposure", "lib-grounding", "lib-intentional-rest", "lib-magnesium"],
  },
  {
    id: "cycle-support",
    name: "Cycle Support",
    description: "Phase-aware practices that work with your hormones, not against them.",
    habitIds: ["lib-seed-cycle", "lib-iron", "lib-magnesium", "lib-yoga", "lib-stretching"],
  },
  {
    id: "gut-foundation",
    name: "Gut Foundation",
    description: "Gut health is the root of hormonal health. These are the basics.",
    habitIds: ["lib-30-plants", "lib-fermented-food", "lib-probiotics", "lib-tongue-scraping"],
  },
];

// ── Organ Clock ──
export interface OrganClockEntry {
  time: string;
  organ: string;
  connection: string;
}

export const ORGAN_CLOCK: OrganClockEntry[] = [
  { time: "3–5am", organ: "Lung", connection: "Deepest sleep window — protect it" },
  { time: "5–7am", organ: "Large Intestine", connection: "Morning elimination; warm water; movement" },
  { time: "7–9am", organ: "Stomach", connection: "Largest meal of the day; eat breakfast" },
  { time: "9–11am", organ: "Spleen", connection: "Mental focus; absorb nutrients; avoid cold drinks" },
  { time: "11am–1pm", organ: "Heart", connection: "Connection and communication; light movement" },
  { time: "1–3pm", organ: "Small Intestine", connection: "Digestion complete; sorting and assimilating" },
  { time: "3–5pm", organ: "Bladder", connection: "Hydration; afternoon movement; second wind" },
  { time: "5–7pm", organ: "Kidney", connection: "Restorative movement; reduce stimulation" },
  { time: "7–9pm", organ: "Pericardium", connection: "Gentle socialising; wind down begins" },
  { time: "9–11pm", organ: "Triple Burner", connection: "Wind down; avoid screens; prepare for sleep" },
  { time: "11pm–1am", organ: "Gallbladder", connection: "Deep sleep; cellular repair" },
  { time: "1–3am", organ: "Liver", connection: "Liver detoxification; deepest sleep" },
];

// ── Dosha Quiz ──
export type DoshaType = "vata" | "pitta" | "kapha";

export interface DoshaResult {
  dosha: DoshaType;
  description: string;
  priorities: string[];
  recommendedPacks: string[];
}

export const DOSHA_RESULTS: Record<DoshaType, DoshaResult> = {
  vata: {
    dosha: "vata",
    description: "Vata types are creative, energetic, and sensitive. When imbalanced: anxiety, insomnia, dry skin, irregular digestion.",
    priorities: ["Grounding", "Warmth", "Regularity", "Oil", "Early bedtime"],
    recommendedPacks: ["ayurvedic-morning", "nervous-system-reset"],
  },
  pitta: {
    dosha: "pitta",
    description: "Pitta types are focused, driven, and warm. When imbalanced: irritability, inflammation, skin rashes, burnout.",
    priorities: ["Cooling", "Nature", "Rest", "Anti-inflammatory", "Boundaries"],
    recommendedPacks: ["daily-essentials", "gut-foundation"],
  },
  kapha: {
    dosha: "kapha",
    description: "Kapha types are steady, nurturing, and strong. When imbalanced: lethargy, weight gain, resistance to change.",
    priorities: ["Stimulation", "Cold exposure", "Movement", "Fasting window", "Variety"],
    recommendedPacks: ["daily-essentials", "gut-foundation"],
  },
};
