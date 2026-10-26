import type { Currency, GameState, UpgradeId } from "./state";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  currency: Currency;
  baseCost: number;
  costGrowth: number;
  describe: (s: GameState) => string;
}

// Defined as data so adding an upgrade is one entry here plus its effect in engine.ts.
export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "helpers",
    name: "Helper Dogs",
    currency: "treats",
    baseCost: 10,
    costGrowth: 2.2,
    describe: (s) => `${s.upgrades.helpers.level} hired. Each digs on their own.`,
  },
  {
    id: "nose",
    name: "Nose for Treats",
    currency: "treats",
    baseCost: 25,
    costGrowth: 1.6,
    describe: (s) => `+0.5 treats per hole (level ${s.upgrades.nose.level}).`,
  },
  {
    id: "boneDigger",
    name: "Bone Digger",
    currency: "treats",
    baseCost: 150,
    costGrowth: 2,
    describe: (s) => `+0.1 bones per hole (level ${s.upgrades.boneDigger.level}).`,
  },
  {
    id: "goodBoy",
    name: "Good Boy Training",
    currency: "bones",
    baseCost: 3,
    costGrowth: 2.2,
    describe: (s) => `Helpers dig 25% faster (level ${s.upgrades.goodBoy.level}).`,
  },
];

export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.ceil(def.baseCost * def.costGrowth ** level);
}
