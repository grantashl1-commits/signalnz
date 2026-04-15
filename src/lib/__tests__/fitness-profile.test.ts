import { describe, it, expect } from "vitest";
import { getNutritionTargetForGoal } from "../fitness-profile";

describe("getNutritionTargetForGoal", () => {
  it("returns default target for unknown goal slug", () => {
    const target = getNutritionTargetForGoal("nonexistent");
    expect(target.proteinMin).toBeGreaterThan(0);
    expect(target.carbEmphasis).toBeDefined();
  });

  it("returns correct target for muscle_building", () => {
    const target = getNutritionTargetForGoal("muscle_building");
    expect(target.proteinMin).toBe(1.6);
    expect(target.proteinMax).toBe(2.2);
    expect(target.carbEmphasis).toBe("moderate");
  });

  it("calculates daily protein when weight is provided", () => {
    const target = getNutritionTargetForGoal("muscle_building", 65);
    expect(target.dailyProteinMin).toBe(Math.round(65 * 1.6));
    expect(target.dailyProteinMax).toBe(Math.round(65 * 2.2));
  });

  it("does not set daily protein when no weight provided", () => {
    const target = getNutritionTargetForGoal("muscle_building");
    expect(target.dailyProteinMin).toBeUndefined();
  });

  it("bumps protein for perimenopause", () => {
    const target = getNutritionTargetForGoal("gentle_movement", 60, "perimenopause");
    expect(target.proteinMin).toBeGreaterThanOrEqual(1.6);
    expect(target.proteinMax).toBeGreaterThanOrEqual(2.0);
  });

  it("bumps protein for post_menopause", () => {
    const target = getNutritionTargetForGoal("gentle_movement", 60, "post_menopause");
    expect(target.proteinMin).toBeGreaterThanOrEqual(1.6);
  });

  it("returns fat_loss target with lower carb emphasis", () => {
    const target = getNutritionTargetForGoal("fat_loss_cardio");
    expect(target.carbEmphasis).toBe("lower");
  });
});
