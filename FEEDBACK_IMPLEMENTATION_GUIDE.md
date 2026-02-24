# User Feedback Implementation Guide

## Quick Reference

**Android Package Name**: `com.IssieSays`
**iOS Bundle ID**: `org.reactjs.native.example.IssieSays`

## Step-by-Step Implementation

### Step 1: Install Dependencies

```bash
npm install @beitissieshapiro/issie-shared@^1.0.0
npm install @react-native-firebase/app@^23.5.0
npm install @react-native-firebase/app-check@^23.5.0
npm install @react-native-firebase/functions@^23.5.0
npm install @react-native-firebase/analytics@^23.5.0
cd ios && pod install && cd ..
```

### Step 2: Add Firebase Config Files (You will do this)

#### Android: `android/app/google-services.json`
1. Firebase Console → Project Settings → Your Apps → Add app → Android
2. Package name: `com.IssieSays`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

#### iOS: `ios/GoogleService-Info.plist`
1. Firebase Console → Project Settings → Your Apps → Add app → iOS
2. Bundle ID: `org.reactjs.native.example.IssieSays`
3. Download `GoogleService-Info.plist`
4. Open `ios/IssieSays.xcworkspace` in Xcode
5. Right-click IssieSays → Add Files to "IssieSays"
6. Select `GoogleService-Info.plist`, check "Copy items if needed"

### Step 3: Update Build Configuration

#### Android: `android/build.gradle`

Add to `buildscript.dependencies`:
```gradle
classpath 'com.google.gms:google-services:4.4.2'
```

Full example:
```gradle
buildscript {
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("de.undercouch:gradle-download-task:5.0.1")
        classpath 'com.google.gms:google-services:4.4.2'  // ADD THIS LINE
    }
}
```

#### Android: `android/app/build.gradle`

Add at the **bottom** of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 4: Initialize Firebase in App

#### Modify `src/App.tsx`

Add at the top:
```typescript
import { initializeFirebase } from './firebase-config';
```

Inside the `App` function, add:
```typescript
useEffect(() => {
  initializeFirebase();
}, []);
```

Full example:
```typescript
export default function App(props: any) {
  useEffect(() => {
    initializeFirebase(); // ADD THIS

    const now = Date.now();
    const nativeStartTime = props.nativeStartTime ?? now;
    // ... rest of existing code
  }, []);

  // ... rest of component
}
```

### Step 5: Add Feedback UI to Settings

#### Modify `src/settings.tsx`

**Add imports at top:**
```typescript
import { FeedbackDialog } from '@beitissieshapiro/issie-shared';
```

**Add state in SettingsPage component (after line 117):**
```typescript
const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
```

**Add feedback section in UI (after Backup section, around line 676):**
```typescript
<View style={[styles.section, marginHorizontal, dirStyle]} >
    <IconButton
        backgroundColor="white"
        text={translate("UserFeedback")}
        icon={{ name: "message-text", type: "MDI", color: colors.titleBlue }}
        onPress={() => setShowFeedbackDialog(true)}
    />
    <Text allowFontScaling={false} style={styles.sectionTitle}>
        {translate("Feedback")}
    </Text>
</View>
```

**Add FeedbackDialog component (before the closing </View> of the return statement, around line 738):**
```typescript
        </View >

        <FeedbackDialog
            appName='IssieSays'
            visible={showFeedbackDialog}
            onClose={() => setShowFeedbackDialog(false)}
        />
    </View >
```

### Step 6: Add Translation Keys

#### Modify `src/lang.ts`

Add to Hebrew strings (inside `strings.he` object):
```typescript
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
```

Add to English strings (inside `strings.en` object):
```typescript
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
```

Add to Arabic strings (inside `strings.ar` object):
```typescript
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

### Step 7: Get Debug Tokens

1. **Build and run the app** (Android emulator or iOS simulator)
2. **Watch the console logs** for messages like:
   ```
   [Firebase App Check] Debug token: XXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```
3. **Copy the debug token**
4. **Add to `src/firebase-config.ts`**:
   ```typescript
   const debugToken = __DEV__ ? 'YOUR-TOKEN-HERE' : '';
   ```
5. **Add to Firebase Console**:
   - Go to Firebase Console → App Check
   - Select app (IssieSays Android or iOS)
   - Click "Manage debug tokens"
   - Click "Add debug token"
   - Paste the token
   - Click "Done"
6. **Restart the app** - App Check should now work

### Step 8: Test

1. Run the app
2. Open Settings
3. Scroll down and click "User Feedback" / "משוב משתמש" button
4. Fill out the form:
   - Title: "Test Feedback"
   - Feedback: "Testing the feedback system"
   - Email: (optional) "test@example.com"
5. Click Submit
6. Verify success message appears
7. Check Firebase Console → Firestore → userFeedback collection
8. Verify new document with your test feedback

## Common Issues and Solutions

### "App Check token missing"
- **Cause**: Debug token not added or app not restarted
- **Fix**: Add debug token to Firebase Console and restart app

### "Function not found: addUserFeedback2"
- **Cause**: Cloud Function not deployed
- **Fix**: Deploy Cloud Function (should already exist from IssieDocs)

### "Module not found: @beitissieshapiro/issie-shared"
- **Cause**: Package not installed or wrong version
- **Fix**: Run `npm install` again, check `node_modules`

### iOS build fails with Firebase errors
- **Cause**: Pods not installed
- **Fix**: Run `cd ios && pod install && cd ..`

### Android build fails
- **Cause**: Google services plugin not applied
- **Fix**: Verify `apply plugin: 'com.google.gms.google-services'` is at bottom of `android/app/build.gradle`

## Testing Checklist

- [ ] Android debug build runs without errors
- [ ] iOS debug build runs without errors
- [ ] Feedback button appears in settings
- [ ] Clicking button opens feedback dialog
- [ ] All text is properly translated and RTL-aware
- [ ] Form validation works (try empty fields)
- [ ] Email validation works (try invalid email)
- [ ] Submit shows loading indicator
- [ ] Success message appears after submission
- [ ] Feedback appears in Firestore
- [ ] Cancel button works without submitting

## Files That Will Be Modified

1. ✅ `src/firebase-config.ts` - Created
2. ⏳ `src/App.tsx` - Need to add Firebase init
3. ⏳ `src/settings.tsx` - Need to add feedback button and dialog
4. ⏳ `src/lang.ts` - Need to add translations
5. ⏳ `package.json` - Need to add dependencies
6. ⏳ `android/build.gradle` - Need to add Google services
7. ⏳ `android/app/build.gradle` - Need to apply plugin
8. ⏳ `android/app/google-services.json` - Need to add (you will do this)
9. ⏳ `ios/GoogleService-Info.plist` - Need to add (you will do this)

---

**Note**: The Cloud Function `addUserFeedback2` should already exist in the Firebase project (shared with IssieDocs). If it doesn't, refer to FIREBASE_SETUP.md section 4 for the function code.

**Created**: February 23, 2026
