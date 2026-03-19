# QA Checklist — THE ARCADE

## How to use
- Run through this list after every significant change
- Mark ✅ or ❌ for each item
- Add new items at the bottom when new issues are found/fixed

---

## 1. General UI & Layout

- [ ] Home page loads without errors
- [ ] Game cards grid: 1 column on mobile, 2 on sm, 3 on lg
- [ ] Theme toggle (Arcade/Airy) switches correctly
- [ ] All game cards are clickable and open the overlay
- [ ] No horizontal scroll on any screen size

## 2. Game Overlay

- [ ] Overlay opens with back button and difficulty selector
- [ ] Back button is at least 44px tap target
- [ ] Difficulty buttons stack vertically on mobile (`flex-col`)
- [ ] Difficulty buttons don't overflow on small screens
- [ ] `overflow: hidden` on body when overlay is open (no background scroll)
- [ ] Canvas has `touch-action: none` (no accidental zoom/scroll)
- [ ] Instructions show touch hints on mobile, keyboard hints on desktop
- [ ] Overlay closes cleanly, body scroll restored

## 3. Sudoku

- [ ] Arrow keys + Tab navigate between cells (desktop)
- [ ] Number keys 1-9 fill cells, Backspace/Delete clears
- [ ] Mobile: tapping empty cell shows canvas number picker (3×3 grid + delete)
- [ ] Number picker selects number and dismisses
- [ ] Fixed cells cannot be edited
- [ ] Win detection works when grid is completed correctly
- [ ] Theme colors correct in both Arcade and Airy

## 4. Snake

- [ ] Arrow keys control direction (desktop)
- [ ] Mobile: swipe up/down/left/right changes direction
- [ ] Snake grows when eating food
- [ ] Game over on wall/self collision
- [ ] High score saved and displayed
- [ ] No scroll when swiping during gameplay

## 5. Tetris

- [ ] Arrow keys + up to rotate (desktop)
- [ ] Mobile: swipe left/right = move, swipe down = soft drop, tap = rotate, swipe up = hard drop
- [ ] Line clearing works and scores update
- [ ] Game over when pieces stack to top
- [ ] No scroll when swiping during gameplay

## 6. Pong

- [ ] Arrow keys or W/S control paddle (desktop)
- [ ] Mobile: drag finger to move paddle
- [ ] AI opponent works
- [ ] Ball physics and scoring correct
- [ ] No scroll when dragging during gameplay

## 7. Breakout

- [ ] Arrow keys or mouse move paddle (desktop)
- [ ] Mobile: drag to move paddle, tap to launch ball
- [ ] Bricks break on hit, score updates
- [ ] Ball bounces correctly off walls/paddle/bricks
- [ ] No scroll when dragging during gameplay

## 8. Space Invaders

- [ ] Arrow keys to move, Space to shoot (desktop)
- [ ] Mobile: drag to move, tap/hold to shoot
- [ ] Invaders move and descend
- [ ] Player can die, lives displayed
- [ ] No scroll when dragging during gameplay

## 9. Dino Run

- [ ] Space/ArrowUp to jump, ArrowDown to duck (desktop)
- [ ] Mobile: tap to jump, swipe down to duck
- [ ] Cat character runs with leg animation
- [ ] Obstacles (cactus + birds) spawn and increase speed
- [ ] Game over on collision, high score saved
- [ ] 1-second delay before restart is allowed
- [ ] No scroll when tapping/swiping during gameplay

## 10. Cross-cutting: Scroll & Touch

- [ ] No game canvas causes page scroll when interacting
- [ ] No pinch-to-zoom on game canvases
- [ ] Swiping inside any game does NOT scroll the page behind
- [ ] Returning from game overlay restores normal page scrolling
- [ ] All games playable on mobile viewport (390px wide)
- [ ] All games playable on tablet viewport (768px wide)
- [ ] All games playable on desktop viewport (1024px+ wide)

## 11. Theme Consistency

- [ ] All 7 games render correctly in Arcade (dark) theme
- [ ] All 7 games render correctly in Airy (light) theme
- [ ] HUD text (score, instructions) readable in both themes
- [ ] Game overlay background matches current theme

---

## Issue Log

| # | Issue | Status | Date Found |
|---|-------|--------|------------|
| 1 | Sudoku keyboard navigation broken | ✅ Fixed | — |
| 2 | Sudoku mobile number picker missing | ✅ Fixed | — |
| 3 | Snake no touch controls | ✅ Fixed | — |
| 4 | Tetris no touch controls | ✅ Fixed | — |
| 5 | Pong no touch controls | ✅ Fixed | — |
| 6 | Breakout no touch controls | ✅ Fixed | — |
| 7 | Space Invaders no touch controls | ✅ Fixed | — |
| 8 | Dino Runner no touch controls | ✅ Fixed | — |
| 9 | Mobile difficulty buttons overflow | ✅ Fixed | — |
| 10 | Instructions show keyboard-only on mobile | ✅ Fixed | — |
| 11 | Canvas scroll/zoom interference | ✅ Fixed | — |
| 12 | Body scroll not locked in overlay | ✅ Fixed | — |
| 13 | Touch targets too small | ✅ Fixed | — |
| 14 | Theme support for all games | ✅ Fixed | — |

| 15 | HUD/score text clipped or invisible (Snake) | ✅ Fixed | — |
| 16 | Tetris grid not filling canvas | ✅ Fixed | — |

## 12. Canvas Utilization

- [ ] All games fill their canvas area properly (no large empty borders)
- [ ] HUD text (score, level, lives) is fully visible in all games
- [ ] Game area is maximized within canvas bounds

_Add new issues below this line:_
