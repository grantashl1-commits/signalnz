import { describe, expect, it } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import catalogue from "@/data/stretch-illustrations.json";

const SHIPPED = resolve(process.cwd(), "public/images/stretches");

const entries = catalogue as Array<{
  id: string;
  name: string;
  target: string;
  wash: string | null;
  pose: string;
}>;

describe("stretch illustration catalogue", () => {
  it("describes the shipped set", () => {
    expect(entries).toHaveLength(14);
  });

  it("gives every entry a clean slug id and a detailed pose", () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of entries) {
      // The id is also the shipped filename, so it must stay a safe slug.
      expect(e.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.target.length).toBeGreaterThan(0);
      expect(e.pose.length).toBeGreaterThan(40);
    }
  });

  it("has shipped artwork for every entry", () => {
    for (const e of entries) {
      const file = resolve(SHIPPED, `${e.id}.png`);
      expect(existsSync(file), `missing artwork: ${e.id}.png`).toBe(true);
    }
  });

  it("has no shipped artwork without a catalogue entry", () => {
    const catalogued = new Set(entries.map((e) => `${e.id}.png`));
    const shipped = readdirSync(SHIPPED).filter((f) => f.endsWith(".png"));
    const orphans = shipped.filter((f) => !catalogued.has(f));
    expect(orphans).toEqual([]);
  });
});
