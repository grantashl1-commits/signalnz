// RITUAL20 — The BYRÉ Morning & Evening Ritual
// Source: RITUAL20 by Renee (BYRÉ). A 20-day challenge to build a
// nourishing morning and evening routine around the 3 M's
// (Matcha, Movement, Mindfulness) and 3 evening rituals
// (After Dark Coco, Legs Up The Wall, Brain Unload Journalling).

export type Ritual20Group =
  | "morning-foundation"
  | "morning-non-negotiable"
  | "morning-extra"
  | "evening-foundation"
  | "evening-non-negotiable"
  | "evening-extra";

export interface Ritual20Item {
  id: string;
  name: string;
  group: Ritual20Group;
  timing: "morning" | "evening";
  duration: string;
  notes: string;
}

export const RITUAL20_GROUPS: { key: Ritual20Group; label: string; tagline: string }[] = [
  { key: "morning-foundation", label: "The 3 M's — Morning Foundation", tagline: "Matcha. Mindfulness. Movement." },
  { key: "morning-non-negotiable", label: "Morning Non-Negotiables", tagline: "Protect your energy before the day begins." },
  { key: "morning-extra", label: "Morning Extras", tagline: "Deepen the practice when you have space." },
  { key: "evening-foundation", label: "Evening Foundation", tagline: "Nourish your nervous system. Wind down." },
  { key: "evening-non-negotiable", label: "Evening Non-Negotiables", tagline: "Signal to the body it's time to rest." },
  { key: "evening-extra", label: "Evening Extras", tagline: "Layer in for a deeper wind-down." },
];

