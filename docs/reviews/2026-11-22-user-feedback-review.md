# IssieSays review — user feedback (iOS), 2026-11-22

## Reports

1. "When I edit buttons I don't see the changes until I exit the editing, then go back in." (iOS)
2. "Interface for saving profiles is not intuitive — having trouble saving profiles."
   "השינויים לא נשמרים ולא תמיד רואים בתצוגה. צריכה לצאת מההגדרות ואז לחזור כדי לראות שזה שמור. ההקלטה שמורה אבל לא רואים את השינויים הויזואליים." (iOS)

## Root cause of both reports

**A button save crashes halfway, so the screen never refreshes.**

`handleSaveButton` (`src/settings.tsx`) writes each field to MMKV in turn and calls
`setRevision()` at the end to re-render. Every write goes through `Settings.setArray`,
which rebuilds the whole array from `profile.buttons`, and some of those values can be
`undefined`. MMKV 3.3.3 (`MmkvHostObject.cpp`) throws on `set(key, undefined)`:
"value argument is not of type bool, number, string or buffer". `handleSaveButton` is
never awaited or caught, so in release builds the error is silent:

- fields written before the throw are saved, but the screen isn't redrawn
- fields after the throw are lost
- leaving Settings and coming back calls `readCurrentProfile()` again, so the partial changes appear

**Where the `undefined` values come from:**

1. `readCurrentProfile` (`src/profile.ts`) has no fallback for `scale`, `offset.x/y` or `dirty`
   (color, name and image use `|| default`). `getArray` only returns items up to the count it
   stored earlier, so a button added after that count was written gets `undefined`.
2. `dirty` is the most common trigger. Example: with 1 button, edit it (dirty count = 1).
   Add a button, then edit button 0. The array is `[true, undefined]` and the write throws.
   This happens *after* the audio move, which is why "the recording is saved". It stays broken
   because `setArray` writes the new count before it throws.
3. `Settings.truncateArray` (`src/setting-storage.ts`, called on Settings close) deletes items
   but leaves the count unchanged. `writeCurrentProfile` writes arrays of 20, so after
   load profile → close Settings → add button, scale and offset edits throw.
4. `writeCurrentProfile` never writes `BUTTONS_DIRTY`, so stale dirty arrays survive a profile switch.

## Other user-facing bugs

5. **Fresh install loses the button name on every launch.** `BUTTONS` is never set unless the
   user taps +/- or loads a profile. Until then, `Init` reruns the welcome setup on each launch:
   button 0's name goes back to "Welcome" and show-name is turned back on. On Android the
   welcome audio also overwrites recording 0 (`copyFileAssets` overwrites).
6. **Switching to the default profile can crash for older users.** `newProfile()` has no
   `offset` or `scale`, and `createHomeProfile` (1.0 migration) saves that. Later,
   `writeCurrentProfile` reads `btn.offset.x` and throws after it has already changed the
   current profile name and button count: a half-loaded profile. Deleting the current profile
   goes through `LoadProfile(Default)` and fails too. `createHomeProfile`/`createNewProfile`
   also embedded the current button's audio and images into the "empty" profile.
7. **No Default profile file on fresh installs.** It's only written when switching away from it.
   The profile list says "No items"; after creating a profile, Default is missing from the list;
   "Save As" on Default fails, and `Alert.alert(err)` is given an Error object instead of a string.
8. **"Create profile" is really "rename current".** It saves the current buttons under the new
   name and switches to it. The previous profile's file is never updated, so edits made since
   the last switch quietly move to the new profile. Probably the main "not intuitive" complaint.
9. **Rename → "Overwrite" does nothing.** The `overwrite` flag never reaches `renameProfile`,
   so it throws `AlreadyExists` again and nobody handles it. (iOS `moveFile` also fails when the target exists.)
10. **Profile names aren't trimmed or checked for empty.** An empty name saves `profiles/.json`,
    and `CURRENT_PROFILE = ""` makes `readCurrentProfile` reset to Default.
11. **Button editor:** the name field (`defaultValue`) doesn't update after "Load from list".
    `RecordButton` ignores changes to its `name` prop and plays the old recording until saved.

## Import / export / backup

12. **Restoring onto a fresh device can wipe the restored Default profile.** The backup's
    `DefaultProfile.json` is imported (no file exists yet), but the current state in MMKV is still
    the welcome button. The first profile switch makes `LoadProfile` save that state over the restored Default.
13. **Import hides failures.** Any error other than `AlreadyExists` is swallowed, and the dialog
    still says "success". A stray non-zip item in a backup (`__MACOSX`, `.DS_Store`) makes `unzip`
    throw and stops the whole import.
14. **Restore never overwrites.** Existing profile names (including Default) are always skipped,
    so restoring onto the same device usually restores nothing.
15. **Export and backup errors:** if `SaveProfile` throws before export starts, the progress
    overlay stays on screen forever. If backup fails, `shareFile(undefined)` runs and the user
    sees "Action cancelled" instead of an error.
16. **Image-search pictures (http URLs) aren't included in exports**, so imported profiles need
    network access to show them. Not a bug, just a limitation.

## Fix status (2026-11-22)

- Fixed: 1–7, 9–15. Restoring over existing profiles (#12, #14) is now an explicit
  "Replace Existing" button in the import result dialog. Replacing the active profile also
  reloads it into settings.
- Also fixed: `isEmptyButton` checked the recording the wrong way round (it treated
  "has a recording" as empty).
- Fixed #8 (decided 2026-11-22): **Create** saves the current profile, then starts a new
  profile with one empty button and switches to it. **Save As** (save icon on each row) still copies
  without switching, and now shows a "Saved as '<name>'" toast.
- Not changed: #16.
- Not verified on device: no `node_modules` in the checkout, so no build, lint or tests yet.
- Also fixed (found while testing): the export progress bar was hidden behind the profile list.
  The list now closes before the export starts.
