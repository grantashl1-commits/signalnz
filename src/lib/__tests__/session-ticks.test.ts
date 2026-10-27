import { beforeEach, describe, expect, it } from "vitest";
import { clearSessionTicks, getSessionTicks, setSessionTick } from "../session-ticks";

describe("session ticks", () => {
  beforeEach(() => localStorage.clear());

  it("counts rounds per exercise, keeps only the session in progress, and clears on finish", () => {
    setSessionTick("strength::w1::d1", "Goblet Squat", 1);
    setSessionTick("strength::w1::d1", "Goblet Squat", 2);
    setSessionTick("strength::w1::d1", "Push-Up", 1);
    expect(getSessionTicks("strength::w1::d1")).toEqual({ "Goblet Squat": 2, "Push-Up": 1 });
    setSessionTick("strength::w1::d1", "Push-Up", 0);
    expect(getSessionTicks("strength::w1::d1")).toEqual({ "Goblet Squat": 2 });
    // Starting the next session drops yesterday's ticks.
    setSessionTick("strength::w1::d3", "Bird Dog", 1);
    expect(getSessionTicks("strength::w1::d1")).toEqual({});
    clearSessionTicks("strength::w1::d3");
    expect(getSessionTicks("strength::w1::d3")).toEqual({});
  });
});
