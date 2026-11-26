/**
 * @format
 */

import { AppRegistry, LogBox, Platform, Settings } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { Init } from './src/profile';
import { initLang, loadLanguage, LANGUAGE_SETTINGS } from '@beitissieshapiro/issie-shared';
import { languageMap, detectedLanguage, isRight2Left } from './src/lang';
import { initializeFirebase } from './src/firebase-config';

// In Detox e2e runs, Firebase's persistent WebSocket prevents the app from
// ever becoming idle, blocking Detox's element queries indefinitely.
// Settings.get() reads iOS NSUserDefaults which are populated from launch
// args before JS runs — reliable here (at index.js body level) but NOT
// during module evaluation deep in the import chain.
const IS_E2E_RUN = __DEV__ && Platform.OS === 'ios' && !!Settings.get('e2e');

if (IS_E2E_RUN) {
  LogBox.ignoreAllLogs();
} else {
  initializeFirebase();
}

Init();

// Initialize language system
const defaultLang = { languageTag: detectedLanguage, isRTL: isRight2Left };
initLang(languageMap, defaultLang);

// Map detected language to LANGUAGE_SETTINGS value
let languageSetting = LANGUAGE_SETTINGS.english; // default to English
if (detectedLanguage === 'he') {
    languageSetting = LANGUAGE_SETTINGS.hebrew;
} else if (detectedLanguage === 'ar') {
    languageSetting = LANGUAGE_SETTINGS.arabic;
} else if (detectedLanguage === 'en') {
    languageSetting = LANGUAGE_SETTINGS.english;
}

// Load the language to ensure it's properly applied
loadLanguage(languageSetting);
console.log("Language initialized:", detectedLanguage, "Setting:", languageSetting);

console.log("registering App", appName)
AppRegistry.registerComponent(appName, () => App);
console.log("App registered") 