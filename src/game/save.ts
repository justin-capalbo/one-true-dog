import { newGame, SAVE_VERSION, type GameState } from "./state";

const KEY = "one-true-dog/save";

/** Merge a parsed save over a fresh game so saves from older versions pick up new fields. */
export function deserialize(raw: string, now = Date.now()): GameState {
  const fresh = newGame(now);
  const data = JSON.parse(raw) as Partial<GameState>;
  if (typeof data !== "object" || data === null) return fresh;
  return {
    ...fresh,
    ...data,
    version: SAVE_VERSION,
    currencies: { ...fresh.currencies, ...data.currencies },
    lifetime: { ...fresh.lifetime, ...data.lifetime },
    upgrades: Object.fromEntries(
      Object.entries(fresh.upgrades).map(([id, u]) => [
        id,
        { ...u, ...data.upgrades?.[id as keyof GameState["upgrades"]] },
      ]),
    ) as GameState["upgrades"],
  };
}

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

export function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return deserialize(raw);
  } catch (err) {
    console.warn("Could not load save, starting fresh", err);
  }
  return newGame();
}

export function save(s: GameState): void {
  try {
    localStorage.setItem(KEY, serialize(s));
  } catch (err) {
    console.warn("Could not save", err);
  }
}

export function wipe(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable; nothing to wipe.
  }
}
