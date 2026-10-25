import type { Currency, GameState } from "./state";
import { UPGRADES, upgradeCost, type UpgradeDef } from "./upgrades";

export const HOLES_PER_HELPER_PER_SEC = 0.5;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

export function treatsPerHole(s: GameState): number {
  return 1 + 0.5 * s.upgrades.nose.level;
}

export function bonesPerHole(s: GameState): number {
  return 0.1 * s.upgrades.boneDigger.level;
}

export function holesPerSecond(s: GameState): number {
  const speed = 1 + 0.25 * s.upgrades.goodBoy.level;
  return s.upgrades.helpers.level * HOLES_PER_HELPER_PER_SEC * speed;
}

function earn(s: GameState, currency: Currency, amount: number): void {
  s.currencies[currency] += amount;
  s.lifetime[currency] += amount;
}

function checkUnlocks(s: GameState): void {
  for (const def of UPGRADES) {
    const u = s.upgrades[def.id];
    if (!u.unlocked && s.currencies[def.currency] >= def.baseCost) u.unlocked = true;
  }
}

export function dig(s: GameState, holes: number): void {
  if (holes <= 0) return;
  s.holesDug += holes;
  earn(s, "treats", holes * treatsPerHole(s));
  earn(s, "bones", holes * bonesPerHole(s));
  checkUnlocks(s);
}

/** Advance passive production by `seconds`. Rates are constant within a tick, so this is exact. */
export function tick(s: GameState, seconds: number): void {
  dig(s, holesPerSecond(s) * seconds);
}

/** Advance the game to `now`, capping how much time away is credited. Returns seconds simulated. */
export function catchUp(s: GameState, now: number): number {
  const seconds = Math.min(Math.max(0, (now - s.lastTick) / 1000), MAX_OFFLINE_SECONDS);
  tick(s, seconds);
  s.lastTick = now;
  return seconds;
}

export function costOf(s: GameState, def: UpgradeDef): number {
  return upgradeCost(def, s.upgrades[def.id].level);
}

export function canAfford(s: GameState, def: UpgradeDef): boolean {
  return s.currencies[def.currency] >= costOf(s, def);
}

export function buy(s: GameState, def: UpgradeDef): boolean {
  if (!canAfford(s, def)) return false;
  s.currencies[def.currency] -= costOf(s, def);
  s.upgrades[def.id].level += 1;
  return true;
}

export function isRevealed(s: GameState, currency: Currency): boolean {
  return s.lifetime[currency] > 0;
}
