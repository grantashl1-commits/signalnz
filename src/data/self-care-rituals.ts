import { Phase } from "@/lib/cycle-utils";

export interface SelfCareRitual {
  id: string;
  name: string;
  category: string;
  icon: string; // key for SVG lookup
  suggestedDuration: string;
  timing: string;
  notesPlaceholder: string;
}

export const RITUAL_CATEGORIES = [
  "Light & Energy Therapy",
  "Cold Therapy",
  "Bodywork & Recovery",
  "Bathing & Soaking",
  "Facial & Skin",
  "Mindful Movement & Restoration",
  "Wellness Experiences",
] as const;

export const SELF_CARE_RITUALS: SelfCareRitual[] = [
  // Light & Energy Therapy
  { id: "red-light-mask", name: "Red Light Mask", category: "Light & Energy Therapy", icon: "redLightMask", suggestedDuration: "10–20 min", timing: "Morning or evening", notesPlaceholder: "Full face or targeted area." },
  { id: "pemf-mat", name: "PEMF Mat", category: "Light & Energy Therapy", icon: "pemfMat", suggestedDuration: "20–40 min", timing: "Morning or before bed", notesPlaceholder: "Great for recovery days." },
  { id: "hocatt-ozone", name: "HOCATT / Ozone Sauna", category: "Light & Energy Therapy", icon: "ozoneSauna", suggestedDuration: "25–30 min", timing: "As scheduled", notesPlaceholder: "Hydrate well before and after." },
  { id: "infrared-sauna", name: "Infrared Sauna", category: "Light & Energy Therapy", icon: "infraredSauna", suggestedDuration: "20–45 min", timing: "Post-workout or evening", notesPlaceholder: "Electrolytes after. NZ tip: try Clearlight or local wellness studios." },
  { id: "red-light-panel", name: "Red Light Panel", category: "Light & Energy Therapy", icon: "redLightPanel", suggestedDuration: "10–15 min", timing: "Morning", notesPlaceholder: "Distance 15–30cm from skin." },

  // Cold Therapy
  { id: "ice-plunge", name: "Ice Plunge / Cold Bath", category: "Cold Therapy", icon: "icePlunge", suggestedDuration: "2–5 min", timing: "Morning", notesPlaceholder: "Start at 30 sec and build up." },
  { id: "cold-shower", name: "Cold Shower", category: "Cold Therapy", icon: "coldShower", suggestedDuration: "30–60 sec cold at end", timing: "End of shower", notesPlaceholder: "Finish every shower cold." },

  // Bodywork & Recovery
  { id: "massage-gun", name: "Massage Gun", category: "Bodywork & Recovery", icon: "massageGun", suggestedDuration: "5–10 min", timing: "Post-workout or evening", notesPlaceholder: "Focus on tight areas. Avoid joints and spine." },
  { id: "foam-rolling", name: "Foam Rolling", category: "Bodywork & Recovery", icon: "foamRoller", suggestedDuration: "10–15 min", timing: "Post-workout", notesPlaceholder: "Slow and deliberate. 30 sec per area minimum." },
  { id: "lymphatic-drainage", name: "Lymphatic Drainage Massage", category: "Bodywork & Recovery", icon: "lymphaticDrainage", suggestedDuration: "15–30 min", timing: "Morning, before shower", notesPlaceholder: "Always move toward the heart. Light pressure only." },
  { id: "professional-massage", name: "Professional Massage", category: "Bodywork & Recovery", icon: "professionalMassage", suggestedDuration: "60–90 min", timing: "As booked", notesPlaceholder: "Log the date and how you felt." },
  { id: "gua-sha", name: "Gua Sha", category: "Bodywork & Recovery", icon: "guaSha", suggestedDuration: "5–10 min", timing: "Morning skincare", notesPlaceholder: "Use with facial oil. Always upward strokes." },
  { id: "dry-body-brushing", name: "Dry Body Brushing", category: "Bodywork & Recovery", icon: "dryBrushing", suggestedDuration: "5 min", timing: "Before shower, dry skin", notesPlaceholder: "Long strokes toward heart. Supports lymphatic flow." },

  // Bathing & Soaking
  { id: "epsom-salt-bath", name: "Epsom Salt Bath", category: "Bathing & Soaking", icon: "epsomBath", suggestedDuration: "20–30 min", timing: "Evening", notesPlaceholder: "2 cups Epsom salts. Add lavender oil for luteal phase." },
  { id: "magnesium-flake-bath", name: "Magnesium Flake Bath", category: "Bathing & Soaking", icon: "magnesiumBath", suggestedDuration: "20–30 min", timing: "Evening, especially luteal", notesPlaceholder: "Magnesium absorbs transdermally — great PMS support." },
  { id: "castor-oil-pack", name: "Castor Oil Pack", category: "Bathing & Soaking", icon: "castorOilPack", suggestedDuration: "45–60 min", timing: "Evening, 3–4x per week", notesPlaceholder: "Avoid during menstruation and if pregnant." },

  // Facial & Skin
  { id: "biocellulose-mask", name: "Biocellulose Face Mask", category: "Facial & Skin", icon: "faceMask", suggestedDuration: "15–20 min", timing: "1–2x per week", notesPlaceholder: "Best in ovulatory phase when skin is most receptive." },
  { id: "facial-massage", name: "Facial Massage", category: "Facial & Skin", icon: "facialMassage", suggestedDuration: "5–10 min", timing: "Morning or evening", notesPlaceholder: "Lymphatic drainage technique or buccal massage." },
  { id: "scalp-massage", name: "Scalp Massage", category: "Facial & Skin", icon: "scalpMassage", suggestedDuration: "5 min", timing: "During shower or dry", notesPlaceholder: "Stimulates follicles. Try rosemary oil." },

  // Mindful Movement & Restoration
  { id: "yin-yoga", name: "Yin Yoga / Restorative Yoga", category: "Mindful Movement & Restoration", icon: "yinYoga", suggestedDuration: "20–45 min", timing: "Evening or menstrual/luteal", notesPlaceholder: "Ideal in menstrual and luteal phases." },
  { id: "stretching-mobility", name: "Stretching / Mobility", category: "Mindful Movement & Restoration", icon: "stretching", suggestedDuration: "10–20 min", timing: "Morning or post-workout", notesPlaceholder: "Hold each stretch 45–60 seconds minimum." },

  // Wellness Experiences
  { id: "spa-day", name: "Spa Day", category: "Wellness Experiences", icon: "spaDay", suggestedDuration: "As scheduled", timing: "As scheduled", notesPlaceholder: "Log how you felt before and after." },
  { id: "float-tank", name: "Float Tank / REST", category: "Wellness Experiences", icon: "floatTank", suggestedDuration: "60–90 min", timing: "As booked", notesPlaceholder: "Magnesium absorption + deep nervous system reset." },
  { id: "acupuncture", name: "Acupuncture", category: "Wellness Experiences", icon: "acupuncture", suggestedDuration: "As scheduled", timing: "As scheduled", notesPlaceholder: "Note which points and your response." },
  { id: "sound-bath", name: "Sound Bath", category: "Wellness Experiences", icon: "soundBath", suggestedDuration: "45–60 min", timing: "As attended", notesPlaceholder: "Great for luteal and menstrual phases." },
];

