// Sudoku game – canvas-based, 9x9 grid with backtracking generator

let animId = 0;
let stopped = false;

export function start(canvas: HTMLCanvasElement) {
  const W = 450;
  const H = 520;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  stopped = false;

  const CELL = 46;
  const PAD = 18;
  const GRID = CELL * 9;

  // Board state
  let solution: number[][] = [];
  let puzzle: number[][] = [];
  let player: number[][] = [];
  let fixed: boolean[][] = [];
  let selR = -1;
  let selC = -1;
  let won = false;

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

  function makePuzzle(sol: number[][], holes: number): number[][] {
    const p = sol.map(r => [...r]);
    const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (let i = 0; i < holes; i++) {
      const idx = cells[i];
      p[Math.floor(idx / 9)][idx % 9] = 0;
    }
    return p;
  }

  function initGame() {
    solution = generateSolution();
    puzzle = makePuzzle(solution, 45);
    player = puzzle.map(r => [...r]);
    fixed = puzzle.map(r => r.map(v => v !== 0));
    selR = -1;
    selC = -1;
    won = false;
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
    // Check row/col/block for duplicates
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
      // Row
      ctx.fillRect(ox, oy + selR * CELL, GRID, CELL);
      // Col
      ctx.fillRect(ox + selC * CELL, oy, CELL, GRID);
      // Block
      const br = Math.floor(selR / 3) * 3, bc = Math.floor(selC / 3) * 3;
      ctx.fillRect(ox + bc * CELL, oy + br * CELL, CELL * 3, CELL * 3);
      // Selected cell
      ctx.fillStyle = 'rgba(34,197,94,0.18)';
      ctx.fillRect(ox + selC * CELL, oy + selR * CELL, CELL, CELL);
    }

    // Grid lines
    for (let i = 0; i <= 9; i++) {
      const thick = i % 3 === 0;
      ctx.strokeStyle = thick ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = thick ? 2 : 1;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(ox, oy + i * CELL);
      ctx.lineTo(ox + GRID, oy + i * CELL);
      ctx.stroke();
      // Vertical
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

    // Win message
    if (won) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', W / 2, H / 2 - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('ENTER for new game', W / 2, H / 2 + 20);
    }

    // Bottom bar – New Game button
    if (!won) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Click a cell, type 1-9, DELETE to clear', W / 2, oy + GRID + 30);
    }

    if (!stopped) animId = requestAnimationFrame(draw);
  }

  // Click handler
  function onClick(e: MouseEvent) {
    if (won) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;
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

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && won) {
      initGame();
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
  window.addEventListener('keydown', onKey);

  initGame();
  draw();

  // Store refs for cleanup
  (canvas as any).__sudoku_onClick = onClick;
  (canvas as any).__sudoku_onKey = onKey;
}

export function stop() {
  stopped = true;
  cancelAnimationFrame(animId);
  // Clean up event listeners using stored refs
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((c) => {
    const onClick = (c as any).__sudoku_onClick;
    const onKey = (c as any).__sudoku_onKey;
    if (onClick) c.removeEventListener('click', onClick);
    if (onKey) window.removeEventListener('keydown', onKey);
  });
}
