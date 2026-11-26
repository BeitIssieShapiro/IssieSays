/** @type {Detox.DetoxConfig} */
// e2e tests on iPad, iPhone and Android. Device names can be overridden:
//   DETOX_IPAD="iPad Air 11-inch (M4)"  DETOX_IPHONE="iPhone 17"  DETOX_AVD="IssieTest"  DETOX_ADB_NAME=...
module.exports = {
  testRunner: {
    args: { config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 300000 },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/IssieSays.app',
      build: 'xcodebuild -workspace ios/IssieSays.xcworkspace -scheme IssieSays -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build | (command -v xcpretty >/dev/null && xcpretty || cat)',
      launchArgs: { RCT_jsLocation: 'localhost:8085', IS_DETOX_TEST: true },
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build: 'cd android && ./gradlew :app:assembleDebug :app:assembleAndroidTest -DtestBuildType=debug && cd ..',
      reversePorts: [8081],
    },
  },
  devices: {
    // Pinned to 9ADFCA0F to preserve Hermes cache; override with DETOX_IPAD_ID.
    simulator: { type: 'ios.simulator', device: { id: process.env.DETOX_IPAD_ID || '9ADFCA0F-4B40-4936-9EA3-AF6181962996' } },
    iphone: { type: 'ios.simulator', device: { type: process.env.DETOX_IPHONE || 'iPhone 17' } },
    emulator: { type: 'android.emulator', device: { avdName: process.env.DETOX_AVD || 'IssieTest' } },
    // a phone or tablet connected over USB (adb devices)
    attached: { type: 'android.attached', device: { adbName: process.env.DETOX_ADB_NAME || '.*' } },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator', app: 'ios.debug',
      behavior: { init: { reinstallApp: false } },
    },
    'ios.iphone.debug': { device: 'iphone', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator', app: 'android.debug' },
    'android.att.debug': { device: 'attached', app: 'android.debug' },
  },
};
