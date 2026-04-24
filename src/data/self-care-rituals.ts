import { Phase } from "@/lib/cycle-utils";

export interface SelfCareRitual {
  id: string;
  name: string;
  category: string;
  icon: string;
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

// ── Expanded Phase Rituals with TCM + Ayurveda ──

export interface PhaseRitualSuggestion {
  ritualId: string;
  reason: string;
  modern?: string;
  tcm?: string;
  ayurveda?: string;
}

export const PHASE_RITUAL_SUGGESTIONS: Record<Phase, PhaseRitualSuggestion[]> = {
  menstrual: [
    {
      ritualId: "epsom-salt-bath",
      reason: "Magnesium helps reduce cramping and supports progesterone drop.",
      modern: "Magnesium absorption supports progesterone drop and reduces cramping.",
      tcm: "Warms the Uterus meridian; dispels cold and stagnation.",
      ayurveda: "Warming oil baths (Abhyanga) are prescribed for Vata pacification — this is the modern equivalent.",
    },
    {
      ritualId: "castor-oil-pack",
      reason: "Supports uterine circulation and eases pelvic tension.",
      modern: "Supports uterine circulation and reduces pelvic inflammation (prostaglandins).",
      tcm: "Moves Liver Qi stagnation — the root cause of painful periods in TCM.",
      ayurveda: "External oleation (Snehana) — applying oil to the lower abdomen is Vata-pacifying and warming.",
    },
    {
      ritualId: "yin-yoga",
      reason: "Gentle restoration honours your body's need for rest in inner winter.",
      modern: "Parasympathetic activation reduces cortisol and pain perception.",
      tcm: "Long-held poses open meridian pathways; kidney and bladder meridians run through the inner legs.",
      ayurveda: "Gentle Vata-pacifying movement; avoid inversions during menstruation.",
    },
    {
      ritualId: "sound-bath",
      reason: "Deep sound vibration supports nervous system reset during the low-energy phase.",
      modern: "Sound frequencies activate the vagus nerve and shift brainwaves to alpha/theta states.",
      tcm: "Sound vibration opens meridian channels; supports Kidney energy which governs the menstrual cycle.",
      ayurveda: "Nada yoga (sound practice) pacifies Vata — the dominant energy during menstruation.",
    },
    {
      ritualId: "acupuncture",
      reason: "Acupuncture during menstruation can reduce pain and regulate flow.",
      modern: "SP6 acupoint on the inner ankle has been studied for menstrual pain reduction.",
      tcm: "SP6 tonifies the Spleen, Liver and Kidney meridians simultaneously — the three most important for menstrual health.",
      ayurveda: "Marma point stimulation on the inner leg corresponds to Apana Vata (downward moving energy) regulation.",
    },
    {
      ritualId: "scalp-massage",
      reason: "Gentle scalp massage promotes relaxation and blood flow during your lowest-energy phase.",
      modern: "Scalp massage activates parasympathetic response and promotes circulation to the head.",
      tcm: "The Bladder and Gallbladder meridians cross the scalp — gentle stimulation supports restful energy.",
      ayurveda: "Shiro Abhyanga (head massage with warm oil) is prescribed for calming Vata and promoting deep sleep.",
    },
  ],
  follicular: [
    {
      ritualId: "infrared-sauna",
      reason: "Rising estrogen increases heat tolerance. Great detox window.",
      modern: "Rising oestrogen increases heat tolerance and cardiovascular response to heat; ideal detox window.",
      tcm: "Activates the Heart and Small Intestine meridians (fire element) — supports Qi circulation.",
      ayurveda: "Swedana (therapeutic sweat) is an Ayurvedic detoxification practice; reduces Kapha heaviness of early follicular.",
    },
    {
      ritualId: "dry-body-brushing",
      reason: "Lymphatic system is more responsive in the follicular phase.",
      modern: "Lymphatic circulation increases with rising oestrogen — stimulation has maximum effect now.",
      tcm: "Opens the Wei Qi (defensive energy) at the skin surface; stimulates Lung meridian which governs skin.",
      ayurveda: "Garshana (dry brushing) is a classic Dinacharya practice to stimulate lymph and remove ama (toxins).",
    },
    {
      ritualId: "facial-massage",
      reason: "Collagen production peaks with estrogen. Maximum benefit now.",
      modern: "Collagen production peaks with oestrogen — facial massage increases circulation and amplifies this.",
      tcm: "Facial meridian pathways connect to Stomach, Large Intestine, and Liver — facial gua sha moves Qi through all three.",
      ayurveda: "Mukha Abhyanga (facial self-massage with warm oil) is prescribed in the morning Dinacharya.",
    },
    {
      ritualId: "cold-shower",
      reason: "Rising energy and oestrogen make the follicular phase ideal for building cold tolerance.",
      modern: "Cold exposure activates the sympathetic-then-parasympathetic rebound; dopamine increase up to 250%.",
      tcm: "Tones the Kidney Yang (vital energy); stimulates Wei Qi.",
      ayurveda: "Cool water in the morning (after oil massage) awakens Prana and activates the nervous system.",
    },
    {
      ritualId: "lymphatic-drainage",
      reason: "Oestrogen increase in follicular phase supports lymphatic responsiveness.",
      modern: "Oestrogen increase supports lymphatic responsiveness — best phase for manual drainage.",
      tcm: "Moves stuck fluids along San Jiao (Triple Burner) meridian which governs fluid metabolism.",
      ayurveda: "Abhyanga stimulates the lymphatic system and removes Ama; prescribed daily in Dinacharya.",
    },
    {
      ritualId: "red-light-panel",
      reason: "Red light therapy supports collagen and cellular energy as oestrogen rises.",
      modern: "Red light photobiomodulation increases mitochondrial ATP — amplified by rising oestrogen.",
      tcm: "Red light corresponds to Fire element energy — aligning with the rising Yang of the follicular phase.",
      ayurveda: "Light therapy corresponds to Tejas (subtle fire) cultivation — building cellular intelligence.",
    },
  ],
  ovulatory: [
    {
      ritualId: "lymphatic-drainage",
      reason: "High estrogen supports fluid movement — ideal for drainage work.",
      modern: "High oestrogen supports maximum fluid movement — best phase for lymphatic work.",
      tcm: "Supports Spleen function (fluid transformation and transportation) which is robust at this phase.",
      ayurveda: "Deep Abhyanga with cooling oils (coconut, brahmi) moves lymph and pacifies building Pitta.",
    },
    {
      ritualId: "red-light-mask",
      reason: "Skin is at peak radiance — amplify with red light therapy.",
      modern: "Skin at peak radiance and receptivity — red light ATP production amplified by oestrogen.",
      tcm: "Red light stimulates the Heart meridian (fire element dominant at ovulation); supports Shen.",
      ayurveda: "Light therapy corresponds to Tejas (subtle fire) cultivation — amplifying natural radiance.",
    },
    {
      ritualId: "biocellulose-mask",
      reason: "Skin is at peak hydration and receptivity at ovulation.",
      modern: "Skin at peak hydration and permeability — active ingredients absorb best now.",
      tcm: "Lung meridian governs the skin — peak skin health reflects robust Lung Qi and Blood.",
      ayurveda: "Mukha Lepa (herbal face mask) with nourishing herbs prescribed at peak vitality periods.",
    },
    {
      ritualId: "ice-plunge",
      reason: "Peak oestrogen gives you highest heat tolerance and fastest cold adaptation.",
      modern: "Peak oestrogen — highest heat tolerance and fastest cold adaptation; dopamine sustained up to 3 hours.",
      tcm: "Tonifies Kidney Yang while clearing excess Heat from the Heart at ovulation.",
      ayurveda: "Pitta peaks at ovulation — cooling practices balance excess heat. Recommended in Pitta-dominant seasons.",
    },
    {
      ritualId: "sound-bath",
      reason: "At ovulation, the voice is at its peak frequency — sound vibration is amplified.",
      modern: "Vagal tone activated by humming; at ovulation, the voice is literally at its peak frequency.",
      tcm: "Sound vibration opens meridian channels; Heart meridian (dominant now) governs joy and communication.",
      ayurveda: "Mantra and Nada yoga at this phase amplify Prana through the throat chakra (Vishuddha).",
    },
    {
      ritualId: "gua-sha",
      reason: "Facial gua sha at ovulation maximises collagen and circulation benefits.",
      modern: "Peak skin radiance and collagen production make facial treatments most effective now.",
      tcm: "Gua sha moves stagnant Qi and Blood in the facial meridians — maximum benefit at peak energy.",
      ayurveda: "Facial massage with cooling oils balances Pitta heat and enhances natural radiance.",
    },
  ],
  luteal: [
    {
      ritualId: "magnesium-flake-bath",
      reason: "Progesterone depletes magnesium. Transdermal absorption supports mood and reduces PMS.",
      modern: "Progesterone depletes magnesium; transdermal absorption bypasses GI limitations; reduces PMS, cramping, and sleep disruption.",
      tcm: "Warming water practices support the Liver meridian which is prone to stagnation in the luteal phase.",
      ayurveda: "Warm Snehana (oil + water immersion) is the primary Vata-pacifying therapy; late luteal is the most Vata-aggravated phase.",
    },
    {
      ritualId: "pemf-mat",
      reason: "Electromagnetic therapy reduces inflammation as prostaglandins rise.",
      modern: "Reduces inflammation as prostaglandins rise in late luteal; supports mitochondrial function.",
      tcm: "Electromagnetic stimulation corresponds to Qi movement through meridians; reduces PMS stagnation.",
      ayurveda: "Corresponds to subtle Prana Vata regulation — electromagnetic fields are subtle energy in Ayurvedic framework.",
    },
    {
      ritualId: "foam-rolling",
      reason: "Muscle tension increases in luteal phase. Regular rolling prevents buildup.",
      modern: "Progesterone increases muscle tension and fascia density — regular myofascial release prevents buildup.",
      tcm: "The Liver meridian runs through the inner thighs — rolling these areas moves Liver Qi and reduces PMS.",
      ayurveda: "Marma point massage along the legs stimulates Apana Vata and reduces late luteal stagnation.",
    },
    {
      ritualId: "yin-yoga",
      reason: "Long-held hip stretches counteract the muscle guarding pattern driven by rising prostaglandins.",
      modern: "Long-held hip flexor and inner leg stretches counteract muscle guarding driven by rising prostaglandins.",
      tcm: "Kidney, Liver, and Spleen meridians all run through the inner legs — yin holds of 3–5 min open these channels.",
      ayurveda: "Vata-pacifying yoga: supported poses, no inversions, held for 3–5 min with warm blanket.",
    },
    {
      ritualId: "castor-oil-pack",
      reason: "Applied over the liver, castor oil supports Phase 2 liver detox of excess hormones.",
      modern: "Castor oil (ricinoleic acid) reduces inflammation; applied over the liver supports Phase 2 detoxification.",
      tcm: "Directly supports the Liver organ — the most critical organ for hormonal regulation in TCM.",
      ayurveda: "External oleation over the liver area pacifies Pitta and supports Rasa Dhatu purification.",
    },
    {
      ritualId: "epsom-salt-bath",
      reason: "Warming bath with magnesium supports the body's need for grounding in late luteal.",
      modern: "Magnesium supports progesterone metabolism and reduces the cortisol spike of the late luteal phase.",
      tcm: "Warm water moves stuck Liver Qi — the primary pattern behind PMS in traditional Chinese medicine.",
      ayurveda: "Warm immersion is the most Vata-pacifying practice available — essential in the most Vata-aggravated phase.",
    },
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
  wellness: "bg-bloom",
  mindset: "bg-bloom",
  custom: "bg-sketch",
};

export type HabitFrequencyType = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory | string;
  frequencyType?: HabitFrequencyType;
  duration?: string;
  timing?: string;
  notes?: string;
  createdAt: string;
}

// localStorage helpers
export function getHabits(): Habit[] {
  try {
    const val = localStorage.getItem("mindcast_habits");
    return val ? JSON.parse(val) : [];
  } catch { return []; }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem("mindcast_habits", JSON.stringify(habits));
  window.dispatchEvent(new StorageEvent("storage", { key: "mindcast_habits" }));
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
