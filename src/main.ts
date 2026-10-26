import "./style.css";
import { catchUp, MAX_OFFLINE_SECONDS, tick } from "./game/engine";
import { load, save, wipe } from "./game/save";
import { newGame } from "./game/state";
import { mountUI } from "./ui/render";

const AUTOSAVE_MS = 10_000;
// Dev tools show in `npm run dev`, or on any build with ?dev in the URL.
const DEV = import.meta.env.DEV || new URLSearchParams(location.search).has("dev");

let state = load();
let speed = 1;
const away = catchUp(state, Date.now());

const update = mountUI(
  document.getElementById("app")!,
  {
    devEnabled: DEV,
    state: () => state,
    setState: (s) => {
      state = s;
      save(state);
    },
    speed: () => speed,
    setSpeed: (x) => {
      speed = x;
    },
    reset: () => {
      wipe();
      state = newGame();
    },
  },
  away,
);

// Advance by wall-clock time so background tabs (where rAF pauses) catch up on return.
function frame() {
  const now = Date.now();
  const elapsed = Math.min(Math.max(0, (now - state.lastTick) / 1000), MAX_OFFLINE_SECONDS);
  tick(state, elapsed * speed);
  state.lastTick = now;
  update();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

setInterval(() => save(state), AUTOSAVE_MS);
window.addEventListener("beforeunload", () => save(state));
