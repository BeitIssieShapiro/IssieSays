# Maestro flows (smoke e2e)

The full e2e suite is Detox (`e2e/`, `npm run e2e:test`). These Maestro flows are
a lighter smoke check that needs no test build (runs on any debug/release build):

    maestro test .maestro/                              # iOS, org.issieshapiro.issiesays
    maestro test -e APP_ID=com.IssieSays .maestro/      # Android

They use the app's existing testIDs (settings-btn, buttons-plus, edit-button-*, main-button-*).
