import { sfxHit, sfxBreak, sfxDie, sfxWin } from './sfx';
import { getTheme } from './theme';

let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;
let canvasRef: HTMLCanvasElement;
let touchMoveHandler: (e: TouchEvent) => void;
let touchStartHandler: (e: TouchEvent) => void;

const W = 500, H = 400;
const PADDLE_W = 80, PADDLE_H = 12;
const BALL_R = 5;
const BRICK_ROWS = 5, BRICK_COLS = 10;
const BRICK_W = 44, BRICK_H = 16, BRICK_GAP = 4;
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

let paddleX: number;
let ballX: number, ballY: number, ballVX: number, ballVY: number;
let bricks: { alive: boolean; color: string }[][];
let score: number;
let lives: number;
let gameOver: boolean;
let gameOverTime: number;
let won: boolean;
let keys: Record<string, boolean>;
let launched: boolean;
let ballBaseSpeed: number;

function init() {
  paddleX = W / 2 - PADDLE_W / 2;
  score = 0;
  lives = 3;
  gameOver = false;
  gameOverTime = 0;
  won = false;
  keys = {};
  launched = false;
  resetBall();

  const offX = (W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
  bricks = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    bricks[r] = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks[r][c] = { alive: true, color: COLORS[r] };
    }
  }
}

function resetBall() {
  launched = false;
  ballVX = ballBaseSpeed;
  ballVY = -ballBaseSpeed;
}

function update() {
  if (gameOver) return;

  if (keys['ArrowLeft']) paddleX = Math.max(0, paddleX - 7);
  if (keys['ArrowRight']) paddleX = Math.min(W - PADDLE_W, paddleX + 7);

  if (!launched) {
    ballX = paddleX + PADDLE_W / 2;
    ballY = H - 40 - BALL_R;
    if (keys[' ']) launched = true;
    return;
  }

  ballX += ballVX;
  ballY += ballVY;

  if (ballX <= BALL_R || ballX >= W - BALL_R) ballVX = -ballVX;
  if (ballY <= BALL_R) ballVY = -ballVY;

  if (ballY + BALL_R >= H - 30 - PADDLE_H && ballY + BALL_R <= H - 30 && ballX >= paddleX && ballX <= paddleX + PADDLE_W) {
    ballVY = -Math.abs(ballVY);
    ballVX += (ballX - (paddleX + PADDLE_W / 2)) * 0.08;
    sfxHit();
  }

  const offX = (W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
  const offY = 50;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      if (!bricks[r][c].alive) continue;
      const bx = offX + c * (BRICK_W + BRICK_GAP);
      const by = offY + r * (BRICK_H + BRICK_GAP);
      if (ballX + BALL_R > bx && ballX - BALL_R < bx + BRICK_W && ballY + BALL_R > by && ballY - BALL_R < by + BRICK_H) {
        bricks[r][c].alive = false;
        ballVY = -ballVY;
        score += 10 * (BRICK_ROWS - r);
        sfxBreak();
      }
    }
  }

  if (bricks.every(row => row.every(b => !b.alive))) {
    gameOver = true;
    gameOverTime = Date.now();
    won = true;
    sfxWin();
  }

  if (ballY > H) {
    lives--;
    if (lives <= 0) { gameOver = true; gameOverTime = Date.now(); sfxDie(); }
    else resetBall();
  }
}

function draw() {
  const t = getTheme();
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  const offX = (W - (BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;
  const offY = 50;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      if (!bricks[r][c].alive) continue;
      ctx.fillStyle = bricks[r][c].color;
      ctx.fillRect(offX + c * (BRICK_W + BRICK_GAP), offY + r * (BRICK_H + BRICK_GAP), BRICK_W, BRICK_H);
    }
  }

  ctx.fillStyle = t.hud;
  ctx.fillRect(paddleX, H - 30 - PADDLE_H, PADDLE_W, PADDLE_H);

  ctx.fillStyle = t.ball;
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = t.hud;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 15, 25);
  ctx.textAlign = 'right';
  ctx.fillText(`LIVES: ${'♥'.repeat(lives)}`, W - 15, 25);

  if (!launched && !gameOver) {
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to launch', W / 2, H - 5);
  }

  if (gameOver) {
    ctx.fillStyle = t.overlay;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = won ? '#22c55e' : '#ef4444';
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 20);
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 15);
    ctx.fillText('Press ENTER to restart', W / 2, H / 2 + 45);
  }
}

function loop() {
  if (!ctx) return;
  update();
  draw();
  animId = requestAnimationFrame(loop);
}

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  ctx = canvas.getContext('2d')!;
  canvasRef = canvas;
  canvas.width = W;
  canvas.height = H;
  ballBaseSpeed = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 6 : 4;
  init();

  keyHandler = (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (gameOver && e.key === 'Enter' && Date.now() - gameOverTime > 1000) init();
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  };
  keyUpHandler = (e: KeyboardEvent) => { keys[e.key] = false; };

  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (gameOver && Date.now() - gameOverTime > 1000) { init(); return; }
    if (!launched) { launched = true; return; }
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * sx;
    paddleX = Math.max(0, Math.min(W - PADDLE_W, touchX - PADDLE_W / 2));
  };

  touchMoveHandler = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * sx;
    paddleX = Math.max(0, Math.min(W - PADDLE_W, touchX - PADDLE_W / 2));
  };

  window.addEventListener('keydown', keyHandler);
  window.addEventListener('keyup', keyUpHandler);
  document.addEventListener('touchstart', touchStartHandler, { passive: false });
  document.addEventListener('touchmove', touchMoveHandler, { passive: false });
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  window.removeEventListener('keyup', keyUpHandler);
  document.removeEventListener('touchstart', touchStartHandler);
  document.removeEventListener('touchmove', touchMoveHandler);
}
