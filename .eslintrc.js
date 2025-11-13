module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: ['Dimensions', 'useWindowDimensions'],
            message:
              'Read dimensions with `useSafeAreaFrame` from `react-native-safe-area-context` instead (to support screen-sizer)',
          },
        ],
      },
    ],
  },
};
