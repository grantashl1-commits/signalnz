import type { HabitCategory } from "@/data/self-care-rituals";

export interface LibraryHabit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  evidenceNote: string;
  image: string;
  category: HabitCategory;
}

export const HABIT_LIBRARY: LibraryHabit[] = [
  // ── Self Care ──
  {
    id: "lib-morning-meditation",
    name: "Morning Meditation",
    description: "10 minutes of quiet breathing or mindfulness to calm the nervous system.",
    frequency: "Daily",
    evidenceNote: "Meditation is supported by strong research for stress reduction, attention, and emotional regulation.",
    image: "/images/habits/morning-meditation.png",
    category: "self-care",
  },
  {
    id: "lib-evening-breathwork",
    name: "Evening Breathwork",
    description: "Slow breathing (4-7-8 or box breathing) to activate the parasympathetic nervous system.",
    frequency: "Nightly",
    evidenceNote: "Slow breathing lowers heart rate and improves sleep quality.",
    image: "/images/habits/evening-breathwork.png",
    category: "self-care",
  },
  {
    id: "lib-gratitude-practice",
    name: "Gratitude Practice",
    description: "Write three things you are grateful for today.",
    frequency: "Daily",
    evidenceNote: "Gratitude journaling is associated with improved mood and life satisfaction.",
    image: "/images/habits/gratitude-practice.png",
    category: "self-care",
  },
  {
    id: "lib-time-in-nature",
    name: "Time in Nature",
    description: "Spend time outdoors in green space.",
    frequency: "Daily or weekly",
    evidenceNote: "Nature exposure reduces cortisol and improves mood.",
    image: "/images/habits/time-in-nature.png",
    category: "self-care",
  },
  {
    id: "lib-digital-sunset",
    name: "Digital Sunset",
    description: "No screens 60 minutes before sleep.",
    frequency: "Nightly",
    evidenceNote: "Reducing evening blue light supports melatonin production.",
    image: "/images/habits/digital-sunset.png",
    category: "self-care",
  },
  {
    id: "lib-sauna-session",
    name: "Sauna Session",
    description: "15–20 minutes of heat exposure.",
    frequency: "3–4× weekly",
    evidenceNote: "Sauna use is associated with cardiovascular and longevity benefits in cohort studies.",
    image: "/images/habits/sauna-session.png",
    category: "self-care",
  },
  {
    id: "lib-cold-shower",
    name: "Cold Shower",
    description: "Finish shower with 30–60 seconds of cold water.",
    frequency: "Optional daily",
    evidenceNote: "Cold exposure increases alertness and norepinephrine.",
    image: "/images/habits/cold-shower.png",
    category: "self-care",
  },

  // ── Nutrition ──
  {
    id: "lib-30-plants",
    name: "Eat 30 Plant Foods Weekly",
    description: "Aim for 30 different plant foods across the week.",
    frequency: "Weekly goal",
    evidenceNote: "Higher plant diversity is linked to healthier gut microbiome profiles.",
    image: "/images/habits/eat-30-plants.png",
    category: "nutrition",
  },
  {
    id: "lib-fermented-food",
    name: "Fermented Food",
    description: "Include yoghurt, kefir, kimchi, or sauerkraut.",
    frequency: "Daily",
    evidenceNote: "Fermented foods may support microbiome diversity and inflammation reduction.",
    image: "/images/habits/fermented-food.png",
    category: "nutrition",
  },
  {
    id: "lib-oily-fish",
    name: "Oily Fish",
    description: "Salmon, sardines, or mackerel.",
    frequency: "2× weekly",
    evidenceNote: "Rich source of omega-3 fatty acids linked to cardiovascular health.",
    image: "/images/habits/oily-fish.png",
    category: "nutrition",
  },
  {
    id: "lib-protein-breakfast",
    name: "Protein Breakfast",
    description: "Eat 20–30g protein at breakfast.",
    frequency: "Daily",
    evidenceNote: "Protein supports satiety and blood sugar stability.",
    image: "/images/habits/protein-breakfast.png",
    category: "nutrition",
  },
  {
    id: "lib-leafy-greens",
    name: "Leafy Greens",
    description: "Add leafy greens to meals.",
    frequency: "Daily",
    evidenceNote: "Greens provide fiber, folate, and polyphenols.",
    image: "/images/habits/leafy-greens.png",
    category: "nutrition",
  },
  {
    id: "lib-mindful-eating",
    name: "Mindful Eating",
    description: "Eat without screens or distractions.",
    frequency: "Daily",
    evidenceNote: "Mindful eating improves digestion and satiety awareness.",
    image: "/images/habits/mindful-eating.png",
    category: "nutrition",
  },

  // ── Movement ──
  {
    id: "lib-daily-steps",
    name: "Daily Steps",
    description: "Walk throughout the day.",
    frequency: "Daily",
    evidenceNote: "Higher step counts are linked with lower mortality risk.",
    image: "/images/habits/daily-steps.png",
    category: "movement",
  },
  {
    id: "lib-strength-training",
    name: "Strength Training",
    description: "Resistance training for muscle and bone health.",
    frequency: "2–3× weekly",
    evidenceNote: "Strength training supports metabolic health and longevity.",
    image: "/images/habits/strength-training.png",
    category: "movement",
  },
  {
    id: "lib-zone-2-cardio",
    name: "Zone 2 Cardio",
    description: "Steady conversational-pace cardio.",
    frequency: "30–45 min",
    evidenceNote: "Zone 2 improves mitochondrial function and metabolic fitness.",
    image: "/images/habits/zone-2-cardio.png",
    category: "movement",
  },
  {
    id: "lib-mobility-stretching",
    name: "Mobility or Stretching",
    description: "Gentle stretching for joints and muscles.",
    frequency: "Daily",
    evidenceNote: "Improves flexibility and reduces injury risk.",
    image: "/images/habits/mobility-stretching.png",
    category: "movement",
  },
  {
    id: "lib-yoga-pilates",
    name: "Yoga or Pilates",
    description: "Mindful movement and breath coordination.",
    frequency: "Weekly",
    evidenceNote: "Associated with improved flexibility, stress reduction, and core strength.",
    image: "/images/habits/yoga-pilates.png",
    category: "movement",
  },
  {
    id: "lib-movement-break",
    name: "Movement Break",
    description: "Stand or walk briefly each hour.",
    frequency: "Hourly",
    evidenceNote: "Breaking up sedentary time improves metabolic health.",
    image: "/images/habits/movement-break.png",
    category: "movement",
  },
];

export function getLibraryHabitsForCategory(category: HabitCategory): LibraryHabit[] {
  return HABIT_LIBRARY.filter(h => h.category === category);
}
