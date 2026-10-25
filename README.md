# One True Dog

A browser idle/incremental game about dogs digging holes, in the spirit of Kittens Game, Cookie Clicker and Synergism.

## Running it

Requires Node 22+.

```sh
npm install
npm run dev      # local dev server with hot reload
npm test         # game logic tests (Vitest)
npm run build    # typecheck + production build into dist/
```

## Layout

- `src/game/` holds the pure game logic with no DOM access: state shape, upgrade definitions, the tick/dig/buy engine, and save/load. Everything here is unit tested.
- `src/ui/` builds the DOM once and patches it every frame from game state.
- `src/main.ts` wires the loop: advance by wall-clock time each frame, autosave to `localStorage` every 10 seconds, and credit up to 8 hours of offline progress on load.

To add an upgrade, add an entry to `UPGRADES` in `src/game/upgrades.ts`, give it a slot in `newGame()`, and apply its effect in `src/game/engine.ts`.
