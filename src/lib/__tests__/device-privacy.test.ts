import { beforeEach, describe, expect, it } from "vitest";
import { claimDevice } from "../device-privacy";

describe("device privacy", () => {
  beforeEach(() => localStorage.clear());

  it("keeps everything when the same person signs back in", () => {
    localStorage.setItem("mindcast_journal_v2", "[1]");
    expect(claimDevice("a")).toBe(false);
    expect(claimDevice("a")).toBe(false);
    expect(localStorage.getItem("mindcast_journal_v2")).toBe("[1]");
  });

  it("clears the last person's entries when a different account signs in", () => {
    claimDevice("a");
    localStorage.setItem("mindcast_journal_v2", "[1]");
    localStorage.setItem("symptoms:2026-10-01", "x");
    localStorage.setItem("signal_habits", "[]");
    localStorage.setItem("sb-project-auth-token", "keep");
    expect(claimDevice("b")).toBe(true);
    expect(localStorage.getItem("mindcast_journal_v2")).toBeNull();
    expect(localStorage.getItem("symptoms:2026-10-01")).toBeNull();
    expect(localStorage.getItem("signal_habits")).toBeNull();
    expect(localStorage.getItem("sb-project-auth-token")).toBe("keep");
    expect(localStorage.getItem("signal_device_owner")).toBe("b");
  });

  it("never clears for a Connect partner's private sign-in", () => {
    claimDevice("a");
    localStorage.setItem("mindcast_journal_v2", "[1]");
    expect(claimDevice("anon", true)).toBe(false);
    expect(localStorage.getItem("mindcast_journal_v2")).toBe("[1]");
  });
});
