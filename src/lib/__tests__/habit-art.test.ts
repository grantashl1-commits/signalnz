import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  getHabitArt,
  getRitualArt,
  habitArtCoverage,
  habitsMissingArt,
  hasHabitArt,
  ritualArtCoverage,
} from "@/lib/habit-art";
import HABIT_ART_MAP from "@/data/habit-art-map.json";
import RITUAL_ART_MAP from "@/data/ritual-art-map.json";
import { HABIT_LIBRARY } from "@/data/habit-library";
import { SELF_CARE_RITUALS } from "@/data/self-care-rituals";

const habits = HABIT_LIBRARY as unknown as { id: string; name: string }[];

describe("habit illustrations", () => {
  it("maps every habit in the library", () => {
    const missing = habits.filter((h) => !(h.id in (HABIT_ART_MAP as { map: object }).map));
    expect(missing.map((h) => h.id)).toEqual([]);
  });

  it("has no entries for habits that do not exist", () => {
    const ids = new Set(habits.map((h) => h.id));
    const bogus = Object.keys((HABIT_ART_MAP as { map: object }).map).filter((k) => !ids.has(k));
    expect(bogus).toEqual([]);
  });

  it("points only at files that actually exist on disk", () => {
    const broken: string[] = [];
    for (const [id, entry] of Object.entries((HABIT_ART_MAP as { map: Record<string, { image: string | null }> }).map)) {
      if (!entry.image) continue;
      if (!existsSync(`public/images/habits/${entry.image}.png`)) broken.push(`${id} -> ${entry.image}.png`);
    }
    expect(broken).toEqual([]);
  });

  it("returns a stable public URL, not a filesystem path", () => {
    expect(getHabitArt("lib-probiotics")).toBe("/images/habits/probiotics.png");
    expect(getHabitArt("lib-morning-walk")).toBe("/images/habits/morning-walk.png");
  });

  it("gives distinct habits distinct art rather than reusing one picture", () => {
    // These four used to collapse onto the meditation illustration when art was
    // matched by name. They are different habits and must not share a picture.
    const distinct = ["lib-morning-meditation", "lib-morning-sunlight", "lib-morning-journal", "lib-screen-free-morning"];
    const arts = distinct.map((id) => getHabitArt(id)).filter(Boolean);
    expect(new Set(arts).size).toBe(arts.length);

    // Vitamin D must not resolve to the vitamin C pill.
    expect(getHabitArt("lib-vitamin-c")).not.toBe(getHabitArt("lib-vitamin-d3"));
  });

  it("reports coverage without claiming art it does not have", () => {
    const { total, illustrated } = habitArtCoverage();
    expect(total).toBe(habits.length);
    expect(illustrated).toBeLessThanOrEqual(total);
    expect(illustrated + habitsMissingArt().length).toBe(total);
  });

  it("is safe for unknown or empty ids", () => {
    expect(getHabitArt(undefined)).toBeUndefined();
    expect(getHabitArt(null)).toBeUndefined();
    expect(getHabitArt("not-a-habit")).toBeUndefined();
    expect(hasHabitArt("not-a-habit")).toBe(false);
    expect(hasHabitArt("lib-probiotics")).toBe(true);
  });
});

describe("self-care ritual illustrations", () => {
  const rituals = SELF_CARE_RITUALS as unknown as { id: string; name: string }[];
  const ritualMap = (RITUAL_ART_MAP as { map: Record<string, { image: string | null }> }).map;

  it("maps every ritual", () => {
    expect(rituals.filter((r) => !(r.id in ritualMap)).map((r) => r.id)).toEqual([]);
  });

  it("has no entries for rituals that do not exist", () => {
    const ids = new Set(rituals.map((r) => r.id));
    expect(Object.keys(ritualMap).filter((k) => !ids.has(k))).toEqual([]);
  });

  it("points only at files that exist, so the device artwork is genuinely used", () => {
    const broken: string[] = [];
    for (const [id, e] of Object.entries(ritualMap)) {
      if (!e.image) continue;
      if (!existsSync(`public/images/habits/${e.image}.png`)) broken.push(`${id} -> ${e.image}.png`);
    }
    expect(broken).toEqual([]);
  });

  it("resolves the self-care devices that used to look like orphans", () => {
    // These ten files sat in public/images/habits with nothing pointing at them
    // because they illustrate SELF_CARE_RITUALS, not HABIT_LIBRARY.
    const devices = [
      "foam-rolling",
      "gua-sha",
      "hocatt-ozone",
      "ice-plunge",
      "infrared-sauna",
      "lymphatic-drainage",
      "massage-gun",
      "pemf-mat",
      "professional-massage",
      "red-light-mask",
    ];
    for (const id of devices) {
      expect(getRitualArt(id), `${id} should have art`).toMatch(/^\/images\/habits\/.+\.png$/);
    }
  });

  it("illustrates the whole ritual set", () => {
    const { total, illustrated } = ritualArtCoverage();
    expect(total).toBe(rituals.length);
    expect(illustrated).toBe(total);
  });

  it("is safe for unknown ritual ids", () => {
    expect(getRitualArt(undefined)).toBeUndefined();
    expect(getRitualArt("not-a-ritual")).toBeUndefined();
  });
});
