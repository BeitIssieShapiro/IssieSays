# Firebase Setup for User Feedback in IssieSays

## Overview

This document outlines the steps to add user feedback functionality to IssieSays, following the implementation pattern from IssieDocs. The implementation uses the `@beitissieshapiro/issie-shared` package for the feedback UI component and Firebase Cloud Functions for backend processing.

## Prerequisites

- Firebase project already exists (shared with IssieDocs)
- Access to Firebase Console
- Access to issie-shared repository

## Implementation Steps

### 1. Install Required Dependencies

Add the following packages to `package.json`:

```bash
npm install @beitissieshapiro/issie-shared@^1.0.0
npm install @react-native-firebase/app@^23.5.0
npm install @react-native-firebase/app-check@^23.5.0
npm install @react-native-firebase/functions@^23.5.0
npm install @react-native-firebase/analytics@^23.5.0
```

### 2. Firebase Console Setup

#### 2.1 Create IssieSays App in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (same project as IssieDocs)
3. Click "Add app" to add IssieSays

#### 2.2 Android Setup

**Step 1: Add Android App**
1. In Firebase Console, click the Android icon
2. Register app with package name: `com.issiesays` (check `android/app/build.gradle` for actual package name)
3. Download `google-services.json`
4. Place file in: `android/app/google-services.json`

**Step 2: Configure android/build.gradle**
Add to buildscript dependencies:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

**Step 3: Configure android/app/build.gradle**
Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

**Step 4: Enable Play Integrity API**
1. In Firebase Console, go to App Check
2. Select your Android app
3. Click "Register" under Play Integrity provider
4. Enable "Enforce" after testing

**Step 5: Get Debug Token (for development)**
1. Run the app in debug mode
2. Check console logs for App Check debug token
3. In Firebase Console → App Check → Apps → Android app
4. Click "Manage debug tokens"
5. Add the debug token from console

#### 2.3 iOS Setup

**Step 1: Add iOS App**
1. In Firebase Console, click the iOS icon
2. Register app with bundle ID: `org.reactjs.native.example.IssieSays` (check `ios/IssieSays.xcodeproj/project.pbxproj` for actual bundle ID)
3. Download `GoogleService-Info.plist`
4. Add file to Xcode project:
   - Open `ios/IssieSays.xcworkspace` in Xcode
   - Right-click on IssieSays folder
   - Select "Add Files to IssieSays"
   - Select `GoogleService-Info.plist`
   - Ensure "Copy items if needed" is checked
   - Ensure target "IssieSays" is selected

**Step 2: Install CocoaPods**
```bash
cd ios
pod install
cd ..
```

**Step 3: Enable App Attest**
1. In Xcode, select your project
2. Go to "Signing & Capabilities"
3. Click "+ Capability"
4. Add "App Attest"

**Step 4: Configure App Check**
1. In Firebase Console, go to App Check
2. Select your iOS app
3. Click "Register" under App Attest provider
4. Enable "Enforce" after testing

**Step 5: Get Debug Token (for development)**
1. Run the app in debug mode on simulator
2. Check console logs for App Check debug token
3. In Firebase Console → App Check → Apps → iOS app
4. Click "Manage debug tokens"
5. Add the debug token from console

### 3. Code Implementation

#### 3.1 Create Firebase Initialization File

Create `src/firebase-config.ts`:

```typescript
import { firebaseInit } from '@beitissieshapiro/issie-shared';

// Debug token for App Check (development only)
// Get this from console logs on first run, then add to Firebase Console
const debugToken = __DEV__ ? 'YOUR_DEBUG_TOKEN_HERE' : '';

export function initializeFirebase() {
  firebaseInit(debugToken);
}
```

#### 3.2 Initialize Firebase in App.tsx

Add to `App.tsx`:

```typescript
import { initializeFirebase } from './firebase-config';

// In App component or before it:
useEffect(() => {
  initializeFirebase();
}, []);
```

#### 3.3 Add Feedback Button to Settings

Update `src/settings.tsx`:

```typescript
// Add imports
import { FeedbackDialog } from '@beitissieshapiro/issie-shared';

// In SettingsPage component, add state:
const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

// Add button in the settings UI (after Backup section):
<View style={[styles.section, marginHorizontal, dirStyle]}>
    <IconButton
        backgroundColor="white"
        text={translate("UserFeedback")}
        icon={{ name: "message-text", type: "MDI" }}
        onPress={() => setShowFeedbackDialog(true)}
    />
    <Text allowFontScaling={false} style={styles.sectionTitle}>
        {translate("Feedback")}
    </Text>
</View>

// Add dialog at end of return statement (before closing </View>):
<FeedbackDialog
    appName='IssieSays'
    visible={showFeedbackDialog}
    onClose={() => setShowFeedbackDialog(false)}
/>
```

