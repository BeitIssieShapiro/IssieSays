/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Init } from './profile';

Init();
console.log("registering App", appName)
AppRegistry.registerComponent(appName, () => App);
console.log("App registered") 