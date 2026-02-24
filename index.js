/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { Init } from './src/profile';
import { initLang, LANGUAGE_SETTINGS } from '@beitissieshapiro/issie-shared';
import { languageMap, detectedLanguage, isRight2Left } from './src/lang';

Init();

// Initialize language system
const defaultLang = { languageTag: detectedLanguage, isRTL: isRight2Left };
initLang(languageMap, defaultLang);

console.log("registering App", appName)
AppRegistry.registerComponent(appName, () => App);
console.log("App registered") 