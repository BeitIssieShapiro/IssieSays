# Race Condition Review and Fixes - February 23, 2026

## Issue Reported
User reported that after audio finishes playing, the button becomes unresponsive for ~1 second. If they keep pressing every second, it never starts - only if they let it rest.

## Root Cause Analysis

### The Problem
The original code had a check at line 224:
```typescript
if (playingInProgress && currentlyPlayingRecName === recName) {
  console.log(`Button ${recName} already playing, ignoring click`);
  return;
}
```

When audio finished:
1. Playback callback fires, sets `setPlayingInProgress(false)`
2. React state updates are asynchronous - component hasn't re-rendered yet
3. User clicks button immediately (< 1 second after finish)
4. Check sees stale `playingInProgress = true` value
5. Click is blocked even though audio is done

The global `currentlyPlayingRecName` is set to `null` synchronously in `stopPlayback()`, but the check required BOTH conditions, so the stale local state blocked the click.

## Fixes Implemented

### Fix 1: Use Global State for Responsiveness Check (uielements.tsx:224-227)
**Changed from:**
```typescript
if (playingInProgress && currentlyPlayingRecName === recName) {
```

**Changed to:**
```typescript
if (currentlyPlayingRecName === recName) {
```

**Why**: Global state is updated synchronously, local state updates asynchronously. This eliminates the window where button appears stuck.

### Fix 2: Remove Unused `playingInProgress` State (uielements.tsx:185)
**Removed:** `const [playingInProgress, setPlayingInProgress] = useState(false);`

**Why**: After fix #1, this state was no longer used anywhere. The `playing` state is sufficient for visual display.

**Cleanup**: Removed all `setPlayingInProgress()` calls throughout the component.

### Fix 3: Fix Stale Closure in Callback (uielements.tsx:189, 197-199, 259, 274)
**Added:**
```typescript
const onPlayCompleteRef = useRef(onPlayComplete);

useEffect(() => {
  onPlayCompleteRef.current = onPlayComplete;
}, [onPlayComplete]);
```

**Changed callbacks to use:** `onPlayCompleteRef.current()` instead of `onPlayComplete()`

**Why**: Callback function is created once and captures `onPlayComplete` at that time. If parent changes the callback (unlikely but possible), we'd call stale function. Ref always points to current function.

### Fix 4: Component Unmount Cleanup (uielements.tsx:202-209)
**Added:**
```typescript
useEffect(() => {
  return () => {
    if (currentlyPlayingRecName === recName) {
      console.log(`MainButton ${recName} unmounting while playing, stopping playback`);
      stopPlayback();
    }
  };
}, [recName]);
```

**Why**: If user changes number of buttons or navigates away while audio playing, component unmounts but callbacks still fire, trying to update unmounted component state. This cleanup prevents React warnings and memory leaks.

### Fix 5: Simplified useCallback Dependencies (uielements.tsx:284)
**Changed from:**
```typescript
}, [playingInProgress, recName, onPlayComplete]);
```

**Changed to:**
```typescript
}, [recName]);
```

**Why**:
- Removed `playingInProgress` - no longer used in callback
- Removed `onPlayComplete` - now using ref, so changes don't require callback recreation
- Only `recName` is truly needed

## Testing Validation

### Test Cases to Verify
1. ✅ Click button immediately after audio finishes - should start playing
2. ✅ Click repeatedly every second after finish - should start playing each time
3. ✅ Click rapidly 10+ times - should ignore extra clicks
4. ✅ Click different buttons while one playing - should switch cleanly
5. ✅ Change number of buttons while audio playing - should cleanup properly
6. ✅ Navigate away during playback - should stop audio

## Summary

The button unresponsiveness was caused by relying on asynchronous local state (`playingInProgress`) instead of synchronous global state (`currentlyPlayingRecName`) for the "already playing" check. By switching to global state and removing the unused local state, the button now responds immediately after audio finishes.

Additional improvements ensure proper cleanup on unmount and prevent stale callback references.

## Files Modified
- src/uielements.tsx - MainButton component
- RACE_CONDITION_FIXES.md - Updated documentation
