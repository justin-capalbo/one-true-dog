import "./style.css";
import { catchUp } from "./game/engine";
import { load, save, wipe } from "./game/save";
import { newGame } from "./game/state";
import { fmtDuration } from "./ui/format";
import { mountUI } from "./ui/render";

const AUTOSAVE_MS = 10_000;

let state = load();
const away = catchUp(state, Date.now());
if (away > 60) console.info(`Welcome back! Your dogs dug for ${fmtDuration(away)} while you were gone.`);

const update = mountUI(
  document.getElementById("app")!,
  () => state,
  () => {
    wipe();
    state = newGame();
  },
);

// Advance by wall-clock time so background tabs (where rAF pauses) catch up on return.
function frame() {
  catchUp(state, Date.now());
  update();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

setInterval(() => save(state), AUTOSAVE_MS);
window.addEventListener("beforeunload", () => save(state));
