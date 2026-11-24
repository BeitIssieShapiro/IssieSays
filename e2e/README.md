# End-to-end tests (Detox)

`says-features.test.ts` goes through the app:
- **Settings:** the number of buttons (1 to 4, and not more), dark and light backgrounds, and the
  buttons layout ("one after the other" or "all at once").
- **Editing a button:** its name, its color, and a voice recording.
- **Main screen:** the buttons and their names and colors, playing a button's recording, and "one
  after the other" (the next button shows after one plays; reset goes back to the first).
- **Restart:** the settings are kept after the app restarts.

It ends by restoring the defaults (one button, light background, all at once).

The tests check the app's state through hidden views (dev builds only): `main-state`
(`buttons:2 shown:0,1 bg:dark names:Hello,- colors:#20ad57,...`), `settings-state`, `recorder-state`
and `main-button-state-<n>` (`playing:0 played:1`).

## Run

Start Metro first (`npm start`): the tests use debug builds.

| Device | Build once (and after native changes) | Run |
| --- | --- | --- |
| iPad simulator | `npm run e2e:build` | `npm run e2e:test` |
| Android tablet emulator | `npm run e2e:android:build` | `DETOX_AVD=<a tablet AVD> npm run e2e:android` |
| Android device (USB) | same build | `npm run e2e:android:device` |

Add `-t "settings"` to run some of the tests. `E2E_SCREENSHOT_DIR=/some/dir` copies the tests'
screenshots there. Device names: `DETOX_IPAD`, `DETOX_IPHONE`, `DETOX_AVD`, `DETOX_ADB_NAME`.

## Notes

- In dev builds the settings button opens at once (in release it must be held for 3 seconds).
- On iOS the app is launched with `e2e=1`, which hides the dev warnings banner.
- While recording or playing, the app's timers keep it busy, so the tests turn Detox's waiting off
  around those steps.
- On Android the microphone permission is granted with `adb`, and only the app module's test APK is
  built (`react-native-splash-screen` breaks the other modules' test builds). The test runner loads
  `MainActivity` by name: it does not resolve when the test compiles.
- Phones (`ios.iphone.debug`) are configured but not tried yet.
- Not covered: profiles (save, load, rename, delete), templates, images (camera, gallery, search),
  backup and sharing.
