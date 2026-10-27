import { describe, expect, it } from "vitest";
import { dreamJournalEntry, habitsFromDream, reflectOnDream } from "../dream-reflection";

describe("dream reflection", () => {
  it("suggests ways to move and habits from what she wrote", () => {
    const s = reflectOnDream("I wake up rested, feel strong enough to carry my kids, and I'm calm when the day gets busy.");
    expect(s.goals).toEqual(["strength", "stress"]);
    expect(s.habits.map(h => h.name)).toEqual(expect.arrayContaining(["Lights out by 10pm", "Ten phone-free minutes with my people"]));
    expect(s.habits.length).toBeLessThanOrEqual(4);
  });

  it("offers a gentle start when nothing matches", () => {
    expect(reflectOnDream("Sunshine.").goals).toEqual(["consistency"]);
  });

  it("saves the dream as a dream journal entry and skips habits she already has", () => {
    const entry = dreamJournalEntry("Slow mornings.", new Date(2026, 9, 27));
    expect(entry).toMatchObject({ date: "2026-10-27", entryType: "dream-entry", prompts: { desire: "Slow mornings." } });
    const added = habitsFromDream([{ name: "Lights out by 10pm", category: "self-care" }, { name: "Walk outside after lunch", category: "movement" }],
      [{ id: "1", name: "lights out by 10pm", category: "self-care", createdAt: "" }]);
    expect(added.map(h => h.name)).toEqual(["Walk outside after lunch"]);
  });
});
