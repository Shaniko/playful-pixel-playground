

## Problem
Touch gestures outside the canvas don't work in games (confirmed with Snake, likely affects others). The touch event listeners are already on `document` level, but the overlay container lacks `touch-action: none`, so the browser may be consuming swipe/drag gestures as scroll/navigation before JavaScript handlers fire.

## Root Cause
The `touch-action: none` CSS is only on the `<canvas>` element. The surrounding overlay `<div>` elements don't have it, so when a user swipes on the area outside the canvas, the browser interprets it as a scroll/back-navigation gesture and may not fire `touchend`/`touchmove` properly.

## Fix

### 1. Add `touch-action: none` to the game overlay container (`src/components/GameOverlay.tsx`)
- Add `touch-action: none` style to the outermost game `<div>` (the `fixed inset-0` container) so all touches anywhere in the overlay are handled by JavaScript, not the browser.

### 2. QA regression per `QA-CHECKLIST.md`
- Verify all 7 games respond to touch from anywhere on the screen.
- Verify BACK button still works on touch.
- Verify HUD/scores are visible.
- Version bump to v3.

