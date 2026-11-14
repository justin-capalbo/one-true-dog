import { newGame, type GameState } from "./state";

export interface Preset {
  name: string;
  make: (now: number) => GameState;
}

/** Save states parked at points worth testing, so nobody has to play up to them. */
export const PRESETS: readonly Preset[] = [
  { name: "Fresh start", make: (now) => newGame(now) },
  {
    name: "First helpers",
    make: (now) => {
      const s = newGame(now);
      s.holesDug = 40;
      s.currencies.treats = 25;
      s.lifetime.treats = 60;
      s.upgrades.helpers = { level: 2, unlocked: true };
      s.upgrades.nose = { level: 0, unlocked: true };
      return s;
    },
  },
  {
    name: "Bones flowing",
    make: (now) => {
      const s = newGame(now);
      s.holesDug = 800;
      s.currencies = { treats: 150, bones: 4 };
      s.lifetime = { treats: 2500, bones: 12 };
      s.upgrades.helpers = { level: 5, unlocked: true };
      s.upgrades.nose = { level: 5, unlocked: true };
      s.upgrades.boneDigger = { level: 2, unlocked: true };
      s.upgrades.goodBoy = { level: 1, unlocked: true };
      return s;
    },
  },
  {
    name: "End of the Yard",
    make: (now) => {
      const s = newGame(now);
      // A few seconds short of the last helper.
      s.holesDug = 9000;
      s.currencies = { treats: 12000, bones: 40 };
      s.lifetime = { treats: 90000, bones: 900 };
      s.upgrades.helpers = { level: 9, unlocked: true };
      s.upgrades.nose = { level: 12, unlocked: true };
      s.upgrades.boneDigger = { level: 6, unlocked: true };
      s.upgrades.goodBoy = { level: 8, unlocked: true };
      return s;
    },
  },
];
