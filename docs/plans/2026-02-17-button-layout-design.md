# Button Layout Optimization Design

## Overview

Replace the current device-specific button layout algorithm in App.tsx with a geometry-based exhaustive search algorithm that maximizes button size for 1-4 buttons.

## Problem Statement

The current implementation uses device-specific heuristics (landscape/portrait, mobile/tablet) with hard-coded scaling factors and margins. This approach:
- Is difficult to reason about and maintain
- May not produce optimal button sizes for all screen dimensions
- Contains significant amounts of commented-out legacy code

The new algorithm should maximize button size based purely on available screen geometry, regardless of device type.

## Requirements

1. Support 1-4 buttons with all buttons the same size
2. Maximize button size based on available screen space (w × h)
3. Maintain the 1.3 scaling factor for spacing/padding (design requirement)
4. Support safe area insets (camera notches, etc.)
5. Choose optimal layout dynamically based on screen aspect ratio

## Architecture

### Three-Phase Algorithm

**Phase 1: Generate Layout Candidates**
For each button count, define all valid layout configurations as `{rows, cols}` pairs:
- 1 button: `[{1,1}]`
- 2 buttons: `[{1,2}, {2,1}]` (horizontal, vertical)
- 3 buttons: `[{1,3}, {3,1}]` (horizontal, vertical)
- 4 buttons: `[{1,4}, {4,1}, {2,2}]` (horizontal, vertical, grid)

**Phase 2: Score Each Layout**
For each layout candidate, calculate maximum button size:
```
buttonSize = min(availableWidth / cols, availableHeight / rows)
```
This ensures square buttons fit within the layout grid.

**Phase 3: Select Winner**
- Pick the layout with largest button size
- Apply 1.3 scaling factor for spacing
- Return button size and layout direction

## Implementation Details

### Data Structure

```typescript
type LayoutCandidate = {
  rows: number;
  cols: number;
  isVertical: boolean;  // true for column flex, false for row flex
};
```

### Core Functions

**calculateOptimalLayout(w, h, n)**
- Takes available width, height, and button count
- Returns `{buttonWidth, isVertical}`
- Performs exhaustive comparison of all layout candidates
- Applies 1.3 scaling factor to winner

**getLayoutCandidates(n)**
- Returns array of LayoutCandidate objects for given button count
- Encapsulates the valid layout options for each case

### Grid Layout Handling

For 4 buttons in a 2×2 grid:
- Use `flexDirection: "row"` with `flexWrap: "wrap"`
- Calculate button width for 2 columns
- Flexbox automatically wraps after 2 buttons to create grid

### Code Location

**Replace** (lines 232-254): Old layout calculation logic
**Update** (lines 365-370): Add `flexWrap: "wrap"` to View style
**Remove**: Unused variables `isMobile`, `isIPad`, old commented code (lines 256-275)
**Keep**: `isLandscape` (used elsewhere for UI positioning)

## Edge Cases

1. **Zero/negative dimensions**: Check if `w <= 0 || h <= 0 || n <= 0`, return safe defaults
2. **Safe area insets**: Already handled correctly (lines 195-196)
3. **Single button**: Still uses exhaustive algorithm for consistency
4. **Grid wrapping**: Flexbox handles 2×2 layout automatically with flexWrap

## Testing Considerations

Test on various screen dimensions:
- Very wide screens (expect horizontal layouts to win)
- Very tall screens (expect vertical layouts to win)
- Square-ish screens (expect grids to win for 4 buttons)
- Edge cases: minimal dimensions, safe area insets

## Benefits

1. **Optimal button sizing**: Mathematically guaranteed largest buttons
2. **Simpler logic**: No device-specific branching or heuristics
3. **Maintainable**: Clear algorithm, easy to understand and modify
4. **Predictable**: Same screen size always produces same layout
5. **Clean code**: Removes ~40 lines of commented legacy code

## Trade-offs

**Pros**:
- Optimal button size
- Simple, testable code
- No magic numbers or thresholds

**Cons**:
- Slightly more calculations (negligible performance impact)
- May choose unusual layouts on edge-case screens (but they're mathematically optimal)
