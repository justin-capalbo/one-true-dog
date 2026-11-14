import { describe, expect, it } from "vitest";
import { buy, catchUp, dig, holesPerSecond, MAX_OFFLINE_SECONDS, tick } from "./engine";
import { deserialize, serialize } from "./save";
import { newGame } from "./state";
import { UPGRADES } from "./upgrades";

const def = (id: string) => UPGRADES.find((u) => u.id === id)!;

describe("engine", () => {
  it("digging by hand earns one treat per hole", () => {
    const s = newGame(0);
    dig(s, 3);
    expect(s.holesDug).toBe(3);
    expect(s.currencies.treats).toBe(3);
  });

  it("unlocks an upgrade once you can first afford it", () => {
    const s = newGame(0);
    dig(s, 9);
    expect(s.upgrades.helpers.unlocked).toBe(false);
    dig(s, 1);
    expect(s.upgrades.helpers.unlocked).toBe(true);
  });

  it("buying spends the currency and raises the next cost", () => {
    const s = newGame(0);
    dig(s, 10);
    expect(buy(s, def("helpers"))).toBe(true);
    expect(s.currencies.treats).toBe(0);
    expect(s.upgrades.helpers.level).toBe(1);
    expect(buy(s, def("helpers"))).toBe(false);
  });

  it("helpers dig passively over time", () => {
    const s = newGame(0);
    s.upgrades.helpers.level = 2;
    tick(s, 10);
    expect(s.holesDug).toBeCloseTo(holesPerSecond(s) * 10);
  });

  it("caps offline progress", () => {
    const s = newGame(0);
    s.upgrades.helpers.level = 1;
    const simulated = catchUp(s, (MAX_OFFLINE_SECONDS + 1000) * 1000);
    expect(simulated).toBe(MAX_OFFLINE_SECONDS);
  });
});

describe("save", () => {
  it("round-trips state", () => {
    const s = newGame(0);
    dig(s, 42);
    expect(deserialize(serialize(s), 0)).toEqual(s);
  });

  it("fills fields missing from older saves", () => {
    const loaded = deserialize(JSON.stringify({ holesDug: 5, upgrades: { helpers: { level: 2 } } }), 0);
    expect(loaded.holesDug).toBe(5);
    expect(loaded.upgrades.helpers).toEqual({ level: 2, unlocked: false });
    expect(loaded.upgrades.goodBoy.level).toBe(0);
    expect(loaded.currencies.bones).toBe(0);
  });
});
