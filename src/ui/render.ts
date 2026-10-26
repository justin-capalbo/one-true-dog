import { bonesPerSecond, buy, canAfford, costOf, dig, isRevealed, treatsPerHole, treatsPerSecond } from "../game/engine";
import { MILESTONES, PACK_SIZE, reachedMilestones } from "../game/milestones";
import { CURRENCIES, type Currency, type GameState } from "../game/state";
import { UPGRADES } from "../game/upgrades";
import { mountDevTools, type DevControls } from "./dev";
import { el } from "./dom";
import { fmt, fmtDuration } from "./format";

const LOG_LIMIT = 60;

export interface UIControls extends DevControls {
  state: () => GameState;
  reset: () => void;
}

/**
 * Builds the DOM once and returns an `update` that patches text and visibility each frame.
 * Game logic stays in ../game; this layer only reads state and forwards clicks.
 * Layout follows Kittens Game: resources on the left, actions in the middle, a log on the right.
 */
export function mountUI(root: HTMLElement, ui: UIControls, offlineSeconds: number) {
  root.replaceChildren();

  // Left: resources.
  const left = el("aside", "col col-resources");
  const resTable = el("table", "res-table");
  const resRows = new Map<Currency | "holes", { row: HTMLTableRowElement; amount: HTMLElement; rate: HTMLElement }>();
  for (const key of [...CURRENCIES, "holes"] as const) {
    const row = el("tr");
    const amount = el("td", "num");
    const rate = el("td", "num rate");
    row.append(el("td", "res-name", key), amount, rate);
    resTable.append(row);
    resRows.set(key, { row, amount, rate });
  }
  left.append(resTable);

  // Middle: era tabs and actions.
  const middle = el("main", "col col-main");
  const tabs = el("nav", "tabs");
  tabs.append(el("span", "tab active", "Yard"));
  const goal = el("p", "goal");
  const actions = el("div", "actions");

  const digBtn = el("button", "action");
  const digName = el("span", "action-name", "Dig a hole");
  const digSub = el("span", "action-sub");
  digBtn.append(digName, digSub);
  digBtn.addEventListener("click", () => dig(ui.state(), 1));
  actions.append(digBtn);

  const upgradeBtns = UPGRADES.map((def) => {
    const btn = el("button", "action");
    const name = el("span", "action-name");
    const sub = el("span", "action-sub");
    btn.append(name, sub);
    btn.addEventListener("click", () => buy(ui.state(), def));
    actions.append(btn);
    return { def, btn, name, sub };
  });
  const hint = el("p", "hint", "Keep digging. Something might turn up.");

  const resetBtn = el("button", "link-button", "reset save");
  resetBtn.addEventListener("click", () => {
    if (confirm("Wipe your save and start over?")) ui.reset();
  });
  const footer = el("footer");
  footer.append(resetBtn);

  middle.append(tabs, goal, actions, hint);
  if (ui.devEnabled) middle.append(mountDevTools(ui));
  middle.append(footer);

  // Right: log.
  const right = el("aside", "col col-log");
  right.append(el("h2", undefined, "Log"));
  const logList = el("ol", "log");
  right.append(logList);

  root.append(left, middle, right);

  let seen = reachedMilestones(ui.state());
  let lastState = ui.state();
  const log = (text: string) => {
    const li = el("li", undefined, text);
    logList.prepend(li);
    while (logList.children.length > LOG_LIMIT) logList.lastElementChild?.remove();
  };
  log(offlineSeconds > 60 ? `Welcome back. Your dogs dug for ${fmtDuration(offlineSeconds)} while you were away.` : "A dog stands in an empty yard.");

  return function update() {
    const s = ui.state();
    if (s !== lastState) {
      // Swapped save (reset or preset): don't replay every milestone it already passed.
      seen = reachedMilestones(s);
      lastState = s;
      log("The yard shimmers. Things are different now.");
    }
    for (const m of MILESTONES) {
      if (!seen.has(m.id) && m.reached(s)) {
        seen.add(m.id);
        log(m.text);
      }
    }

    const perSec: Record<Currency, number> = { treats: treatsPerSecond(s), bones: bonesPerSecond(s) };
    for (const c of CURRENCIES) {
      const r = resRows.get(c)!;
      r.row.hidden = !isRevealed(s, c);
      r.amount.textContent = fmt(s.currencies[c]);
      r.rate.textContent = perSec[c] > 0 ? `+${fmt(perSec[c])}/s` : "";
    }
    const holes = resRows.get("holes")!;
    holes.row.hidden = s.holesDug < 1;
    holes.amount.textContent = fmt(s.holesDug);
    holes.rate.textContent = "";

    digSub.textContent = `+${fmt(treatsPerHole(s))} treats`;

    let anyShown = false;
    for (const { def, btn, name, sub } of upgradeBtns) {
      const u = s.upgrades[def.id];
      btn.hidden = !u.unlocked;
      if (!u.unlocked) continue;
      anyShown = true;
      name.textContent = u.level > 0 ? `${def.name} (${u.level})` : def.name;
      sub.textContent = `${fmt(costOf(s, def))} ${def.currency}`;
      btn.title = def.describe(s);
      btn.disabled = !canAfford(s, def);
    }
    hint.hidden = anyShown;

    const helpers = s.upgrades.helpers.level;
    goal.hidden = helpers === 0;
    goal.textContent =
      helpers >= PACK_SIZE
        ? "The pack is ready. The next era is coming soon."
        : `Goal: gather ${PACK_SIZE} dogs to form a pack (${helpers}/${PACK_SIZE}).`;
  };
}