export const PHASE_RITUAL_SUGGESTIONS: Record<Phase, { ritualId: string; reason: string }[]> = {
  menstrual: [
    { ritualId: "epsom-salt-bath", reason: "Magnesium helps reduce cramping and supports progesterone drop." },
    { ritualId: "castor-oil-pack", reason: "Supports uterine circulation and eases pelvic tension." },
    { ritualId: "yin-yoga", reason: "Gentle restoration honours your body's need for rest in inner winter." },
  ],
  follicular: [
    { ritualId: "infrared-sauna", reason: "Rising estrogen increases heat tolerance. Great detox window." },
    { ritualId: "dry-body-brushing", reason: "Lymphatic system is more responsive in the follicular phase." },
    { ritualId: "facial-massage", reason: "Collagen production peaks with estrogen. Maximum benefit now." },
  ],
  ovulatory: [
    { ritualId: "lymphatic-drainage", reason: "High estrogen supports fluid movement — ideal for drainage work." },
    { ritualId: "red-light-mask", reason: "Skin is at peak radiance — amplify with red light therapy." },
    { ritualId: "biocellulose-mask", reason: "Skin is at peak hydration and receptivity at ovulation." },
  ],
  luteal: [
    { ritualId: "magnesium-flake-bath", reason: "Progesterone depletes magnesium. Transdermal absorption supports mood and reduces PMS." },
    { ritualId: "pemf-mat", reason: "Electromagnetic therapy reduces inflammation as prostaglandins rise." },
    { ritualId: "foam-rolling", reason: "Muscle tension increases in luteal phase. Regular rolling prevents buildup." },
  ],
};

export type HabitCategory = "supplements" | "nutrition" | "movement" | "self-care";

export const HABIT_CATEGORIES: { id: HabitCategory; label: string; color: string }[] = [
  { id: "supplements", label: "Supplements", color: "hsl(var(--sage-mist))" },
  { id: "nutrition", label: "Nutrition", color: "hsl(var(--petal-gold))" },
  { id: "movement", label: "Movement", color: "hsl(var(--coral-flame))" },
  { id: "self-care", label: "Self Care", color: "hsl(var(--bloom-blush))" },
];

export const CATEGORY_DOT_CLASSES: Record<string, string> = {
  supplements: "bg-sage-mist",
  nutrition: "bg-petal-gold",
  movement: "bg-coral",
  "self-care": "bg-bloom",
  // legacy categories mapped to self-care
  wellness: "bg-bloom",
  mindset: "bg-bloom",
  custom: "bg-sketch",
};

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory | string; // string for legacy categories
  duration?: string;
  timing?: string;
  notes?: string;
  createdAt: string;
}

// localStorage helpers
export function getHabits(): Habit[] {
  const val = localStorage.getItem("mindcast_habits");
  return val ? JSON.parse(val) : [];
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem("mindcast_habits", JSON.stringify(habits));
}

export function addHabit(habit: Habit): void {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
}

export function removeHabit(id: string): void {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
}

export function getHabitLog(date: string): Record<string, boolean> {
  const val = localStorage.getItem(`habitLog:${date}`);
  return val ? JSON.parse(val) : {};
}

export function setHabitLog(date: string, log: Record<string, boolean>): void {
  localStorage.setItem(`habitLog:${date}`, JSON.stringify(log));
}

export function toggleHabitForDate(date: string, habitId: string): boolean {
  const log = getHabitLog(date);
  log[habitId] = !log[habitId];
  setHabitLog(date, log);
  return log[habitId];
}

export function getWeekHabitData(weekDays: Date[]): { date: string; log: Record<string, boolean> }[] {
  return weekDays.map(d => {
    const dateStr = d.toISOString().split("T")[0];
    return { date: dateStr, log: getHabitLog(dateStr) };
  });
}
