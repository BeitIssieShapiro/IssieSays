# Maestro flows (smoke e2e)

The full e2e suite is Detox (`e2e/`, `npm run e2e:test`). These Maestro flows are
a lighter smoke check that needs no test build (runs on any debug/release build):

    maestro test .maestro/                              # iOS, org.issieshapiro.issiesays
    maestro test -e APP_ID=com.IssieSays .maestro/      # Android

They use the app's existing testIDs (settings-btn, buttons-plus, edit-button-*, main-button-*).

Android: `maestro --device <emulator> test -e APP_ID=<android id> <flow>` (the id is in each flow's first line;
needs `JAVA_HOME=/opt/homebrew/opt/openjdk@21`). The flows read `appId: ${APP_ID || "<ios id>"}`: an `env:` default
would override `-e`. Debug builds load JS from Metro: on iOS point the app at it with
`xcrun simctl spawn <udid> defaults write <bundle id> RCT_jsLocation localhost:<port>`; on Android `adb reverse tcp:<port> tcp:<port>`.

The parent-lock check in `play-button.yaml` runs only with `-e RELEASE=true`: Debug builds skip the lock.
