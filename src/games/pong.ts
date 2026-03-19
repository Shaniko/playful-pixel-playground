import { sfxHit, sfxScore, sfxWin, sfxDie } from './sfx';
import { getTheme } from './theme';

let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;
let canvasRef: HTMLCanvasElement;
let touchMoveHandler: (e: TouchEvent) => void;
let touchStartHandler: (e: TouchEvent) => void;

const W = 550, H = 400;
const PADDLE_W = 12, PADDLE_H = 80, BALL_R = 8;
const PADDLE_SPEED = 6;

let aiSpeed: number;
let playerY: number, aiY: number;
let ballX: number, ballY: number, ballVX: number, ballVY: number;
let playerScore: number, aiScore: number;
let gameOver: boolean;
let gameOverTime: number;
let keys: Record<string, boolean>;

function init() {
  playerY = H / 2 - PADDLE_H / 2;
  aiY = H / 2 - PADDLE_H / 2;
  playerScore = 0;
  aiScore = 0;
  gameOver = false;
  gameOverTime = 0;
  keys = {};
  resetBall(1);
}

function resetBall(dir: number) {
  ballX = W / 2;
  ballY = H / 2;
  ballVX = 5 * dir;
  ballVY = (Math.random() - 0.5) * 6;
}

function update() {
  if (gameOver) return;

  if (keys['ArrowUp']) playerY = Math.max(0, playerY - PADDLE_SPEED);
  if (keys['ArrowDown']) playerY = Math.min(H - PADDLE_H, playerY + PADDLE_SPEED);

  const aiCenter = aiY + PADDLE_H / 2;
  if (aiCenter < ballY - 10) aiY += aiSpeed;
  else if (aiCenter > ballY + 10) aiY -= aiSpeed;
  aiY = Math.max(0, Math.min(H - PADDLE_H, aiY));

  ballX += ballVX;
  ballY += ballVY;

  if (ballY <= BALL_R || ballY >= H - BALL_R) ballVY = -ballVY;

  if (ballX - BALL_R <= 30 + PADDLE_W && ballY >= playerY && ballY <= playerY + PADDLE_H && ballVX < 0) {
    ballVX = -ballVX * 1.05;
    ballVY += (ballY - (playerY + PADDLE_H / 2)) * 0.15;
    sfxHit();
  }
  if (ballX + BALL_R >= W - 30 - PADDLE_W && ballY >= aiY && ballY <= aiY + PADDLE_H && ballVX > 0) {
    ballVX = -ballVX * 1.05;
    ballVY += (ballY - (aiY + PADDLE_H / 2)) * 0.15;
    sfxHit();
  }

  if (ballX < 0) { aiScore++; sfxScore(); checkWin(); resetBall(1); }
  if (ballX > W) { playerScore++; sfxScore(); checkWin(); resetBall(-1); }
}

function checkWin() {
  if (playerScore >= 7 || aiScore >= 7) { gameOver = true; gameOverTime = Date.now(); playerScore >= 7 ? sfxWin() : sfxDie(); }
}

function draw() {
  const t = getTheme();
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = t.grid;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(30, playerY, PADDLE_W, PADDLE_H);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(W - 30 - PADDLE_W, aiY, PADDLE_W, PADDLE_H);

  ctx.fillStyle = t.ball;
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '700 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#22c55e';
  ctx.fillText(`${playerScore}`, W / 2 - 60, 50);
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(`${aiScore}`, W / 2 + 60, 50);

  if (gameOver) {
    ctx.fillStyle = t.overlay;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = playerScore >= 7 ? '#22c55e' : '#3b82f6';
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.fillText(playerScore >= 7 ? 'YOU WIN!' : 'AI WINS!', W / 2, H / 2 - 20);
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillText('Press ENTER to restart', W / 2, H / 2 + 25);
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
  aiSpeed = difficulty === 'easy' ? 2.5 : difficulty === 'hard' ? 5.5 : 4;
  init();

  keyHandler = (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (gameOver && e.key === 'Enter' && Date.now() - gameOverTime > 1000) init();
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  };
  keyUpHandler = (e: KeyboardEvent) => { keys[e.key] = false; };

  touchMoveHandler = (e: TouchEvent) => {
    if ((e.target as HTMLElement)?.closest?.('button')) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const sy = canvas.height / rect.height;
    const touchY = (touch.clientY - rect.top) * sy;
    playerY = Math.max(0, Math.min(H - PADDLE_H, touchY - PADDLE_H / 2));
  };

  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    if (gameOver && Date.now() - gameOverTime > 1000) init();
    // Also set initial position
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const sy = canvas.height / rect.height;
    const touchY = (touch.clientY - rect.top) * sy;
    playerY = Math.max(0, Math.min(H - PADDLE_H, touchY - PADDLE_H / 2));
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
