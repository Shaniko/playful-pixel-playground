// Sudoku game – canvas-based, 9x9 grid with backtracking generator
import { sfxClick, sfxHint, sfxWin } from './sfx';
import { getTheme } from './theme';

let animId = 0;
let stopped = false;

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  const W = 420;
  const H = 560; // taller to fit number picker
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  stopped = false;

  const CELL = 42;
  const PAD = 12;
  const GRID = CELL * 9;
  const holes = difficulty === 'easy' ? 35 : difficulty === 'hard' ? 55 : 45;

  // Hint button dimensions
  const HINT_BTN = { x: W / 2 - 50, y: PAD + GRID + 45, w: 100, h: 34 };
  let hintsUsed = 0;

  // Number picker (bottom of canvas, always visible when cell selected)
  const PICKER_Y = PAD + GRID + 90;
  const PICKER_BTN = 38;
  const PICKER_GAP = 4;
  const PICKER_TOTAL_W = 5 * PICKER_BTN + 4 * PICKER_GAP;
  const PICKER_OX = (W - PICKER_TOTAL_W) / 2;

  let solution: number[][] = [];
  let puzzle: number[][] = [];
  let player: number[][] = [];
  let fixed: boolean[][] = [];
  let selR = -1;
  let selC = -1;
  let won = false;
  let hintFlash = -1;
  let showPicker = false;

  function generateSolution(): number[][] {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    function isValid(b: number[][], r: number, c: number, n: number) {
      for (let i = 0; i < 9; i++) {
        if (b[r][i] === n || b[i][c] === n) return false;
      }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let i = br; i < br + 3; i++)
        for (let j = bc; j < bc + 3; j++)
          if (b[i][j] === n) return false;
      return true;
    }
    function fill(b: number[][]): boolean {
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++) {
          if (b[r][c] === 0) {
            const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const n of nums) {
              if (isValid(b, r, c, n)) {
                b[r][c] = n;
                if (fill(b)) return true;
                b[r][c] = 0;
              }
            }
            return false;
          }
        }
      return true;
    }
    fill(board);
    return board;
  }

  function shuffle(arr: number[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function makePuzzle(sol: number[][], h: number): number[][] {
    const p = sol.map(r => [...r]);
    const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (let i = 0; i < h; i++) {
      const idx = cells[i];
      p[Math.floor(idx / 9)][idx % 9] = 0;
    }
    return p;
  }

  function initGame() {
    solution = generateSolution();
    puzzle = makePuzzle(solution, holes);
    player = puzzle.map(r => [...r]);
    fixed = puzzle.map(r => r.map(v => v !== 0));
    selR = -1;
    selC = -1;
    won = false;
    hintsUsed = 0;
    hintFlash = -1;
    showPicker = false;
  }

  function useHint() {
    if (won) return;
    const candidates: [number, number][] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!fixed[r][c] && player[r][c] !== solution[r][c])
          candidates.push([r, c]);
    if (candidates.length === 0) return;
    const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
    player[r][c] = solution[r][c];
    fixed[r][c] = true;
    selR = r;
    selC = c;
    hintsUsed++;
    hintFlash = Date.now();
    showPicker = false;
    sfxHint();
    if (checkWin()) { won = true; sfxWin(); }
  }

  function checkWin(): boolean {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (player[r][c] !== solution[r][c]) return false;
    return true;
  }

  function hasError(r: number, c: number): boolean {
    const v = player[r][c];
    if (v === 0) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && player[r][i] === v) return true;
      if (i !== r && player[i][c] === v) return true;
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++)
      for (let j = bc; j < bc + 3; j++)
        if ((i !== r || j !== c) && player[i][j] === v) return true;
    return false;
  }

  function getPickerBtn(n: number): { x: number; y: number; w: number; h: number } {
    // Layout: two rows - top row 1-5, bottom row 6-9 + X(delete=0)
    const idx = n === 0 ? 9 : n - 1; // 0 means delete, put at position 9
    const row = Math.floor(idx / 5);
    const col = idx % 5;
    return {
      x: PICKER_OX + col * (PICKER_BTN + PICKER_GAP),
      y: PICKER_Y + row * (PICKER_BTN + PICKER_GAP),
      w: PICKER_BTN,
      h: PICKER_BTN,
    };
  }

  function drawPicker() {
    const t = getTheme();
    // Draw all 10 buttons: 1-9 and X (delete)
    for (let n = 1; n <= 9; n++) {
      const btn = getPickerBtn(n);
      ctx.fillStyle = t.primarySoft;
      ctx.strokeStyle = t.primary;
      ctx.lineWidth = 1.5;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(btn.x + r, btn.y);
      ctx.arcTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + btn.h, r);
      ctx.arcTo(btn.x + btn.w, btn.y + btn.h, btn.x, btn.y + btn.h, r);
      ctx.arcTo(btn.x, btn.y + btn.h, btn.x, btn.y, r);
      ctx.arcTo(btn.x, btn.y, btn.x + btn.w, btn.y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.primary;
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
    // Delete button
    const del = getPickerBtn(0);
    ctx.fillStyle = 'rgba(239,68,68,0.1)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(del.x + r, del.y);
    ctx.arcTo(del.x + del.w, del.y, del.x + del.w, del.y + del.h, r);
    ctx.arcTo(del.x + del.w, del.y + del.h, del.x, del.y + del.h, r);
    ctx.arcTo(del.x, del.y + del.h, del.x, del.y, r);
    ctx.arcTo(del.x, del.y, del.x + del.w, del.y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', del.x + del.w / 2, del.y + del.h / 2);
  }

  function draw() {
    const t = getTheme();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    const ox = PAD;
    const oy = PAD;

    // Highlight selected row/col/block
    if (selR >= 0 && selC >= 0 && !won) {
      ctx.fillStyle = t.primarySoft;
      ctx.fillRect(ox, oy + selR * CELL, GRID, CELL);
      ctx.fillRect(ox + selC * CELL, oy, CELL, GRID);
      const br = Math.floor(selR / 3) * 3, bc = Math.floor(selC / 3) * 3;
      ctx.fillRect(ox + bc * CELL, oy + br * CELL, CELL * 3, CELL * 3);
      ctx.fillStyle = t.primaryMid;
      ctx.fillRect(ox + selC * CELL, oy + selR * CELL, CELL, CELL);
    }

    // Hint flash effect
    if (hintFlash > 0 && Date.now() - hintFlash < 600 && selR >= 0 && selC >= 0) {
      const alpha = 0.3 * (1 - (Date.now() - hintFlash) / 600);
      ctx.fillStyle = `rgba(34,197,94,${alpha})`;
      ctx.fillRect(ox + selC * CELL, oy + selR * CELL, CELL, CELL);
    }

    // Grid lines
    for (let i = 0; i <= 9; i++) {
      const thick = i % 3 === 0;
      ctx.strokeStyle = thick ? t.gridThick : t.gridThin;
      ctx.lineWidth = thick ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(ox, oy + i * CELL);
      ctx.lineTo(ox + GRID, oy + i * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox + i * CELL, oy);
      ctx.lineTo(ox + i * CELL, oy + GRID);
      ctx.stroke();
    }

    // Numbers
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = player[r][c];
        if (v === 0) continue;
        const cx = ox + c * CELL + CELL / 2;
        const cy = oy + r * CELL + CELL / 2;
        if (fixed[r][c]) {
          ctx.fillStyle = t.text;
        } else if (hasError(r, c)) {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = t.primary;
        }
        ctx.fillText(String(v), cx, cy);
      }
    }

    // Hint button (below grid)
    if (!won) {
      const isHover = (canvas as any).__hintHover;
      ctx.fillStyle = isHover ? t.primaryMid : t.primarySoft;
      ctx.strokeStyle = t.primary;
      ctx.lineWidth = 1.5;
      const r = 8;
      ctx.beginPath();
      ctx.moveTo(HINT_BTN.x + r, HINT_BTN.y);
      ctx.lineTo(HINT_BTN.x + HINT_BTN.w - r, HINT_BTN.y);
      ctx.arcTo(HINT_BTN.x + HINT_BTN.w, HINT_BTN.y, HINT_BTN.x + HINT_BTN.w, HINT_BTN.y + r, r);
      ctx.lineTo(HINT_BTN.x + HINT_BTN.w, HINT_BTN.y + HINT_BTN.h - r);
      ctx.arcTo(HINT_BTN.x + HINT_BTN.w, HINT_BTN.y + HINT_BTN.h, HINT_BTN.x + HINT_BTN.w - r, HINT_BTN.y + HINT_BTN.h, r);
      ctx.lineTo(HINT_BTN.x + r, HINT_BTN.y + HINT_BTN.h);
      ctx.arcTo(HINT_BTN.x, HINT_BTN.y + HINT_BTN.h, HINT_BTN.x, HINT_BTN.y + HINT_BTN.h - r, r);
      ctx.lineTo(HINT_BTN.x, HINT_BTN.y + r);
      ctx.arcTo(HINT_BTN.x, HINT_BTN.y, HINT_BTN.x + r, HINT_BTN.y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = t.primary;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`💡 HINT (${hintsUsed})`, W / 2, HINT_BTN.y + HINT_BTN.h / 2);
    }

    // Number picker (always show when a non-fixed cell is selected)
    if (showPicker && selR >= 0 && selC >= 0 && !fixed[selR][selC] && !won) {
      drawPicker();
    }

    // Win overlay
    if (won) {
      ctx.fillStyle = t.overlay;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = t.primary;
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU WIN!', W / 2, H / 2 - 20);
      ctx.fillStyle = t.textMuted;
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText(hintsUsed > 0 ? `Hints used: ${hintsUsed}` : 'No hints used! 🏆', W / 2, H / 2 + 15);
      ctx.fillText('ENTER for new game', W / 2, H / 2 + 40);
    }

    if (!stopped) animId = requestAnimationFrame(draw);
  }

  function getCanvasXY(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { mx: (clientX - rect.left) * sx, my: (clientY - rect.top) * sy };
  }

  function handleTap(mx: number, my: number) {
    // Check picker buttons first
    if (showPicker && selR >= 0 && selC >= 0 && !fixed[selR][selC] && !won) {
      for (let n = 0; n <= 9; n++) {
        const btn = getPickerBtn(n);
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          if (n === 0) {
            player[selR][selC] = 0;
          } else {
            player[selR][selC] = n;
            sfxClick();
            if (checkWin()) { won = true; showPicker = false; sfxWin(); }
          }
          return;
        }
      }
    }

    // Check hint button
    if (!won && mx >= HINT_BTN.x && mx <= HINT_BTN.x + HINT_BTN.w && my >= HINT_BTN.y && my <= HINT_BTN.y + HINT_BTN.h) {
      useHint();
      return;
    }

    if (won) return;

    // Check grid cells
    const c = Math.floor((mx - PAD) / CELL);
    const r = Math.floor((my - PAD) / CELL);
    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
      selR = r;
      selC = c;
      showPicker = !fixed[r][c]; // show picker only for non-fixed cells
    } else {
      selR = -1;
      selC = -1;
      showPicker = false;
    }
  }

  function onClick(e: MouseEvent) {
    const { mx, my } = getCanvasXY(e.clientX, e.clientY);
    handleTap(mx, my);
  }

  function onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const { mx, my } = getCanvasXY(touch.clientX, touch.clientY);
    handleTap(mx, my);
  }

  function onMouseMove(e: MouseEvent) {
    const { mx, my } = getCanvasXY(e.clientX, e.clientY);
    const over = !won && mx >= HINT_BTN.x && mx <= HINT_BTN.x + HINT_BTN.w && my >= HINT_BTN.y && my <= HINT_BTN.y + HINT_BTN.h;
    (canvas as any).__hintHover = over;
    canvas.style.cursor = over ? 'pointer' : 'default';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && won) {
      initGame();
      return;
    }
    if ((e.key === 'h' || e.key === 'H') && !won) {
      useHint();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (selR < 0 || selC < 0) { selR = 0; selC = 0; showPicker = !fixed[0][0]; return; }
      if (e.key === 'ArrowUp' && selR > 0) selR--;
      else if (e.key === 'ArrowDown' && selR < 8) selR++;
      else if (e.key === 'ArrowLeft' && selC > 0) selC--;
      else if (e.key === 'ArrowRight' && selC < 8) selC++;
      showPicker = !fixed[selR][selC];
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (selR < 0 || selC < 0) { selR = 0; selC = 0; showPicker = !fixed[0][0]; return; }
      if (e.shiftKey) {
        selC--;
        if (selC < 0) { selC = 8; selR--; }
        if (selR < 0) { selR = 8; selC = 8; }
      } else {
        selC++;
        if (selC > 8) { selC = 0; selR++; }
        if (selR > 8) { selR = 0; selC = 0; }
      }
      showPicker = !fixed[selR][selC];
      return;
    }

    if (selR < 0 || selC < 0 || won) return;
    if (fixed[selR][selC]) return;

    if (e.key >= '1' && e.key <= '9') {
      player[selR][selC] = parseInt(e.key);
      sfxClick();
      if (checkWin()) { won = true; showPicker = false; sfxWin(); }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      player[selR][selC] = 0;
    }
  }

  document.addEventListener('click', onClick);
  document.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKey);

  initGame();
  draw();

  (canvas as any).__sudoku_onClick = onClick;
  (canvas as any).__sudoku_onTouchStart = onTouchStart;
  (canvas as any).__sudoku_onMouseMove = onMouseMove;
  (canvas as any).__sudoku_onKey = onKey;
}

export function stop() {
  stopped = true;
  cancelAnimationFrame(animId);
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((c) => {
    const onClick = (c as any).__sudoku_onClick;
    const onTouchStart = (c as any).__sudoku_onTouchStart;
    const onMouseMove = (c as any).__sudoku_onMouseMove;
    const onKey = (c as any).__sudoku_onKey;
    if (onClick) document.removeEventListener('click', onClick);
    if (onTouchStart) document.removeEventListener('touchstart', onTouchStart);
    if (onMouseMove) c.removeEventListener('mousemove', onMouseMove);
    if (onKey) window.removeEventListener('keydown', onKey);
  });
}
