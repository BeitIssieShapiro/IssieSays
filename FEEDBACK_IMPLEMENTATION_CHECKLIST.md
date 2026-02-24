# User Feedback Implementation Checklist

## Phase 1: Dependencies and Configuration

- [ ] Install npm packages:
  ```bash
  npm install @beitissieshapiro/issie-shared@^1.0.0
  npm install @react-native-firebase/app@^23.5.0
  npm install @react-native-firebase/app-check@^23.5.0
  npm install @react-native-firebase/functions@^23.5.0
  npm install @react-native-firebase/analytics@^23.5.0
  ```

- [ ] Run `npx pod-install ios` (iOS only)

## Phase 2: Firebase Console - Android Setup

- [ ] Go to Firebase Console → Add app → Android
- [ ] Get Android package name from `android/app/build.gradle`
- [ ] Register Android app in Firebase Console with package name
- [ ] Download `google-services.json`
- [ ] Place `google-services.json` in `android/app/`
- [ ] Add to `android/build.gradle`:
  ```gradle
  classpath 'com.google.gms:google-services:4.4.2'
  ```
- [ ] Add to `android/app/build.gradle` (bottom):
  ```gradle
  apply plugin: 'com.google.gms.google-services'
  ```
- [ ] Run app in debug mode and get App Check debug token from console
- [ ] Add debug token to Firebase Console → App Check → Android app
- [ ] Enable Play Integrity in Firebase Console → App Check

## Phase 3: Firebase Console - iOS Setup

- [ ] Go to Firebase Console → Add app → iOS
- [ ] Get iOS bundle ID from `ios/IssieSays.xcodeproj/project.pbxproj`
- [ ] Register iOS app in Firebase Console with bundle ID
- [ ] Download `GoogleService-Info.plist`
- [ ] Open `ios/IssieSays.xcworkspace` in Xcode
- [ ] Add `GoogleService-Info.plist` to Xcode project (right-click → Add Files)
- [ ] Ensure "Copy items if needed" is checked
- [ ] Ensure "IssieSays" target is selected
- [ ] In Xcode → Signing & Capabilities → Add "App Attest" capability
- [ ] Run `cd ios && pod install && cd ..`
- [ ] Run app in debug mode and get App Check debug token from console
- [ ] Add debug token to Firebase Console → App Check → iOS app
- [ ] Enable App Attest in Firebase Console → App Check

## Phase 4: Code Implementation

- [ ] Create `src/firebase-config.ts`:
  ```typescript
  import { firebaseInit } from '@beitissieshapiro/issie-shared';

  const debugToken = __DEV__ ? 'YOUR_DEBUG_TOKEN_HERE' : '';

  export function initializeFirebase() {
    firebaseInit(debugToken);
  }
  ```

- [ ] Update `src/App.tsx` - add Firebase initialization in useEffect

- [ ] Update `src/settings.tsx`:
  - [ ] Import: `import { FeedbackDialog } from '@beitissieshapiro/issie-shared';`
  - [ ] Add state: `const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);`
  - [ ] Add feedback button in UI
  - [ ] Add `<FeedbackDialog>` component at end

- [ ] Update `src/lang.ts` - add all translation keys for he, en, ar

## Phase 5: Testing

- [ ] Test Android debug build:
  - [ ] App launches without errors
  - [ ] Firebase initializes (check console logs)
  - [ ] Open settings → click feedback button
  - [ ] Submit feedback
  - [ ] Verify appears in Firebase Firestore

- [ ] Test iOS debug build:
  - [ ] App launches without errors
  - [ ] Firebase initializes (check console logs)
  - [ ] Open settings → click feedback button
  - [ ] Submit feedback
  - [ ] Verify appears in Firebase Firestore

- [ ] Test form validation:
  - [ ] Empty title → shows error
  - [ ] Short title (< 3 chars) → shows error
  - [ ] Empty feedback → shows error
  - [ ] Short feedback (< 5 chars) → shows error
  - [ ] Invalid email → shows error
  - [ ] Valid submission → shows success message

## Phase 6: Production Preparation

- [ ] Get production App Check tokens
- [ ] Replace debug token with empty string for production
- [ ] Test release build on Android
- [ ] Test release build on iOS
- [ ] Enable App Check enforcement in Firebase Console
- [ ] Set up Firestore monitoring/alerts (optional)
- [ ] Configure email notifications (optional)

## Verification

After implementation, verify:

- [ ] Feedback button appears in settings
- [ ] Clicking opens modal dialog
- [ ] All text fields are in correct language (RTL for Hebrew/Arabic)
- [ ] Form validation works correctly
- [ ] Submit button shows loading indicator
- [ ] Success message appears after submission
- [ ] Feedback appears in Firestore with correct structure
- [ ] Email field is optional and validates correctly
- [ ] Cancel button closes dialog without submitting

## Notes

- Debug tokens are per-device/simulator - add multiple if testing on multiple devices
- App Check errors in development are normal until debug token is added
- Firebase config files should be in `.gitignore` for security
- The `addUserFeedback2` Cloud Function must be deployed before testing
- Region must match in code (europe-west1) and Cloud Function deployment

## Support

If issues arise:
- Check Firebase Console → App Check for token status
- Check Firebase Console → Functions for execution logs
- Check Xcode console / Android logcat for detailed errors
- Verify all dependencies are installed correctly
- Ensure Pod files are up to date (iOS)

---

**Created**: February 23, 2026
