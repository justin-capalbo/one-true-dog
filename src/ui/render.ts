import { bonesPerHole, buy, canAfford, costOf, dig, holesPerSecond, isRevealed, treatsPerHole } from "../game/engine";
import { CURRENCIES, type GameState } from "../game/state";
import { UPGRADES } from "../game/upgrades";
import { fmt } from "./format";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Builds the DOM once and returns an `update` that patches text and visibility each frame.
 * Game logic stays in ../game; this layer only reads state and forwards clicks.
 */
export function mountUI(root: HTMLElement, state: () => GameState, onReset: () => void) {
  root.replaceChildren();

  const header = el("header");
  header.append(el("h1", undefined, "One True Dog"));
  const resources = el("div", "resources");
  const resourceRows = CURRENCIES.map((c) => {
    const row = el("div", "resource");
    const label = el("span", "resource-name", c);
    const value = el("span", "resource-value");
    row.append(label, value);
    resources.append(row);
    return { c, row, value };
  });
  const holesRow = el("div", "resource");
  const holesValue = el("span", "resource-value");
  holesRow.append(el("span", "resource-name", "holes"), holesValue);
  resources.append(holesRow);
  header.append(resources);

  const main = el("main");
  const digPanel = el("section", "panel dig");
  const digButton = el("button", "dig-button", "Dig a hole");
  digButton.addEventListener("click", () => dig(state(), 1));
  const rates = el("p", "rates");
  digPanel.append(digButton, rates);

  const upgradesPanel = el("section", "panel upgrades");
  upgradesPanel.append(el("h2", undefined, "Upgrades"));
  const upgradeRows = UPGRADES.map((def) => {
    const row = el("div", "upgrade");
    const info = el("div", "upgrade-info");
    const name = el("div", "upgrade-name", def.name);
    const desc = el("div", "upgrade-desc");
    info.append(name, desc);
    const btn = el("button", "upgrade-buy");
    btn.addEventListener("click", () => buy(state(), def));
    row.append(info, btn);
    upgradesPanel.append(row);
    return { def, row, desc, btn };
  });
  const emptyHint = el("p", "hint", "Keep digging. Something might turn up.");
  upgradesPanel.append(emptyHint);

  main.append(digPanel, upgradesPanel);

  const footer = el("footer");
  const resetBtn = el("button", "link-button", "Reset save");
  resetBtn.addEventListener("click", () => {
    if (confirm("Wipe your save and start over?")) onReset();
  });
  footer.append(resetBtn);

  root.append(header, main, footer);

  return function update() {
    const s = state();
    for (const { c, row, value } of resourceRows) {
      row.hidden = !isRevealed(s, c);
      value.textContent = fmt(s.currencies[c]);
    }
    holesRow.hidden = s.holesDug < 1;
    holesValue.textContent = fmt(s.holesDug);

    const parts = [`${fmt(treatsPerHole(s))} treats/hole`];
    if (bonesPerHole(s) > 0) parts.push(`${fmt(bonesPerHole(s))} bones/hole`);
    if (holesPerSecond(s) > 0) parts.push(`${fmt(holesPerSecond(s))} holes/sec`);
    rates.textContent = parts.join(" · ");

    let anyShown = false;
    for (const { def, row, desc, btn } of upgradeRows) {
      const u = s.upgrades[def.id];
      row.hidden = !u.unlocked;
      if (!u.unlocked) continue;
      anyShown = true;
      desc.textContent = def.describe(s);
      btn.textContent = `${fmt(costOf(s, def))} ${def.currency}`;
      btn.disabled = !canAfford(s, def);
    }
    emptyHint.hidden = anyShown;
  };
}
