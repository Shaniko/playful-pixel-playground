

## Problem
The BACK button can't be tapped on mobile because all 7 games register `touchstart`/`touchend` handlers on `document` with `e.preventDefault()`, which swallows the tap before it reaches the button's `click` handler.

## Fix

### 1. Guard all document-level touch handlers in every game (`src/games/*.ts`)
In each game's `touchStartHandler`, `touchMoveHandler`, and `touchEndHandler`, add an early return that skips `preventDefault()` when the touch target is inside a `<button>` element:

```ts
if ((e.target as HTMLElement)?.closest?.('button')) return;
```

This one-line guard at the top of each touch handler lets button taps pass through normally while still capturing game gestures everywhere else.

**Files to edit** (7 files):
- `src/games/snake.ts` — `touchHandler`, `touchEndHandler`
- `src/games/tetris.ts` — `touchStartHandler`, `touchMoveHandler`, `touchEndHandler`
- `src/games/pong.ts` — `touchStartHandler`, `touchMoveHandler`
- `src/games/breakout.ts` — `touchStartHandler`, `touchMoveHandler`
- `src/games/space-invaders.ts` — `touchStartHandler`, `touchMoveHandler`, `touchEndHandler`
- `src/games/dino-runner.ts` — `touchStartHandler`, `touchEndHandler`
- `src/games/sudoku.ts` — `onTouchStart`

### 2. Version bump + QA
- Update version to **v4** in `src/pages/Index.tsx`
- QA regression: verify BACK button works on mobile, all games still respond to touch gestures, no scroll interference

