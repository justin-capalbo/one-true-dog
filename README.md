# One True Dog

A browser idle/incremental game about dogs digging holes, in the spirit of Kittens Game, Cookie Clicker and Synergism.

## Running it

Requires Node 22+.

```sh
npm install
npm run dev      # local dev server with hot reload
npm test         # game logic tests (Vitest)
npm run build    # typecheck + production build into dist/
npm run sim      # print a pacing timeline for the current balance
```

## Balancing

`npm run sim` plays the game headlessly with a simple strategy (click at a steady rate, buy the cheapest affordable upgrade) and prints when each milestone happens. Re-run it after any change to costs or rates. Useful flags: `--clicks 0` for fully idle play, `--click-for 120` to stop clicking after two minutes, `--buys` to list every purchase, `--stop <milestone id>`. A test in `src/sim/simulate.test.ts` fails if the Yard gets much faster or slower than its 5 to 30 minute target.

Dev tools (game speed up to 1000x, free resources, time skips, and save presets parked at key moments) appear under the actions in `npm run dev`, or on any build with `?dev` in the URL. Presets live in `src/game/presets.ts`.

## Layout

- `src/game/` holds the pure game logic with no DOM access: state shape, upgrade definitions, the tick/dig/buy engine, and save/load. Everything here is unit tested.
- `src/game/milestones.ts` lists the story beats and unlocks in play order. The log shows them and the simulator times them.
- `src/ui/` builds the DOM once and patches it every frame from game state. The look is deliberately plain, like Kittens Game: resources on the left, actions in the middle, a log on the right.
- `src/sim/` is the headless simulator.
- `src/main.ts` wires the loop: advance by wall-clock time each frame, autosave to `localStorage` every 10 seconds, and credit up to 8 hours of offline progress on load.

To add an upgrade, add an entry to `UPGRADES` in `src/game/upgrades.ts`, give it a slot in `newGame()`, and apply its effect in `src/game/engine.ts`.
