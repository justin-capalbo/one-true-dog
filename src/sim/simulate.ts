import { buy, canAfford, costOf, dig, tick } from "../game/engine";
import { MILESTONES } from "../game/milestones";
import { newGame, type GameState } from "../game/state";
import { UPGRADES } from "../game/upgrades";

export interface SimOptions {
  /** Hand-dig clicks per second. 0 plays fully idle once helpers exist. */
  clicksPerSec: number;
  /** Stop clicking after this many seconds, like a player who wanders off. */
  clickForSec: number;
  /** Give up after this many simulated seconds. */
  maxSec: number;
  /** Simulation step in seconds. */
  step: number;
  /** Stop once this milestone is reached. */
  stopAt: string;
}

export const DEFAULT_SIM: SimOptions = {
  clicksPerSec: 3,
  clickForSec: Infinity,
  maxSec: 24 * 60 * 60,
  step: 0.5,
  stopAt: "pack",
};

export interface SimEvent {
  t: number;
  kind: "milestone" | "buy";
  text: string;
}

/**
 * Plays the game with a simple greedy strategy: dig at a steady click rate and buy the
 * cheapest affordable upgrade whenever one is affordable. Not optimal play, but stable,
 * so re-running after a balance change shows how pacing moved.
 */
export function simulate(opts: Partial<SimOptions> = {}): { events: SimEvent[]; state: GameState; t: number } {
  const o = { ...DEFAULT_SIM, ...opts };
  const s = newGame(0);
  const events: SimEvent[] = [];
  const seen = new Set<string>();
  let t = 0;
  let clickCarry = 0;

  const record = () => {
    for (const m of MILESTONES) {
      if (!seen.has(m.id) && m.reached(s)) {
        seen.add(m.id);
        events.push({ t, kind: "milestone", text: m.text });
      }
    }
  };

  while (t < o.maxSec && !seen.has(o.stopAt)) {
    if (t < o.clickForSec) {
      clickCarry += o.clicksPerSec * o.step;
      const clicks = Math.floor(clickCarry);
      clickCarry -= clicks;
      for (let i = 0; i < clicks; i++) dig(s, 1);
    }
    tick(s, o.step);
    t += o.step;
    record();

    for (;;) {
      const options = UPGRADES.filter((d) => s.upgrades[d.id].unlocked && canAfford(s, d));
      if (options.length === 0) break;
      const pick = options.reduce((a, b) => (costOf(s, a) <= costOf(s, b) ? a : b));
      const cost = costOf(s, pick);
      buy(s, pick);
      events.push({
        t,
        kind: "buy",
        text: `${pick.name} -> ${s.upgrades[pick.id].level} (${Math.ceil(cost)} ${pick.currency})`,
      });
      record();
    }
  }
  return { events, state: s, t };
}

export function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
