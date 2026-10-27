import { describe, expect, it } from "vitest";
import { isChunkLoadError } from "@/lib/lazy-with-retry";

describe("chunk load error detection", () => {
  it("recognises the messages browsers actually raise for a failed dynamic import", () => {
    // Chrome / Safari / Firefox wording
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: /assets/Practice-abc123.js"))).toBe(true);
    expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
    expect(isChunkLoadError(new Error("Loading chunk 42 failed."))).toBe(true);
    expect(isChunkLoadError(new TypeError("NetworkError when attempting to fetch resource."))).toBe(true);
    // webpack-style, in case a tool ever surfaces it
    expect(isChunkLoadError(new Error("ChunkLoadError: Loading chunk vendors failed"))).toBe(true);
    // matches on name too
    const named = new Error("nope") as Error & { name: string };
    named.name = "ChunkLoadError";
    expect(isChunkLoadError(named)).toBe(true);
  });

  it("does not retry a genuine bug in the module", () => {
    // A real error thrown while the chunk evaluates must surface immediately
    // rather than being retried and then reloading the page.
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
    expect(isChunkLoadError(new Error("Maximum update depth exceeded"))).toBe(false);
    expect(isChunkLoadError(new Error(""))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});
