import { Platform, NativeModules } from 'react-native';

function detectE2E(): boolean {
  if (Platform.OS === 'ios') {
    try {
      const settings = NativeModules.RCTSettingsManager?.settings as Record<string, unknown> | undefined;
      if (settings?.IS_DETOX_TEST || settings?.e2e === '1') return true;
    } catch { /* ignore */ }
  }
  return typeof (global as any).__detox_currentTestName__ !== 'undefined';
}

export const IS_E2E: boolean = detectE2E();
