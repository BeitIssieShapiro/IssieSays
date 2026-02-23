# Race Condition Fixes Applied to Playing Buttons

## Date: 2/23/2026 (Updated)

## Summary
Applied critical fixes to prevent race conditions and state corruption when users click play buttons multiple times rapidly, during playback, and immediately after playback completes.

## Changes Made

### 1. Fixed `stopPlayback()` Race Condition (recording.tsx)
- Added `stopInProgress` mutex flag to prevent multiple simultaneous stop operations
- Added try-catch-finally error handling
- Prevents "already stopped" exceptions when multiple clicks occur

**Before:**
```typescript
export async function stopPlayback() {
  if (interruptCallback) {
    interruptCallback();
    interruptCallback = null;
  }
  await audioRecorderPlayer.stopPlayer();
  audioRecorderPlayer.removePlayBackListener();
  setCurrentlyPlaying(null);
}
```

**After:**
```typescript
let stopInProgress = false;

export async function stopPlayback() {
  if (stopInProgress) {
    console.log('stopPlayback already in progress, skipping');
    return;
  }
  stopInProgress = true;

  try {
    if (interruptCallback) {
      interruptCallback();
      interruptCallback = null;
    }
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setCurrentlyPlaying(null);
  } catch (error) {
    console.error('Error in stopPlayback:', error);
  } finally {
    stopInProgress = false;
  }
}
```

### 2. Added Error Handling to `playRecording()` (recording.tsx)
- Wrapped playback start in try-catch block
- Added `await` to `startPlayer()` call
- Properly resets `currentlyPlaying` on error
- Prevents state corruption when playback fails

**Key Changes:**
- Added `await audioRecorderPlayer.startPlayer(filePath);`
- Wrapped in try-catch with error logging
- Ensures `setCurrentlyPlaying(null)` on failure

### 3. Fixed RecordButton Pause/Resume Race Conditions (recording.tsx)
- Changed `.then()` callbacks to `await` for proper sequencing
- Added try-catch error handling for resume/pause operations
- Added `disabled={recording}` prop to prevent clicks during recording
- Prevents state desync between UI and audio player

**Before:**
```typescript
if (paused) {
  audioRecorderPlayer.resumePlayer().then(() => {
    setPlaying(true);
    setPaused(false);
  });
  return;
}
```

**After:**
```typescript
if (paused) {
  try {
    await audioRecorderPlayer.resumePlayer();
    setPlaying(true);
    setPaused(false);
  } catch (error) {
    console.error('Error resuming player:', error);
  }
  return;
}
```

### 4. Fixed MainButton Race Condition (uielements.tsx)
- Added `isOperating` ref to track operation in progress
- Prevents multiple simultaneous playback starts on same button
- Wrapped entire operation in try-catch-finally
- Added detailed logging for debugging

**Key Protection:**
```typescript
const isOperating = useRef<boolean>(false);

const onStartPlay = useCallback(async () => {
  // Prevent multiple simultaneous operations
  if (isOperating.current) {
    console.log(`Button ${recName} operation already in progress, ignoring click`);
    return;
  }

  // Check global state (more reliable than local state)
  if (currentlyPlayingRecName === recName) {
    console.log(`Button ${recName} already playing (global check), ignoring click`);
    return;
  }

  isOperating.current = true;

  try {
    // ... playback logic ...
  } catch (error) {
    console.error(`Error in onStartPlay for ${recName}:`, error);
    setPlaying(undefined);
    setPlayingInProgress(false);
  } finally {
    isOperating.current = false;
  }
}, [recName]);
```

### 5. Fixed Button Unresponsive After Playback Completes (uielements.tsx:224)
**Date: 2/23/2026**

- **Issue**: Button remained unresponsive for ~1 second after audio finished
- **Root Cause**: Check used local `playingInProgress` state which updates asynchronously, causing window where button appears stuck
- **Fix**: Changed to check global `currentlyPlayingRecName` which is synchronously updated
- **Also Fixed**: Removed `playingInProgress` and `onPlayComplete` from useCallback dependencies to prevent unnecessary re-creation

### 6. Fixed Stale Closure in onPlayComplete Callback (uielements.tsx:190, 198-200)
**Date: 2/23/2026**

- **Issue**: Callback captured old `onPlayComplete` function, could call stale handler
- **Fix**: Created `onPlayCompleteRef` that's updated via useEffect
- **Benefit**: Callback always calls the current `onPlayComplete` function

### 7. Added Component Unmount Cleanup (uielements.tsx:203-211)
**Date: 2/23/2026**

- **Issue**: If button unmounted while playing, callbacks would update unmounted component
- **Fix**: Added useEffect cleanup to stop playback when component unmounts
- **Protection**: Prevents React warnings and potential memory leaks

## Risk Mitigation

### Before Fixes:
- ❌ Multiple rapid clicks could start multiple playback operations
- ❌ Stop operations could throw exceptions
- ❌ State could get out of sync with audio player
- ❌ Memory leaks from multiple listeners
- ❌ App crashes from native audio player errors
- ❌ Button unresponsive after audio finishes
- ❌ Stale callbacks after props change
- ❌ State updates on unmounted components

### After Fixes:
- ✅ Only one operation allowed per button at a time
- ✅ Stop operations are serialized with mutex
- ✅ All async operations have error handling
- ✅ State properly synchronized with global checks
- ✅ Proper cleanup in finally blocks
- ✅ Detailed logging for debugging
- ✅ Button immediately responsive after playback
- ✅ Callbacks always use current function references
- ✅ Proper cleanup on component unmount

## Testing Recommendations

1. **Rapid Click Test**: Click play button 10+ times rapidly
2. **During Playback Test**: Click same button multiple times while audio playing
3. **Quick Switch Test**: Rapidly click different buttons in succession
4. **After Playback Test**: Click button immediately after audio finishes (within 1 second)
5. **Repeated After Playback**: Click every second after audio finishes repeatedly
6. **Pause/Resume Spam**: Rapidly toggle pause/resume in RecordButton
7. **Record During Play**: Try recording while playback active
8. **Unmount During Play**: Change number of buttons while audio playing

## Notes

- Used `useRef` for operation flags and callback refs to avoid re-render delays
- All native player calls now properly awaited or have error handlers
- Mutex pattern used for critical sections (stopPlayback)
- Global state (`currentlyPlayingRecName`) used as source of truth for responsiveness checks
- Comprehensive logging added for debugging production issues

## Pre-existing Issue
There's a TypeScript error in the Spacer component (line 34) that was already present:
```
Type 'Number | undefined' is not assignable to type 'DimensionValue | undefined'
```
This is unrelated to the race condition fixes and should be addressed separately.