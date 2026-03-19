

## Updated QA Checklist + Luigi Character for Dino Run

### Full Issue/Request Tracker

Here is the complete list of everything we've addressed, including design and scroll issues:

1. **Sudoku keyboard navigation** -- Arrow keys and Tab for cell movement
2. **Sudoku mobile number picker** -- Canvas-drawn 3x3 pad when tapping cells
3. **Snake touch controls** -- Swipe gestures for direction
4. **Tetris touch controls** -- Swipe left/right/down, tap to rotate, swipe up for hard drop
5. **Pong touch controls** -- Drag to move paddle
6. **Breakout touch controls** -- Drag paddle + tap to launch
7. **Space Invaders touch controls** -- Drag to move + hold to shoot
8. **Dino Runner touch controls** -- Tap to jump + swipe down to duck
9. **Mobile difficulty selector overflow** -- Buttons stacked vertically on small screens
10. **Mobile instructions** -- Touch-specific hints instead of keyboard keys
11. **Canvas scroll/zoom interference** -- `touch-action: none` on all game canvases
12. **Body scroll lock** -- `overflow: hidden` on body when game overlay is open
13. **Touch target sizes** -- Minimum 44px for back button and difficulty buttons
14. **Theme support** -- All games render correctly in both Arcade (dark) and Airy (light) themes

Every time you report a new issue, it gets added here. When you ask to verify, I'll check all items.

---

### New Feature: Replace Cat with Luigi in Dino Run

Replace the current orange cat character (`drawCat` function) with a pixel-art Luigi character drawn on canvas.

#### Luigi Design
- **Green cap** with "L" letter and white circle emblem
- **Face** -- skin tone oval, big blue eyes, brown mustache
- **Body** -- green shirt/overalls (blue overalls over green shirt, like classic Luigi)
- **Arms** that swing while running
- **Legs** with running animation (same leg phase logic)
- **Ducking pose** -- Luigi crouching flat
- **Dead pose** -- X eyes, same as current

#### Changes
- **`src/games/dino-runner.ts`**: Replace `drawCat()` with `drawLuigi()` -- same signature `(x, y, dead)`, same hitbox radius (~18px), same ducking logic. Rename internal references from "cat" to "luigi" for clarity.
- **`src/pages/Index.tsx`**: Optionally update the Dino Run emoji from 🐱 to something like 🟢 or keep it as-is.
- Collision box stays the same size so gameplay is unchanged.

