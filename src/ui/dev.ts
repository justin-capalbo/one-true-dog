import { grant, tick } from "../game/engine";
import { PRESETS } from "../game/presets";
import type { GameState } from "../game/state";
import { el } from "./dom";

export interface DevControls {
  devEnabled: boolean;
  state: () => GameState;
  setState: (s: GameState) => void;
  speed: () => number;
  setSpeed: (x: number) => void;
}

const SPEEDS = [1, 10, 100, 1000];

/** Dev-only panel: game speed, free resources, time skips and save presets. */
export function mountDevTools(dev: DevControls): HTMLElement {
  const panel = el("details", "dev");
  panel.open = true;
  panel.append(el("summary", undefined, "dev tools"));

  const row = (label: string, ...buttons: HTMLElement[]) => {
    const r = el("div", "dev-row");
    r.append(el("span", "dev-label", label), ...buttons);
    panel.append(r);
  };
  const button = (text: string, onClick: () => void) => {
    const b = el("button", "dev-btn", text);
    b.addEventListener("click", onClick);
    return b;
  };

  const speedBtns = SPEEDS.map((x) =>
    button(`${x}x`, () => {
      dev.setSpeed(x);
      speedBtns.forEach((b, i) => b.classList.toggle("active", SPEEDS[i] === x));
    }),
  );
  speedBtns[SPEEDS.indexOf(dev.speed())]?.classList.add("active");
  row("speed", ...speedBtns);

  row(
    "grant",
    button("+1K treats", () => grant(dev.state(), "treats", 1e3)),
    button("+1M treats", () => grant(dev.state(), "treats", 1e6)),
    button("+100 bones", () => grant(dev.state(), "bones", 100)),
  );
  row(
    "skip",
    button("1 min", () => tick(dev.state(), 60)),
    button("10 min", () => tick(dev.state(), 600)),
    button("1 hour", () => tick(dev.state(), 3600)),
  );
  row("preset", ...PRESETS.map((p) => button(p.name, () => dev.setState(p.make(Date.now())))));

  return panel;
}
