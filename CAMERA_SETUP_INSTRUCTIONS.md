# Camera Feature Setup Instructions for iOS

This document provides step-by-step instructions for setting up the camera capture feature in IssieSays iOS.

## Overview

The camera feature has been implemented using:
- `react-native-camera-kit@^16.1.3` - Camera capture functionality
- `@react-native-community/image-editor@^4.3.0` - Image editing/cropping capabilities

## iOS Configuration Steps

### 1. Clean and Install CocoaPods Dependencies

**IMPORTANT**: You need to clean the existing pods first since we updated the Podfile with permissions setup.

```bash
cd ios
pod deintegrate
rm -rf Pods Podfile.lock
pod install
cd ..
```

If you encounter any issues, also clean derived data:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### 2. Update Info.plist

Add camera usage description to `ios/IssieSays/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>IssieSays needs access to your camera to take photos for buttons</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>IssieSays needs access to your photo library to save and select images</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>IssieSays needs permission to save photos to your library</string>
```

**Location in Info.plist**: Add these entries inside the main `<dict>` tag, typically after other permission entries.

### 3. Verify Podfile Configuration

The Podfile has been updated to include:

1. **Permissions setup** (already added):
```ruby
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native-permissions/scripts/setup.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

setup_permissions([
  'Camera',
  'PhotoLibrary',
  'Microphone',
])
```

2. **Minimum iOS version**: 15.6 (already configured)

This setup is required for `react-native-permissions` to work correctly with the camera.

### 4. Link Native Dependencies

The packages should auto-link with React Native 0.81+. However, if you encounter issues:

```bash
npx react-native clean
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 5. Build Settings in Xcode

Open `ios/IssieSays.xcworkspace` in Xcode:

1. **Camera Permissions**:
   - Select your project in the Project Navigator
   - Go to the "Info" tab
   - Verify the camera usage descriptions are present

2. **Enable Camera in Capabilities** (if needed):
   - Select your target
   - Go to "Signing & Capabilities"
   - Ensure your provisioning profile supports camera usage

3. **Build Phases**:
   - No manual linking should be needed with auto-linking
   - Verify `libRNCameraKit.a` and `RNCImageEditor` appear in "Link Binary With Libraries"

### 6. Test on Real Device

**IMPORTANT**: Camera functionality requires a real iOS device. It will not work on the iOS Simulator.

To test:
1. Connect your iOS device
2. Select your device as the build target in Xcode
3. Run the app: `npx react-native run-ios --device`

## Verification Checklist

- [ ] Pod install completed successfully
- [ ] Info.plist updated with camera permissions
- [ ] Podfile has minimum iOS version 11.0+
- [ ] Project builds without errors
- [ ] Camera icon appears in Edit Button screen
- [ ] Tapping camera icon opens camera view
- [ ] Camera capture works on real device
- [ ] Captured image can be cropped/rotated
- [ ] Image is saved and displayed on button

## Troubleshooting

### Issue: "Camera permission denied"
- Check Info.plist has NSCameraUsageDescription
- Uninstall and reinstall the app to trigger permission prompt

### Issue: Camera view is black
- Ensure testing on a real device (not simulator)
- Check that camera permissions are granted in iOS Settings

### Issue: Build errors related to camera-kit
```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native clean
```

### Issue: Auto-linking not working
Verify `react-native.config.js` doesn't exclude the packages:
```javascript
module.exports = {
  dependencies: {
    'react-native-camera-kit': {
      platforms: {
        android: null, // disable Android if needed
      },
    },
  },
};
```

## File Changes Summary

### New Files Created:
1. `src/camera-capture.tsx` - Camera capture component with UI

### Modified Files:
1. `src/edit-button.tsx` - Added camera icon and integration
2. `package.json` - Added camera-kit and image-editor dependencies

## Usage Flow

1. User navigates to Edit Button screen
2. User taps the "Take Photo" camera icon
3. Camera view opens in full screen
4. User takes photo by tapping capture button
5. Photo is saved to documents directory
6. User can then tap "Edit Image" to crop/rotate
7. Final image is displayed on the button

## Next Steps After Setup

Once iOS setup is complete:
1. Test camera capture on iOS device
2. Test image editing (crop/rotate) functionality
3. Verify image persistence across app restarts
4. Test with different button colors/backgrounds

## Additional Notes

- The camera feature uses the device's back camera by default
- Photos are saved as JPG files in the Documents directory
- File naming convention: `camera_[timestamp].jpg`
- Crop/rotate functionality uses the existing `ImageAdjustModal` component
- Camera permissions are requested at runtime when feature is first used

## Support

For issues specific to:
- **react-native-camera-kit**: https://github.com/teslamotors/react-native-camera-kit
- **image-editor**: https://github.com/callstack/react-native-image-editor