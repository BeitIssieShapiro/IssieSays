module.exports = {
  preset: '@react-native/jest-preset',
  // e2e/ holds the Detox tests, run with `detox test` (see e2e/README.md)
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
