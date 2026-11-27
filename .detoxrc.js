/** @type {Detox.DetoxConfig} */
// e2e tests on iPad, iPhone and Android. Device names can be overridden:
//   DETOX_IPAD="iPad Air 11-inch (M4)"  DETOX_IPAD_ID="<UDID>"  DETOX_IPHONE="iPhone 17"  DETOX_AVD="IssieTablet"  DETOX_ADB_NAME=...
// DETOX_IPAD_ID pins to a specific simulator UDID (useful when multiple simulators of the same type are booted).
module.exports = {
  testRunner: {
    args: { config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 180000 },
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
      build: 'cd android && ./gradlew :app:assembleDebug :app:assembleAndroidTest -DtestBuildType=debug -PreactNativeDevServerPort=8085 -PreactNativeArchitectures=arm64-v8a && cd ..',
      reversePorts: [8085], // Metro port (the debug build is pointed at it, see the build command)
    },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: process.env.DETOX_IPAD_ID ? { id: process.env.DETOX_IPAD_ID } : { type: process.env.DETOX_IPAD || 'iPad (A16)' } },
    iphone: { type: 'ios.simulator', device: { type: process.env.DETOX_IPHONE || 'iPhone 17' } },
    emulator: { type: 'android.emulator', device: { avdName: process.env.DETOX_AVD || 'IssieTablet' } },
    // a phone or tablet connected over USB (adb devices)
    attached: { type: 'android.attached', device: { adbName: process.env.DETOX_ADB_NAME || '.*' } },
  },
  configurations: {
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
    'ios.iphone.debug': { device: 'iphone', app: 'ios.debug' },
    'android.emu.debug': { device: 'emulator', app: 'android.debug' },
    'android.att.debug': { device: 'attached', app: 'android.debug' },
  },
};
