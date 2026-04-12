import { describe, it, expect, beforeEach } from "vitest";
import {
  PROMPTS, TRACKING, MILESTONES, ENTRY_TYPES,
  loadEntries, saveEntries, loadVault, saveVault,
  loadMilestones, saveMilestones,
} from "../journal-store";

describe("journal-store constants", () => {
  it("has at least 5 journal prompts", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(5);
  });

  it("each prompt has key, label, and placeholder", () => {
    for (const p of PROMPTS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.ph).toBeTruthy();
    }
  });

  it("has mood and energy tracking", () => {
    const keys = TRACKING.map(t => t.key);
    expect(keys).toContain("mood");
    expect(keys).toContain("energy");
  });

  it("milestones are in ascending order", () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].count).toBeGreaterThan(MILESTONES[i - 1].count);
    }
  });

  it("entry types have unique keys", () => {
    const keys = ENTRY_TYPES.map(e => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("journal-store localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadEntries returns empty array when nothing stored", () => {
    expect(loadEntries()).toEqual([]);
  });

  it("saveEntries and loadEntries round-trip", () => {
    const entries = [
      { id: "1", date: "2025-01-01", timestamp: 1000, prompts: {}, tracking: {}, tags: [], ai: null },
    ];
    saveEntries(entries);
    const loaded = loadEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("1");
  });

  it("loadVault returns empty array when nothing stored", () => {
    expect(loadVault()).toEqual([]);
  });

  it("saveVault and loadVault round-trip", () => {
    const vault = [
      { id: "v1", entryId: "1", category: "gratitude", title: "Test", preview: "", date: "2025-01-01", timestamp: 1000 },
    ];
    saveVault(vault);
    expect(loadVault()).toHaveLength(1);
  });

  it("loadMilestones returns empty array when nothing stored", () => {
    expect(loadMilestones()).toEqual([]);
  });

  it("saveMilestones and loadMilestones round-trip", () => {
    const ms = [{ milestoneType: "weekly", count: 7, date: "2025-01-07", analysis: null }];
    saveMilestones(ms);
    expect(loadMilestones()).toHaveLength(1);
  });
});
