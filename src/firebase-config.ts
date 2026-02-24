import { firebaseInit } from '@beitissieshapiro/issie-shared';

// Debug token for App Check (development only)
// To get your debug token:
// 1. Run the app in debug mode (iOS simulator or Android emulator)
// 2. Check the console logs for a message like:
//    "Firebase App Check debug token: XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
// 3. Copy that token and paste it below
// 4. Add the same token to Firebase Console:
//    - Go to Firebase Console → App Check
//    - Select your app (IssieSays Android or iOS)
//    - Click "Manage debug tokens"
//    - Add the token
// 5. Debug tokens are per-device/simulator, so you may need multiple tokens
import { debugToken } from './common/debug-token';

export function initializeFirebase() {
  if (__DEV__) {
    (globalThis as any).RNFBDebug = true;
    console.log('Firebase debug mode enabled');
  }
  firebaseInit(debugToken);
  console.log('Firebase initialized for IssieSays');
}
