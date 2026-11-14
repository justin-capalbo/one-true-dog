import type { GameState } from "./state";

/** Hiring this many helpers ends the Yard era. Keep the "pack" milestone text in sync. */
export const PACK_SIZE = 10;

export interface Milestone {
  id: string;
  text: string;
  reached: (s: GameState) => boolean;
}

// Story beats and unlocks, in rough play order. The UI logs each one as it is reached
// and the simulator prints when it happens, so this list doubles as the pacing checklist.
export const MILESTONES: readonly Milestone[] = [
  { id: "firstHole", text: "You dig your first hole. There is a treat in it.", reached: (s) => s.holesDug >= 1 },
  { id: "helpers", text: "A stray dog watches you dig. It looks hungry.", reached: (s) => s.upgrades.helpers.unlocked },
  { id: "firstHelper", text: "The stray starts digging next to you.", reached: (s) => s.upgrades.helpers.level >= 1 },
  { id: "nose", text: "You catch the scent of something better buried deeper.", reached: (s) => s.upgrades.nose.unlocked },
  { id: "boneDigger", text: "Your paw scrapes something hard. A bone?", reached: (s) => s.upgrades.boneDigger.unlocked },
  { id: "firstBone", text: "You find your first bone.", reached: (s) => s.lifetime.bones >= 1 },
  { id: "goodBoy", text: "The helpers would work harder for a bone or two.", reached: (s) => s.upgrades.goodBoy.unlocked },
  { id: "holes100", text: "The yard has a hundred holes in it.", reached: (s) => s.holesDug >= 100 },
  { id: "holes1000", text: "There is more hole than yard now.", reached: (s) => s.holesDug >= 1000 },
  { id: "fiveHelpers", text: "Five dogs now. The neighbors have noticed.", reached: (s) => s.upgrades.helpers.level >= 5 },
  { id: "holes5000", text: "The fence is leaning. Something under it gave way.", reached: (s) => s.holesDug >= 5000 },
  {
    id: "pack",
    text: "Ten dogs dig as one. They are becoming a pack.",
    reached: (s) => s.upgrades.helpers.level >= PACK_SIZE,
  },
];

export function reachedMilestones(s: GameState): Set<string> {
  return new Set(MILESTONES.filter((m) => m.reached(s)).map((m) => m.id));
}
