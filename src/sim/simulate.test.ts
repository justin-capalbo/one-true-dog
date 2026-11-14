import { describe, expect, it } from "vitest";
import { simulate } from "./simulate";

describe("simulate", () => {
  it("an active player reaches the pack within the Yard's target window", () => {
    const { t, events } = simulate();
    expect(events.some((e) => e.text.includes("pack"))).toBe(true);
    // Pacing guard: the Yard should take roughly 5 to 30 minutes of active play.
    expect(t).toBeGreaterThan(5 * 60);
    expect(t).toBeLessThan(30 * 60);
  });

  it("is deterministic", () => {
    expect(simulate({ maxSec: 300 }).events).toEqual(simulate({ maxSec: 300 }).events);
  });
});
