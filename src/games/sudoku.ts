// Sudoku game – canvas-based, 9x9 grid with backtracking generator
import { sfxClick, sfxHint, sfxWin } from './sfx';

let animId = 0;
let stopped = false;

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  const W = 420;
  const H = 500;
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

  let solution: number[][] = [];
  let puzzle: number[][] = [];
  let player: number[][] = [];
  let fixed: boolean[][] = [];
  let selR = -1;
  let selC = -1;
  let won = false;
  let hintFlash = -1; // timestamp of last hint flash

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
  }

  function useHint() {
    if (won) return;
    // Find all cells that are empty or wrong
    const candidates: [number, number][] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!fixed[r][c] && player[r][c] !== solution[r][c])
          candidates.push([r, c]);
    if (candidates.length === 0) return;
    const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
    player[r][c] = solution[r][c];
    fixed[r][c] = true; // lock it in
    selR = r;
    selC = c;
    hintsUsed++;
    hintFlash = Date.now();
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

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    const ox = PAD;
    const oy = PAD;

    // Highlight selected row/col/block
    if (selR >= 0 && selC >= 0 && !won) {
      ctx.fillStyle = 'rgba(34,197,94,0.07)';
      ctx.fillRect(ox, oy + selR * CELL, GRID, CELL);
      ctx.fillRect(ox + selC * CELL, oy, CELL, GRID);
      const br = Math.floor(selR / 3) * 3, bc = Math.floor(selC / 3) * 3;
      ctx.fillRect(ox + bc * CELL, oy + br * CELL, CELL * 3, CELL * 3);
      ctx.fillStyle = 'rgba(34,197,94,0.18)';
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
      ctx.strokeStyle = thick ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)';
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
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
        } else if (hasError(r, c)) {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = '#22c55e';
        }
        ctx.fillText(String(v), cx, cy);
      }
    }

    // Hint button (below grid)
    if (!won) {
      const isHover = (canvas as any).__hintHover;
      ctx.fillStyle = isHover ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)';
      ctx.strokeStyle = 'rgba(34,197,94,0.5)';
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

      ctx.fillStyle = '#22c55e';
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`💡 HINT (${hintsUsed})`, W / 2, HINT_BTN.y + HINT_BTN.h / 2);

      // Instructions text
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('Click cell + 1-9 · DELETE clear · H hint', W / 2, HINT_BTN.y + HINT_BTN.h + 20);
    }

    // Win overlay
    if (won) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', W / 2, H / 2 - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText(hintsUsed > 0 ? `Hints used: ${hintsUsed}` : 'No hints used! 🏆', W / 2, H / 2 + 15);
      ctx.fillText('ENTER for new game', W / 2, H / 2 + 40);
    }

    if (!stopped) animId = requestAnimationFrame(draw);
  }

  function onClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;

    // Check hint button click
    if (!won && mx >= HINT_BTN.x && mx <= HINT_BTN.x + HINT_BTN.w && my >= HINT_BTN.y && my <= HINT_BTN.y + HINT_BTN.h) {
      useHint();
      return;
    }

    if (won) return;
    const c = Math.floor((mx - PAD) / CELL);
    const r = Math.floor((my - PAD) / CELL);
    if (r >= 0 && r < 9 && c >= 0 && c < 9) {
      selR = r;
      selC = c;
    } else {
      selR = -1;
      selC = -1;
    }
  }

  function onMouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;
    const over = !won && mx >= HINT_BTN.x && mx <= HINT_BTN.x + HINT_BTN.w && my >= HINT_BTN.y && my <= HINT_BTN.y + HINT_BTN.h;
    (canvas as any).__hintHover = over;
    canvas.style.cursor = over ? 'pointer' : 'default';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && won) {
      initGame();
      return;
    }
    // H key for hint
    if ((e.key === 'h' || e.key === 'H') && !won) {
      useHint();
      return;
    }
    if (selR < 0 || selC < 0 || won) return;
    if (fixed[selR][selC]) return;

    if (e.key >= '1' && e.key <= '9') {
      player[selR][selC] = parseInt(e.key);
      if (checkWin()) won = true;
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      player[selR][selC] = 0;
    } else if (e.key === 'ArrowUp' && selR > 0) { selR--; }
    else if (e.key === 'ArrowDown' && selR < 8) { selR++; }
    else if (e.key === 'ArrowLeft' && selC > 0) { selC--; }
    else if (e.key === 'ArrowRight' && selC < 8) { selC++; }
  }

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKey);

  initGame();
  draw();

  (canvas as any).__sudoku_onClick = onClick;
  (canvas as any).__sudoku_onMouseMove = onMouseMove;
  (canvas as any).__sudoku_onKey = onKey;
}

export function stop() {
  stopped = true;
  cancelAnimationFrame(animId);
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((c) => {
    const onClick = (c as any).__sudoku_onClick;
    const onMouseMove = (c as any).__sudoku_onMouseMove;
    const onKey = (c as any).__sudoku_onKey;
    if (onClick) c.removeEventListener('click', onClick);
    if (onMouseMove) c.removeEventListener('mousemove', onMouseMove);
    if (onKey) window.removeEventListener('keydown', onKey);
  });
}
