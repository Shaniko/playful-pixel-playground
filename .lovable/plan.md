

## Mobile Touch Controls for All Games

### The Problem
No game has touch event listeners. On mobile, games are completely unplayable -- no way to input numbers (Sudoku), move paddles, steer snake, etc. Dino Runner has a click handler for jump but no swipe-down for ducking.

### Plan

#### 1. Sudoku -- Number pad popup on cell tap
When a non-fixed cell is tapped on mobile, show a 3x3 number grid (1-9) plus a delete button **drawn on the canvas** below or near the selected cell. Tapping a number fills it in, tapping delete clears it. This is the core request.

- Add `touchstart` listener that does cell selection (same as click)
- When a non-fixed cell is selected, draw a number picker panel (1-9 + X to clear) at the bottom of the canvas
- Tapping a number in the picker fills the cell and dismisses the picker
- Increase canvas height slightly to accommodate the picker area

#### 2. Snake -- Swipe gestures
- Track `touchstart` position, on `touchend` calculate swipe direction (up/down/left/right based on delta)
- Map to direction changes, same as arrow keys

#### 3. Tetris -- Swipe + tap
- Swipe left/right = move piece
- Swipe down = soft drop
- Tap = rotate
- Swipe up = hard drop

#### 4. Pong -- Touch drag
- `touchmove` on canvas: map touch Y position to paddle Y
- Simple and intuitive

#### 5. Breakout -- Touch drag + tap
- `touchmove`: map touch X to paddle X
- Tap to launch ball

#### 6. Space Invaders -- Touch drag + tap
- `touchmove`: map touch X to player X
- Tap to shoot

#### 7. Dino Runner -- Tap to jump, swipe down to duck
- Already has click-to-jump; add `touchstart` for jump
- Add swipe-down detection for ducking, `touchend` to stop ducking

#### 8. GameOverlay & CSS updates
- Add `touch-action: none` on canvas to prevent scroll/zoom interference
- Show mobile-appropriate instructions ("Tap cell + pick number", "Swipe to move", etc.) -- detect touch via `'ontouchstart' in window`
- Difficulty buttons: add `flex-col sm:flex-row` for mobile stacking

### Files to modify
- `src/games/sudoku.ts` -- Number picker UI + touch events
- `src/games/snake.ts` -- Swipe gesture handler
- `src/games/tetris.ts` -- Swipe/tap handler
- `src/games/pong.ts` -- Touch drag handler
- `src/games/breakout.ts` -- Touch drag + tap handler
- `src/games/space-invaders.ts` -- Touch drag + tap handler
- `src/games/dino-runner.ts` -- Touch jump + swipe-down duck
- `src/components/GameOverlay.tsx` -- Mobile instructions, touch-action CSS, responsive difficulty layout
- `src/index.css` -- `touch-action: none` utility for canvas