export const RITUAL20_ITEMS: Ritual20Item[] = [
  // ── Morning Foundation (3 M's) ──
  {
    id: "r20-hvm-matcha",
    name: "High Vibe Matcha",
    group: "morning-foundation",
    timing: "morning",
    duration: "10 min",
    notes: "Your habit anchor. Ceremonial matcha + adaptogens (reishi, ashwagandha, maca, lion's mane). Sip slowly.",
  },
  {
    id: "r20-movement",
    name: "Morning Movement",
    group: "morning-foundation",
    timing: "morning",
    duration: "15–45 min",
    notes: "Pilates, yoga, walking, running, swimming, weights or rebounding. Move in a way that elevates your energy.",
  },
  {
    id: "r20-mindfulness",
    name: "Mindfulness",
    group: "morning-foundation",
    timing: "morning",
    duration: "10–20 min",
    notes: "Journalling, reading something inspiring, meditation, or sitting in stillness. Come back to yourself.",
  },

  // ── Morning Non-Negotiables ──
  {
    id: "r20-no-phone-am",
    name: "Phone on Airplane Mode",
    group: "morning-non-negotiable",
    timing: "morning",
    duration: "Until ritual ends",
    notes: "Protect the early morning. Stay off your phone until your ritual is complete and your energy is grounded.",
  },
  {
    id: "r20-morning-light",
    name: "Morning Light",
    group: "morning-non-negotiable",
    timing: "morning",
    duration: "5–15 min",
    notes: "Sun on your face. Outside with your matcha, journal, or walk. Sets your circadian rhythm for the day.",
  },

  // ── Morning Extras ──
  { id: "r20-lemon-water", name: "Warm Lemon Water", group: "morning-extra", timing: "morning", duration: "5 min", notes: "First thing on waking. Gentle for digestion and hydration." },
  { id: "r20-gua-sha-am", name: "Gua Sha", group: "morning-extra", timing: "morning", duration: "5–10 min", notes: "Facial gua sha with oil. Drains lymph, brightens skin." },
  { id: "r20-dry-brushing", name: "Dry Body Brushing", group: "morning-extra", timing: "morning", duration: "3–5 min", notes: "Before shower on dry skin. Long strokes toward the heart." },
  { id: "r20-sauna", name: "Sauna", group: "morning-extra", timing: "morning", duration: "20–30 min", notes: "Infrared or traditional. Hydrate well." },
  { id: "r20-red-light-am", name: "Red Light Mask", group: "morning-extra", timing: "morning", duration: "10–15 min", notes: "Use while sipping your matcha or journalling." },
  { id: "r20-cold-shower", name: "Cold Shower or Ice Bath", group: "morning-extra", timing: "morning", duration: "30 sec – 3 min", notes: "Finish your shower cold, or take a full plunge. Builds resilience." },
  { id: "r20-rebounding", name: "Rebounding", group: "morning-extra", timing: "morning", duration: "5–15 min", notes: "Mini-trampoline. Activates the lymphatic system. Bonus points outside in morning light." },
  { id: "r20-green-juice", name: "Cold Pressed Green Juice", group: "morning-extra", timing: "morning", duration: "5 min", notes: "Concentrated greens for a nutrient hit before breakfast." },
  { id: "r20-olive-oil-shot", name: "Olive Oil & Lemon Shot", group: "morning-extra", timing: "morning", duration: "1 min", notes: "Tablespoon of good olive oil with lemon. Supports digestion and skin." },
  { id: "r20-nourishment", name: "Nourishing Breakfast", group: "morning-extra", timing: "morning", duration: "20–30 min", notes: "Protein, healthy fats and colour. Eat in the morning sun if you can." },

  // ── Evening Foundation ──
  {
    id: "r20-after-dark-coco",
    name: "After Dark Coco",
    group: "evening-foundation",
    timing: "evening",
    duration: "15 min",
    notes: "Warming cacao ritual that signals wind-down. Sip slowly — phone away.",
  },
  {
    id: "r20-legs-up-wall",
    name: "Legs Up The Wall",
    group: "evening-foundation",
    timing: "evening",
    duration: "10–15 min",
    notes: "Restorative pose to calm the nervous system. Breathe slowly through the nose.",
  },
  {
    id: "r20-brain-unload",
    name: "Brain Unload Journalling",
    group: "evening-foundation",
    timing: "evening",
    duration: "2–10 min",
    notes: "Empty your mind onto the page. Bullet points are enough. Keep the journal by the bed.",
  },

  // ── Evening Non-Negotiables ──
  {
    id: "r20-no-phone-pm",
    name: "Phone Down (Evening)",
    group: "evening-non-negotiable",
    timing: "evening",
    duration: "1 hr before bed",
    notes: "Phone away an hour before bed. Protect your wind-down and your sleep.",
  },
  {
    id: "r20-early-to-bed",
    name: "Early to Bed",
    group: "evening-non-negotiable",
    timing: "evening",
    duration: "Lights out by 10pm",
    notes: "Aim for lights out by 10pm to honour your circadian rhythm.",
  },

  // ── Evening Extras ──
  { id: "r20-everything-shower", name: "Everything Shower", group: "evening-extra", timing: "evening", duration: "20–40 min", notes: "Hair mask, body scrub, full ritual. A reset for the body and mind." },
  { id: "r20-gua-sha-pm", name: "Gua Sha / Facial Massage", group: "evening-extra", timing: "evening", duration: "5–10 min", notes: "Slower, more meditative in the evening. Drains the day from the face." },
  { id: "r20-red-light-pm", name: "Red Light Therapy", group: "evening-extra", timing: "evening", duration: "10–20 min", notes: "Supports skin and signals wind-down. Lovely paired with journalling." },
  { id: "r20-breathwork", name: "Breathwork", group: "evening-extra", timing: "evening", duration: "5–15 min", notes: "Box breathing, 4-7-8 or extended exhales. Down-regulates the nervous system." },
  { id: "r20-visualisation", name: "Visualisation / Manifestation", group: "evening-extra", timing: "evening", duration: "5–10 min", notes: "Imagine tomorrow already going well. Plant the seed before sleep." },
  { id: "r20-reading", name: "Reading", group: "evening-extra", timing: "evening", duration: "15–30 min", notes: "Something nourishing — not your phone, not work." },
];
