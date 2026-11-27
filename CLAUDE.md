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
npx detox test -c android.emu.debug   # after: npx detox build -c android.emu.debug
```

**Key implementation notes:**

- **Firebase skip:** Firebase's persistent WebSocket and AppCheck token exchange (a blocking network call in AppDelegate) prevent Detox from ever seeing the app as idle. It is skipped in e2e mode via a check at the top of `index.js`:
  ```js
  const IS_E2E_RUN = __DEV__ && Platform.OS === 'ios' && !!Settings.get('e2e');
  if (!IS_E2E_RUN) { initializeFirebase(); }
  ```
  `Settings.get('e2e')` reads iOS NSUserDefaults, which is populated from Detox launch args (`-e2e 1`). This check **must stay at the `index.js` body level** (after all imports) — calling `Settings.get()` deeper in the import chain (e.g. in a module-level constant) returns `undefined` because the native module constants haven't been set yet when that module evaluates.

- **Nitro sound engine keeps the main run loop active** after launch. The `beforeAll` hook therefore calls `device.disableSynchronization()` + `sleep(1000)` before the initial `waitFor(element(by.id('main-state')))` so Detox doesn't wait for an idle app that never idles.

- **Startup hang = two copies of react-native in the bundle.** `issie-shared` has its own dev copy of `react-native` in its `node_modules`. If Metro bundles it, the app dies at startup (`'PlatformConstants' could not be found`, then `"IssieSays" has not been registered`) and Detox waits forever on the bundle load. `metro.config.js` blocks `issie-shared/node_modules` and resolves everything from this app's `node_modules` — keep it that way. (An earlier "cold Hermes takes 15–60 min" theory was wrong; a normal run takes ~2–3 min.)

- **Lost first tap:** the first tap on a screen or panel that just appeared can be lost (settings mode buttons, the color picker). The tests use `tapUntil` / `tapUntilSettings` / `tapUntilGone`, which retry until the change shows.

- **Android:** the debug build is pointed at Metro on 8085 (`-PreactNativeDevServerPort=8085`, `reversePorts: [8085]`). Run on a tablet AVD (`IssieTablet`, the default) — on a phone the edit screen's bottom buttons are under the gesture bar. Needs `JAVA_HOME=/opt/homebrew/opt/openjdk@21`.

- **On RN 0.88.1**, a `UIDimmingView` / `PopoverDismissRegion` popover may appear on first launch. If needed, dismiss by tapping `{ x: 825, y: 1185 }` on the element (top-left corner, away from the popover bubble).
