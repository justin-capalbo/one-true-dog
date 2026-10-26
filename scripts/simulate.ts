// Prints a pacing timeline for the current balance. Run with `npm run sim`.
// Flags: --clicks <per sec> --click-for <sec> --max <sec> --stop <milestone id> --buys
import { DEFAULT_SIM, formatTime, simulate } from "../src/sim/simulate";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const num = (name: string, fallback: number) => (flag(name) !== undefined ? Number(flag(name)) : fallback);

const opts = {
  clicksPerSec: num("clicks", DEFAULT_SIM.clicksPerSec),
  clickForSec: num("click-for", DEFAULT_SIM.clickForSec),
  maxSec: num("max", DEFAULT_SIM.maxSec),
  stopAt: flag("stop") ?? DEFAULT_SIM.stopAt,
};
const showBuys = args.includes("--buys");

const { events, state, t } = simulate(opts);
console.log(
  `Strategy: ${opts.clicksPerSec} clicks/sec` +
    (Number.isFinite(opts.clickForSec) ? ` for ${opts.clickForSec}s, then idle` : "") +
    `, buy the cheapest affordable upgrade.\n`,
);
for (const e of events) {
  if (e.kind === "buy" && !showBuys) continue;
  console.log(`${formatTime(e.t).padStart(8)}  ${e.kind === "buy" ? "  buy " : ""}${e.text}`);
}
const levels = Object.entries(state.upgrades)
  .map(([id, u]) => `${id} ${u.level}`)
  .join(", ");
console.log(`\nEnded at ${formatTime(t)}. Holes ${Math.floor(state.holesDug)}. Upgrades: ${levels}.`);
