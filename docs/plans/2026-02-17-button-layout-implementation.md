# Button Layout Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace device-specific button layout heuristics with exhaustive geometry-based algorithm that maximizes button size.

**Architecture:** Create helper functions to generate layout candidates and score them by calculating button size. Replace existing layout logic (lines 232-254) with optimal layout selection. Update flex container to support grid wrapping.

**Tech Stack:** React Native, TypeScript, Flexbox

---

## Task 1: Add Layout Types and Helper Functions

**Files:**
- Modify: `src/App.tsx` (add before Main function, around line 60)

**Step 1: Add type definition**

Add this type definition after the imports and before the `Main` function (around line 60):

```typescript
type LayoutCandidate = {
  rows: number;
  cols: number;
  isVertical: boolean;
};
```

**Step 2: Add getLayoutCandidates function**

Add this function after the type definition:

```typescript
function getLayoutCandidates(n: number): LayoutCandidate[] {
  switch (n) {
    case 1:
      return [{ rows: 1, cols: 1, isVertical: false }];
    case 2:
      return [
        { rows: 1, cols: 2, isVertical: false }, // horizontal
        { rows: 2, cols: 1, isVertical: true },  // vertical
      ];
    case 3:
      return [
        { rows: 1, cols: 3, isVertical: false }, // horizontal
        { rows: 3, cols: 1, isVertical: true },  // vertical
      ];
    case 4:
      return [
        { rows: 1, cols: 4, isVertical: false }, // horizontal
        { rows: 4, cols: 1, isVertical: true },  // vertical
        { rows: 2, cols: 2, isVertical: false }, // grid
      ];
    default:
      return [{ rows: 1, cols: 1, isVertical: false }];
  }
}
```

**Step 3: Add calculateOptimalLayout function**

Add this function after `getLayoutCandidates`:

```typescript
function calculateOptimalLayout(
  w: number,
  h: number,
  n: number,
): { buttonWidth: number; isVertical: boolean } {
  // Safety check for invalid dimensions
  if (w <= 0 || h <= 0 || n <= 0) {
    return { buttonWidth: 0, isVertical: false };
  }

  const layouts = getLayoutCandidates(n);

  let bestLayout = layouts[0];
  let maxButtonSize = 0;

  for (const layout of layouts) {
    const buttonSize = Math.min(w / layout.cols, h / layout.rows);

    if (buttonSize > maxButtonSize) {
      maxButtonSize = buttonSize;
      bestLayout = layout;
    }
  }

  // Apply spacing factor
  const finalButtonWidth = maxButtonSize / 1.3;

  return {
    buttonWidth: finalButtonWidth,
    isVertical: bestLayout.isVertical,
  };
}
```

**Step 4: Verify code compiles**

Run: `npx tsc --noEmit` (or your build command)
Expected: No compilation errors for new functions

**Step 5: Commit**

Skip (user requested no git operations)

---

## Task 2: Replace Old Layout Logic

**Files:**
- Modify: `src/App.tsx:232-254` (replace old layout calculation)

**Step 1: Remove unused variables**

Find these lines (around 150-151):

```typescript
const isMobile = getIsMobile(windowSize);
const isIPad = () => !isMobile;
```

Delete both lines. Keep `isLandscape` (line 194) as it's used elsewhere.

**Step 2: Replace layout calculation logic**

Find the section starting at line 232 (after the comment block `{/** all layout options`).

Replace this entire section (lines 232-254):

```typescript
let buttonWidth = w;
let hMargin = 0;

const vLine = n == 1 || (n == 2 && h / 2 > w / 2) || (n > 2 && h / n > w / 2);
const hLine = w / n > 2 * h;
const top2 = n > 1 && !vLine && !hLine;

if (vLine) {
  buttonWidth = Math.min(w, h / n);
} else if (hLine) {
  buttonWidth = h / n;
} else {
  if (n < 3) {
    buttonWidth = Math.min(w, h) / n;
  } else if (n == 3) {
    buttonWidth = Math.max(w, h) / 3;
  } else if (n == 4) {
    buttonWidth = Math.min(w, h) / 2;
  }
}

buttonWidth = buttonWidth / 1.3;
```

With this new code:

```typescript
const { buttonWidth, isVertical } = calculateOptimalLayout(w, h, n);
let hMargin = 0;
```

**Step 3: Remove commented-out old code**

Find and delete the commented-out code block (lines 256-275 in original):

