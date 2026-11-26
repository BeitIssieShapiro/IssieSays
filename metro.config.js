const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const issieShared = path.resolve(__dirname, '../../issie-shared');

const config = {
  watchFolders: [issieShared],
  resolver: {
    // issie-shared's node_modules may have its own react/react-native;
    // pin them to the app's copies to avoid duplicate-React crashes.
    extraNodeModules: {
      // pin react/react-native to the app's copies to avoid duplicate-React crashes
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      // @react-native/assets-registry is missing from this worktree; use issie-shared's copy
      '@react-native/assets-registry': path.resolve(issieShared, 'node_modules/@react-native/assets-registry'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