#### 3.4 Add Translation Keys

Add to `src/lang.ts` for all languages (he, en, ar):

```typescript
// Hebrew
"UserFeedback": "משוב משתמש",
"Feedback": "משוב",
"FeedbackTitleLabel": "כותרת / נושא",
"FeedbackTitlePlaceholder": "הזן כותרת קצרה או נושא",
"FeedbackPlaceholder": "שתף אותנו במה שעל ליבך...",
"EmailTitle": "אימייל (אופציונלי)",
"EmailPlaceholder": "your@email.com",
"BtnSubmitFeedback": "שלח",
"BtnCancel": "ביטול",
"FeedbackSubmitted": "תודה! המשוב נשלח בהצלחה",
"FeedbackError": "שליחת המשוב נכשלה. נסה שוב.",
"TitleMinLength": "הכותרת חייבת להכיל לפחות 3 תווים",
"TitleMaxLength": "הכותרת חייבת להכיל פחות מ-100 תווים",
"FeedbackMinLength": "המשוב חייב להכיל לפחות 5 תווים",
"FeedbackMaxLength": "המשוב חייב להכיל פחות מ-1000 תווים",
"InvalidEmail": "כתובת אימייל לא תקינה",

// English
"UserFeedback": "User Feedback",
"Feedback": "Feedback",
"FeedbackTitleLabel": "Title / Subject",
"FeedbackTitlePlaceholder": "Enter a brief title or subject",
"FeedbackPlaceholder": "Share your thoughts with us...",
"EmailTitle": "Email (optional)",
"EmailPlaceholder": "your@email.com",
"BtnSubmitFeedback": "Submit",
"BtnCancel": "Cancel",
"FeedbackSubmitted": "Thank you! Your feedback was submitted successfully",
"FeedbackError": "Failed to submit feedback. Please try again.",
"TitleMinLength": "Title must be at least 3 characters",
"TitleMaxLength": "Title must be less than 100 characters",
"FeedbackMinLength": "Feedback must be at least 5 characters",
"FeedbackMaxLength": "Feedback must be less than 1000 characters",
"InvalidEmail": "Invalid email address",

// Arabic
"UserFeedback": "ملاحظات المستخدم",
"Feedback": "ملاحظات",
"FeedbackTitleLabel": "العنوان / الموضوع",
"FeedbackTitlePlaceholder": "أدخل عنوانًا موجزًا أو موضوعًا",
"FeedbackPlaceholder": "شارك أفكارك معنا...",
"EmailTitle": "البريد الإلكتروني (اختياري)",
"EmailPlaceholder": "your@email.com",
"BtnSubmitFeedback": "إرسال",
"BtnCancel": "إلغاء",
"FeedbackSubmitted": "شكرًا! تم إرسال ملاحظاتك بنجاح",
"FeedbackError": "فشل إرسال الملاحظات. حاول مرة أخرى.",
"TitleMinLength": "يجب أن يكون العنوان 3 أحرف على الأقل",
"TitleMaxLength": "يجب أن يكون العنوان أقل من 100 حرف",
"FeedbackMinLength": "يجب أن تكون الملاحظات 5 أحرف على الأقل",
"FeedbackMaxLength": "يجب أن تكون الملاحظات أقل من 1000 حرف",
"InvalidEmail": "عنوان البريد الإلكتروني غير صالح",
```

### 4. Firebase Cloud Function

The backend Cloud Function (`addUserFeedback2`) should already exist in the Firebase project (shared with IssieDocs). If not, create it:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const addUserFeedback2 = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify App Check token
    if (!context.app) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.'
      );
    }

    const { appName, feedbackTitle, feedbackText, email } = data;

    // Validate inputs
    if (!appName || !feedbackTitle || !feedbackText) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Save feedback to Firestore
    await admin.firestore().collection('userFeedback').add({
      appName,
      title: feedbackTitle,
      feedback: feedbackText,
      email: email || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      platform: context.rawRequest.headers['user-agent'] || 'unknown',
    });

    return { success: true };
  });
