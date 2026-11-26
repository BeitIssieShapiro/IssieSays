import { Platform, Settings } from 'react-native';

function detectE2E(): boolean {
  if (Platform.OS === 'ios') {
    try {
      // Settings.get() reads NSUserDefaults which is populated from iOS launch args
      // at process start — available synchronously before the RN bridge initializes.
      if (Settings.get('IS_DETOX_TEST') || Settings.get('e2e')) return true;
    } catch { /* ignore */ }
  }
  return typeof (global as any).__detox_currentTestName__ !== 'undefined';
}

export const IS_E2E: boolean = detectE2E();
