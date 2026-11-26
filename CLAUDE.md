# IssieSays

IssieSays is a React Native AAC (Augmentative and Alternative Communication) companion app that records audio sentences and plays them back via the Nitro sound engine.

## Development

- Metro runs on **port 8085** (`RCT_jsLocation: localhost:8085` in `.detoxrc.js`).
- Shared code lives in `../issie-shared` (linked as `file:../issie-shared` in `package.json`). Metro is configured in `metro.config.js` to watch that folder.
- Developer prefers to commit on their own — do not create commits without being asked.
- Do not run Metro yourself; the developer starts it manually.

## E2E Tests (Detox)

**Tests:** `e2e/says-features.test.ts` — records audio, checks playback state, verifies settings persist across restarts.

**Run** (Metro must be running on port 8085, app built for simulator):
```
npx detox test -c ios.sim.debug
```

**Key implementation notes:**

- **Firebase skip:** Firebase's persistent WebSocket prevents Detox from ever seeing the app as idle. It is skipped in e2e mode via a check at the top of `index.js`:
  ```js
  const IS_E2E_RUN = __DEV__ && Platform.OS === 'ios' && !!Settings.get('e2e');
  if (!IS_E2E_RUN) { initializeFirebase(); }
  ```
  `Settings.get('e2e')` reads iOS NSUserDefaults, which is populated from Detox launch args (`-e2e 1`). This check **must stay at the `index.js` body level** (after all imports) — calling `Settings.get()` deeper in the import chain (e.g. in a module-level constant) returns `undefined` because the native module constants haven't been set yet when that module evaluates.

- **Nitro sound engine keeps the main run loop active** after launch. The `beforeAll` hook therefore calls `device.disableSynchronization()` + `sleep(1000)` before the initial `waitFor(element(by.id('main-state')))` so Detox doesn't wait for an idle app that never idles.

- **Cold Hermes cache:** On a fresh simulator install, Hermes must JIT-compile the entire debug bundle — this can take 15–25 min. `testTimeout` is set to 1800000 ms (30 min). Subsequent runs with a warm cache complete in ~1–2 min.

- **On RN 0.88.1**, a `UIDimmingView` / `PopoverDismissRegion` popover may appear on first launch. If needed, dismiss by tapping `{ x: 825, y: 1185 }` on the element (top-left corner, away from the popover bubble).