```

### 5. Firestore Security Rules

Add to Firestore rules (if not already present):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User feedback collection - write only via Cloud Function
    match /userFeedback/{feedbackId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

### 6. Testing

#### 6.1 Development Testing

1. Run the app in debug mode
2. Check console for App Check debug token
3. Add debug token to Firebase Console (both Android and iOS)
4. Open settings, click feedback button
5. Fill out form and submit
6. Check Firestore console for new entry in `userFeedback` collection
7. Verify log shows: "Feedback submitted successfully"

#### 6.2 Production Testing

1. Build release version of app
2. Install on device
3. Submit feedback
4. Verify appears in Firestore
5. Check Firebase App Check dashboard shows valid tokens

### 7. Viewing Feedback

Access feedback in Firebase Console:

1. Go to Firestore Database
2. Navigate to `userFeedback` collection
3. View entries sorted by timestamp
4. Each entry contains:
   - `appName`: "IssieSays"
   - `title`: Feedback subject
   - `feedback`: Feedback text
   - `email`: User's email (if provided)
   - `timestamp`: Submission time
   - `platform`: Device/platform info

### 8. Optional: Email Notifications

To receive email notifications when feedback is submitted, extend the Cloud Function:

```typescript
import * as nodemailer from 'nodemailer';

// Configure email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// In addUserFeedback2 function, after saving to Firestore:
await transporter.sendMail({
  from: 'IssieSays Feedback <noreply@issie.com>',
  to: 'team@issie.com',
  subject: `IssieSays Feedback: ${feedbackTitle}`,
  text: `New feedback from ${appName}\n\nTitle: ${feedbackTitle}\n\nFeedback:\n${feedbackText}\n\nEmail: ${email || 'Not provided'}`,
});
```

## File Locations Reference

### IssieSays Files to Create/Modify

- `src/firebase-config.ts` - New file for Firebase initialization
- `src/App.tsx` - Add Firebase initialization
- `src/settings.tsx` - Add feedback button and dialog
- `src/lang.ts` - Add translation keys
- `package.json` - Add dependencies
- `android/app/google-services.json` - Firebase config for Android
- `ios/GoogleService-Info.plist` - Firebase config for iOS

### IssieDocs Reference Files

- `/Users/i022021/dev/Issie/IssieDocs/src/common/firebase.ts` - Firebase init example
- `/Users/i022021/dev/Issie/IssieDocs/src/settings-ui.js:385` - Feedback button usage
- `/Users/i022021/dev/Issie/IssieDocs/src/settings-ui.js:406-410` - FeedbackDialog usage
- `/Users/i022021/dev/Issie/IssieDocs/android/app/google-services.json` - Android config example
- `/Users/i022021/dev/Issie/IssieDocs/ios/GoogleService-Info.plist` - iOS config example

### Issie-Shared Files

- `/Users/i022021/dev/Issie/issie-shared/src/user-feedback.tsx` - FeedbackDialog component
- `/Users/i022021/dev/Issie/issie-shared/src/firebase.ts` - Firebase utilities and addUserFeedback function

## Troubleshooting

### Common Issues

**Issue 1: "App Check token invalid"**
- Solution: Add debug token to Firebase Console
- Check: Console logs for the debug token string
- Verify: Token is added for the correct platform (Android/iOS)

**Issue 2: "google-services.json not found" (Android)**
- Solution: Ensure file is in `android/app/` directory
- Verify: File is not in `.gitignore`
- Check: Gradle sync completed successfully

**Issue 3: "GoogleService-Info.plist not found" (iOS)**
- Solution: Add file through Xcode, not just file system
- Verify: File appears in Xcode project navigator
- Check: File is included in app target

**Issue 4: "Function not found" error**
- Solution: Deploy Cloud Function to Firebase
- Verify: Function appears in Firebase Console → Functions
- Check: Function region matches code (europe-west1)

**Issue 5: Feedback not appearing in Firestore**
- Check: Cloud Function logs in Firebase Console
- Verify: Firestore rules allow Cloud Function writes
- Check: Network connectivity

### Debug Mode

Enable Firebase debug logging:

```typescript
// In firebase-config.ts
if (__DEV__) {
  (globalThis as any).RNFBDebug = true;
}
```

## Security Notes

- Never commit Firebase config files with real credentials to public repositories
- Use debug tokens only for development
- Enable App Check enforcement in production
- Keep Cloud Function code secure
- Validate all inputs in Cloud Function

## Cost Considerations

Firebase Free Tier includes:
- Cloud Functions: 2M invocations/month
- Firestore: 50K reads, 20K writes per day
- App Check: Unlimited

User feedback is expected to be low volume, well within free tier limits.

## Next Steps After Implementation

1. Test feedback submission on both platforms
2. Monitor Firebase Console for first submissions
3. Set up email notifications (optional)
4. Create dashboard for viewing feedback
5. Consider adding feedback categories/tags
6. Add ability to reply to users who provide email

## Related Documentation

- [Firebase iOS Setup](https://rnfirebase.io/app/ios-setup)
- [Firebase Android Setup](https://rnfirebase.io/app/android-setup)
- [App Check Setup](https://rnfirebase.io/app-check/usage)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

**Last Updated**: February 23, 2026
**Version**: 1.0