```typescript
// if (isLandscape) {
//   if (isMobile) {
//     buttonWidth = Math.min(
//       w / activeButtons.length,
//       (h * (n == 1 ? 0.6 : n > 3 ? 1.3 : 1.1)) / n,
//     );
//     hMargin = windowSize.width < 830 ? 0 : 10;
//   } else {
//     buttonWidth = n == 4 ? Math.min(w / 4, (h * 0.6) / 2) : h / (n + 1);
//     hMargin = windowSize.width < 1200 ? 50 : 70;
//   }
// } else {
//   if (isMobile) {
//     buttonWidth = Math.min(n == 4 ? w / 2 : w * 0.5, (h * 0.6) / n);
//     hMargin = 10;
//   } else {
//     buttonWidth = n == 4 ? w / 3.5 : w / (n + 1);
//     hMargin = n == 4 ? 20 : 90;
//   }
// }
```

Delete the entire commented block.

**Step 4: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: No compilation errors

**Step 5: Commit**

Skip (user requested no git operations)

---

## Task 3: Update Flex Container for Grid Support

**Files:**
- Modify: `src/App.tsx:365-370` (View style for button container)

**Step 1: Add flexWrap to container**

Find the View container for buttons (around line 365):

```typescript
<View style={{
  width: "100%", height: "100%", alignItems: "center", justifyContent: "center",
  flexDirection: vLine ? "column" : "row"
}}>
  {visButtons}
</View>
```

Replace with (note `vLine` becomes `isVertical` and add `flexWrap`):

```typescript
<View style={{
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: isVertical ? "column" : "row",
  flexWrap: "wrap",
}}>
  {visButtons}
</View>
```

**Step 2: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: No compilation errors, no references to undefined `vLine`

**Step 3: Commit**

Skip (user requested no git operations)

---

## Task 4: Manual Testing on Different Screen Sizes

**Files:**
- Test: `src/App.tsx` (visual testing on various dimensions)

**Step 1: Test with 1 button**

Run the app in simulator/emulator.
Set profile to have 1 button.
Test both portrait and landscape.
Expected: Button maximizes available space (square)

**Step 2: Test with 2 buttons**

Set profile to have 2 buttons.
Test portrait (very tall): Expect vertical layout (2 buttons stacked)
Test landscape (very wide): Expect horizontal layout (2 buttons side-by-side)
Test square-ish screen: Should pick whichever gives bigger buttons

**Step 3: Test with 3 buttons**

Set profile to have 3 buttons.
Test portrait: Expect vertical column
Test landscape: Expect horizontal row
Expected: Buttons maximize space in chosen layout

**Step 4: Test with 4 buttons**

Set profile to have 4 buttons.
Test very wide screen (landscape tablet): May choose horizontal 1×4 row
Test very tall screen (portrait phone): May choose vertical 4×1 column
Test square-ish screen (iPad): Should choose 2×2 grid
Expected: Grid wraps correctly with 2 buttons per row when 2×2 wins

**Step 5: Test edge cases**

Test screen rotation: Buttons should re-layout optimally
Test safe area insets: Buttons should not overlap notches
Test with debug console: Check no errors or warnings

**Step 6: Visual verification**

For each configuration, verify:
- All buttons are equal size
- Buttons appear to maximize available space
- Layout makes geometric sense for screen dimensions
- No buttons cut off or overlapping

---

## Task 5: Cleanup and Verification

**Files:**
- Review: `src/App.tsx`

**Step 1: Search for unused variables**

Search for any references to removed variables:
- `isMobile` - should have 0 references (was removed)
- `isIPad` - should have 0 references (was removed)
- `vLine` - should have 0 references (replaced with `isVertical`)
- `hLine` - should have 0 references (removed)
- `top2` - should have 0 references (removed)

Expected: No references found

**Step 2: Check TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: SUCCESS with no errors

**Step 3: Check for console warnings**

Run app and check console for:
- No unused variable warnings
- No layout warnings
- No undefined references

Expected: Clean console

**Step 4: Review code structure**

Verify:
- Helper functions are before Main function
- Layout calculation is clean and readable
- No commented-out code blocks remain
- Code follows existing style conventions

**Step 5: Final commit**

Skip (user requested no git operations)

---

## Implementation Complete

All tasks completed. The button layout now uses an exhaustive geometry-based algorithm that maximizes button size across all screen dimensions and button counts (1-4).
