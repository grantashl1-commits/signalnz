import { describe, it, expect, beforeEach } from "vitest";
import { getAvailableCardIds, canDrawToday, recordDraw, getLastDrawDate } from "../wisdom-cooldown";

describe("wisdom-cooldown", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("canDrawToday returns true when no draws recorded", () => {
    expect(canDrawToday()).toBe(true);
  });

  it("canDrawToday returns false after recording a draw today", () => {
    recordDraw("card-1");
    expect(canDrawToday()).toBe(false);
  });

  it("getLastDrawDate returns null when no draws", () => {
    expect(getLastDrawDate()).toBeNull();
  });

  it("getLastDrawDate returns a Date after recording", () => {
    recordDraw("card-1");
    const last = getLastDrawDate();
    expect(last).toBeInstanceOf(Date);
  });

  it("getAvailableCardIds filters recently drawn cards", () => {
    const allIds = ["a", "b", "c", "d"];
    recordDraw("b");
    const available = getAvailableCardIds(allIds);
    expect(available).not.toContain("b");
    expect(available).toContain("a");
    expect(available).toContain("c");
  });

  it("getAvailableCardIds returns all when all on cooldown", () => {
    const allIds = ["a", "b"];
    recordDraw("a");
    recordDraw("b");
    const available = getAvailableCardIds(allIds);
    expect(available).toEqual(allIds);
  });
});
