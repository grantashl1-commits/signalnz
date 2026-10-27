/**
 * Turns a member's "My Dream Life looks like…" entry into suggestions she reviews
 * during onboarding: which ways of moving fit, and a few small daily habits.
 * Plain word matching, so it works offline and never invents anything she didn't
 * write about; she keeps or drops every suggestion herself.
 */
import type { JournalEntry } from "@/lib/journal-store";
import type { Habit, HabitCategory } from "@/data/self-care-rituals";

export interface DreamHabit { name: string; category: HabitCategory }
export interface DreamSuggestions { goals: string[]; habits: DreamHabit[] }

// Goal ids match OnboardingFlow's MOVEMENT_GOALS.
const SIGNALS: Array<{ re: RegExp; goal?: string; habit?: DreamHabit }> = [
  { re: /\b(strong|stronger|strength|lift|lifting|capable|carry)\b/i, goal: "strength", habit: { name: "Move my body for 20 minutes", category: "movement" } },
  { re: /\b(calm|calmer|peace|peaceful|stress|stressed|anxious|anxiety|quiet|slow|slower|breathe)\b/i, goal: "stress", habit: { name: "Five slow breaths before bed", category: "self-care" } },
  { re: /\b(energy|energised|energized|run|running|fitter|stamina|breath)\b/i, goal: "cardio", habit: { name: "Walk outside after lunch", category: "movement" } },
  { re: /\b(flexible|mobility|stiff|ease|freely|pain|injury|injured|back)\b/i, goal: "mobility", habit: { name: "Five minutes of stretching", category: "movement" } },
  { re: /\b(weight|lighter|confident|clothes|tone|toned)\b/i, goal: "fat_loss" },
  { re: /\b(marathon|race|event|wedding|holiday|hike|trip)\b/i, goal: "event" },
  { re: /\b(sleep|sleeping|rest|rested|bed|bedtime)\b/i, habit: { name: "Lights out by 10pm", category: "self-care" } },
  { re: /\b(eat|eating|food|cook|cooking|nourish|nourished|meals|vegetables|veggies)\b/i, habit: { name: "Vegetables at two meals", category: "nutrition" } },
  { re: /\b(kids|children|family|partner|husband|wife|friends|present)\b/i, habit: { name: "Ten phone-free minutes with my people", category: "self-care" } },
  { re: /\b(write|writing|journal|reflect|grateful|gratitude)\b/i, habit: { name: "Write one line of gratitude", category: "self-care" } },
  { re: /\b(water|hydrated|hydration)\b/i, habit: { name: "A glass of water with each meal", category: "nutrition" } },
];

const GENTLE_START: DreamSuggestions = {
  goals: ["consistency"],
  habits: [{ name: "Move my body for 20 minutes", category: "movement" }, { name: "Write one line of gratitude", category: "self-care" }],
};

export function reflectOnDream(text: string): DreamSuggestions {
  const goals: string[] = [];
  const habits: DreamHabit[] = [];
  for (const s of SIGNALS) {
    if (!s.re.test(text)) continue;
    if (s.goal && !goals.includes(s.goal)) goals.push(s.goal);
    if (s.habit && !habits.some(h => h.name === s.habit!.name)) habits.push(s.habit);
  }
  if (!goals.length && !habits.length) return GENTLE_START;
  return { goals: goals.slice(0, 3), habits: habits.slice(0, 4) };
}

/** Her dream, saved as her first journal entry. */
export function dreamJournalEntry(text: string, now = new Date()): JournalEntry {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  return {
    id: crypto.randomUUID(),
    date,
    timestamp: now.getTime(),
    prompts: { desire: text.trim() },
    tracking: {},
    tags: ["dream-life"],
    ai: null,
    entryType: "dream-entry",
    title: "My Dream Life looks like…",
    emotionalTone: "dream",
  };
}

/** The habits she kept, ready for the habit list (skipping any she already has). */
export function habitsFromDream(chosen: DreamHabit[], existing: Habit[], now = new Date()): Habit[] {
  const have = new Set(existing.map(h => h.name.toLowerCase()));
  return chosen.filter(h => !have.has(h.name.toLowerCase())).map(h => ({
    id: crypto.randomUUID(),
    name: h.name,
    category: h.category,
    frequencyType: "daily",
    createdAt: now.toISOString(),
  }));
}
