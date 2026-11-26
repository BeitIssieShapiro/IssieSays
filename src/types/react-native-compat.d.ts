// RN 0.85 removed the deprecated `ViewProperties` alias, but react-native-progress (5.0.1, latest)
// still extends it in its typings. Restore it so its components keep their View props (e.g. `style`).
import type { ViewProps } from 'react-native';

declare module 'react-native' {
  interface ViewProperties extends ViewProps {}
}
