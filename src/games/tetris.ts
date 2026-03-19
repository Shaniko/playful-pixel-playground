import { sfxScore, sfxDie, sfxMove } from './sfx';
import { getTheme } from './theme';

const COLS = 10;
const ROWS = 20;
const HUD_HEIGHT = 44;
let BLOCK = 22;

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
let canvasRef: HTMLCanvasElement;
let touchStartHandler: (e: TouchEvent) => void;
let touchMoveHandler: (e: TouchEvent) => void;
let touchEndHandler: (e: TouchEvent) => void;
let touchStartX: number;
let touchStartY: number;
let touchStartTime: number;
let lastTouchDropY: number;

function newPiece() {
  const i = Math.floor(Math.random() * SHAPES.length);
  piece = {
    shape: SHAPES[i].map(r => [...r]),
    color: COLORS[i],
    x: Math.floor(COLS / 2) - Math.ceil(SHAPES[i][0].length / 2),
    y: 0,
  };
  if (collides(piece.x, piece.y, piece.shape)) { gameOver = true; gameOverTime = Date.now(); sfxDie(); }
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
    sfxScore();
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
  const t = getTheme();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  const offX = (W - COLS * BLOCK) / 2;
  const offY = HUD_HEIGHT;

  ctx.strokeStyle = t.gridFaint;
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

  ctx.fillStyle = t.hud;
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, offX, 16);
  ctx.fillText(`LEVEL: ${level}`, offX, 34);
  ctx.textAlign = 'right';
  ctx.fillText(`LINES: ${lines}`, offX + COLS * BLOCK, 16);

  if (gameOver) {
    ctx.fillStyle = t.overlay;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.hud;
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillStyle = t.textMuted;
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
  canvasRef = canvas;
  baseDifficulty = difficulty;

  BLOCK = 26;
  canvas.width = COLS * BLOCK + 20;
  canvas.height = ROWS * BLOCK + HUD_HEIGHT + 10;
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
      case ' ': while (!collides(piece.x, piece.y + 1, piece.shape)) { piece.y++; score += 2; } sfxMove(); break;
    }
    e.preventDefault();
  };

  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();

    if (gameOver && Date.now() - gameOverTime > 1000) {
      init();
    }
  };

  touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (gameOver) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    const minSwipe = 25;

    // Tap (short, no movement) = rotate
    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe && dt < 300) {
      const r = rotate(piece.shape);
      if (!collides(piece.x, piece.y, r)) piece.shape = r;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0 && !collides(piece.x + 1, piece.y, piece.shape)) piece.x++;
      else if (dx < 0 && !collides(piece.x - 1, piece.y, piece.shape)) piece.x--;
    } else {
      if (dy > 0) {
        // Swipe down = soft drop
        if (!collides(piece.x, piece.y + 1, piece.shape)) { piece.y++; score += 1; }
      } else {
        // Swipe up = hard drop
        while (!collides(piece.x, piece.y + 1, piece.shape)) { piece.y++; score += 2; }
        sfxMove();
      }
    }
  };

  window.addEventListener('keydown', keyHandler);
  canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
  canvas.addEventListener('touchend', touchEndHandler, { passive: false });
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  canvasRef?.removeEventListener('touchstart', touchStartHandler);
  canvasRef?.removeEventListener('touchend', touchEndHandler);
}
