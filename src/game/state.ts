export type Currency = "treats" | "bones";

export const CURRENCIES: readonly Currency[] = ["treats", "bones"];

export type UpgradeId = "helpers" | "nose" | "boneDigger" | "goodBoy";

export interface GameState {
  version: number;
  currencies: Record<Currency, number>;
  lifetime: Record<Currency, number>;
  holesDug: number;
  upgrades: Record<UpgradeId, { level: number; unlocked: boolean }>;
  lastTick: number;
}

export const SAVE_VERSION = 1;

export function newGame(now = Date.now()): GameState {
  return {
    version: SAVE_VERSION,
    currencies: { treats: 0, bones: 0 },
    lifetime: { treats: 0, bones: 0 },
    holesDug: 0,
    upgrades: {
      helpers: { level: 0, unlocked: false },
      nose: { level: 0, unlocked: false },
      boneDigger: { level: 0, unlocked: false },
      goodBoy: { level: 0, unlocked: false },
    },
    lastTick: now,
  };
}
