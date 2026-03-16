const COLS = 10;
const ROWS = 20;
const BLOCK = 22;

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899'];

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];

let board: number[][];
let piece: { shape: number[][]; color: string; x: number; y: number };
let score: number;
let lines: number;
let level: number;
let gameOver: boolean;
let gameOverTime: number;
let animId: number;
let ctx: CanvasRenderingContext2D;
let lastDrop: number;
let keyHandler: (e: KeyboardEvent) => void;
let baseDifficulty: 'easy' | 'medium' | 'hard';

function newPiece() {
  const i = Math.floor(Math.random() * SHAPES.length);
  piece = {
    shape: SHAPES[i].map(r => [...r]),
    color: COLORS[i],
    x: Math.floor(COLS / 2) - Math.ceil(SHAPES[i][0].length / 2),
    y: 0,
  };
  if (collides(piece.x, piece.y, piece.shape)) { gameOver = true; gameOverTime = Date.now(); }
}

function collides(px: number, py: number, shape: number[][]) {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c] && (px + c < 0 || px + c >= COLS || py + r >= ROWS || (py + r >= 0 && board[py + r][px + c])))
        return true;
  return false;
}

function merge() {
  piece.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v && piece.y + r >= 0) (board as any)[piece.y + r][piece.x + c] = piece.color;
    })
  );
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(c => c)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * (level + 1);
    level = Math.floor(lines / 10);
  }
}

function rotate(shape: number[][]) {
  const h = shape.length, w = shape[0].length;
  const rotated: number[][] = [];
  for (let c = 0; c < w; c++) {
    rotated.push([]);
    for (let r = h - 1; r >= 0; r--) rotated[c].push(shape[r][c]);
  }
  return rotated;
}

function draw() {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  const offX = (W - COLS * BLOCK) / 2;
  const offY = (H - ROWS * BLOCK) / 2;

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath(); ctx.moveTo(offX, offY + r * BLOCK); ctx.lineTo(offX + COLS * BLOCK, offY + r * BLOCK); ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath(); ctx.moveTo(offX + c * BLOCK, offY); ctx.lineTo(offX + c * BLOCK, offY + ROWS * BLOCK); ctx.stroke();
  }

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c]) {
        ctx.fillStyle = board[r][c] as any;
        ctx.fillRect(offX + c * BLOCK + 1, offY + r * BLOCK + 1, BLOCK - 2, BLOCK - 2);
      }

  if (piece)
    piece.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v) {
          ctx.fillStyle = piece.color;
          ctx.fillRect(offX + (piece.x + c) * BLOCK + 1, offY + (piece.y + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
        }
      })
    );

  ctx.fillStyle = '#22c55e';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, offX, offY - 30);
  ctx.fillText(`LEVEL: ${level}`, offX, offY - 10);
  ctx.textAlign = 'right';
  ctx.fillText(`LINES: ${lines}`, offX + COLS * BLOCK, offY - 10);

  if (gameOver) {
    ctx.fillStyle = 'rgba(9,9,11,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#22c55e';
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 15);
    ctx.fillText('Press ENTER to restart', W / 2, H / 2 + 45);
  }
}

function loop(time: number) {
  if (!ctx) return;
  if (!gameOver) {
    const baseSpeed = baseDifficulty === 'easy' ? 1000 : baseDifficulty === 'hard' ? 500 : 800;
    const speed = Math.max(100, baseSpeed - level * 70);
    if (time - lastDrop > speed) {
      if (!collides(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
      } else {
        merge();
        clearLines();
        newPiece();
      }
      lastDrop = time;
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  score = 0; lines = 0; level = 0; gameOver = false; gameOverTime = 0; lastDrop = 0;
  newPiece();
}

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  ctx = canvas.getContext('2d')!;
  canvas.width = 380;
  canvas.height = 500;
  baseDifficulty = difficulty;
  init();

  keyHandler = (e: KeyboardEvent) => {
    if (gameOver) {
      if (e.key === 'Enter' && Date.now() - gameOverTime > 1000) { init(); }
      return;
    }
    switch (e.key) {
      case 'ArrowLeft': if (!collides(piece.x - 1, piece.y, piece.shape)) piece.x--; break;
      case 'ArrowRight': if (!collides(piece.x + 1, piece.y, piece.shape)) piece.x++; break;
      case 'ArrowDown': if (!collides(piece.x, piece.y + 1, piece.shape)) { piece.y++; score += 1; } break;
      case 'ArrowUp': {
        const r = rotate(piece.shape);
        if (!collides(piece.x, piece.y, r)) piece.shape = r;
        break;
      }
      case ' ': while (!collides(piece.x, piece.y + 1, piece.shape)) { piece.y++; score += 2; } break;
    }
    e.preventDefault();
  };
  window.addEventListener('keydown', keyHandler);
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
}
