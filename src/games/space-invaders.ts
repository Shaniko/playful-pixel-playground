import { sfxShoot, sfxBreak, sfxDie, sfxWin } from './sfx';
import { getTheme } from './theme';

let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;

const W = 500, H = 450;
const PLAYER_W = 40, PLAYER_H = 20;
const ENEMY_W = 30, ENEMY_H = 20;
const BULLET_W = 3, BULLET_H = 12;
const ENEMY_COLS = 8, ENEMY_ROWS = 4;

let playerX: number;
let bullets: { x: number; y: number }[];
let enemyBullets: { x: number; y: number }[];
let enemies: { x: number; y: number; alive: boolean; color: string }[];
let enemyDir: number;
let enemySpeed: number;
let lastEnemyMove: number;
let lastEnemyShot: number;
let score: number;
let lives: number;
let gameOver: boolean;
let gameOverTime: number;
let won: boolean;
let keys: Record<string, boolean>;
let lastShot: number;
let baseEnemySpeed: number;

const ECOLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

function init() {
  playerX = W / 2 - PLAYER_W / 2;
  bullets = [];
  enemyBullets = [];
  score = 0;
  lives = 3;
  gameOver = false;
  gameOverTime = 0;
  won = false;
  keys = {};
  enemyDir = 1;
  enemySpeed = baseEnemySpeed;
  lastEnemyMove = 0;
  lastEnemyShot = 0;
  lastShot = 0;

  enemies = [];
  const offX = (W - ENEMY_COLS * (ENEMY_W + 12)) / 2;
  for (let r = 0; r < ENEMY_ROWS; r++) {
    for (let c = 0; c < ENEMY_COLS; c++) {
      enemies.push({
        x: offX + c * (ENEMY_W + 12),
        y: 50 + r * (ENEMY_H + 14),
        alive: true,
        color: ECOLORS[r],
      });
    }
  }
}

function update(time: number) {
  if (gameOver) return;

  if (keys['ArrowLeft']) playerX = Math.max(0, playerX - 5);
  if (keys['ArrowRight']) playerX = Math.min(W - PLAYER_W, playerX + 5);

  if (keys[' '] && time - lastShot > 250) {
    bullets.push({ x: playerX + PLAYER_W / 2 - BULLET_W / 2, y: H - 50 });
    lastShot = time;
    sfxShoot();
  }

  bullets = bullets.filter(b => { b.y -= 8; return b.y > 0; });
  enemyBullets = enemyBullets.filter(b => { b.y += 5; return b.y < H; });

  if (time - lastEnemyMove > enemySpeed) {
    let hitEdge = false;
    enemies.forEach(e => {
      if (!e.alive) return;
      if ((e.x + ENEMY_W + 15 * enemyDir > W) || (e.x + 15 * enemyDir < 0)) hitEdge = true;
    });
    if (hitEdge) {
      enemyDir = -enemyDir;
      enemies.forEach(e => { if (e.alive) e.y += 15; });
    } else {
      enemies.forEach(e => { if (e.alive) e.x += 15 * enemyDir; });
    }
    lastEnemyMove = time;
  }

  const aliveEnemies = enemies.filter(e => e.alive);
  if (time - lastEnemyShot > 1200 && aliveEnemies.length > 0) {
    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBullets.push({ x: shooter.x + ENEMY_W / 2, y: shooter.y + ENEMY_H });
    lastEnemyShot = time;
  }

  bullets.forEach(b => {
    enemies.forEach(e => {
      if (!e.alive) return;
      if (b.x < e.x + ENEMY_W && b.x + BULLET_W > e.x && b.y < e.y + ENEMY_H && b.y + BULLET_H > e.y) {
        e.alive = false;
        b.y = -100;
        score += 100;
        enemySpeed = Math.max(200, enemySpeed - 20);
        sfxBreak();
      }
    });
  });

  enemyBullets.forEach(b => {
    if (b.x < playerX + PLAYER_W && b.x + BULLET_W > playerX && b.y + BULLET_H > H - 45 && b.y < H - 45 + PLAYER_H) {
      b.y = H + 100;
      lives--;
      if (lives <= 0) { gameOver = true; gameOverTime = Date.now(); sfxDie(); }
    }
  });

  if (aliveEnemies.some(e => e.y + ENEMY_H > H - 60)) {
    gameOver = true;
    gameOverTime = Date.now();
    sfxDie();
  }

  if (aliveEnemies.length === 0) {
    gameOver = true;
    gameOverTime = Date.now();
    won = true;
    sfxWin();
  }
}

function draw() {
  const t = getTheme();
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  enemies.forEach(e => {
    if (!e.alive) return;
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
    ctx.fillStyle = t.bg;
    ctx.fillRect(e.x + 8, e.y + 6, 4, 4);
    ctx.fillRect(e.x + ENEMY_W - 12, e.y + 6, 4, 4);
  });

  ctx.fillStyle = t.hud;
  ctx.beginPath();
  ctx.moveTo(playerX + PLAYER_W / 2, H - 50);
  ctx.lineTo(playerX, H - 50 + PLAYER_H);
  ctx.lineTo(playerX + PLAYER_W, H - 50 + PLAYER_H);
  ctx.fill();

  ctx.fillStyle = t.hud;
  bullets.forEach(b => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));
  ctx.fillStyle = '#ef4444';
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));

  ctx.fillStyle = t.hud;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 15, 25);
  ctx.textAlign = 'right';
  ctx.fillText(`LIVES: ${'♥'.repeat(lives)}`, W - 15, 25);

  if (gameOver) {
    ctx.fillStyle = t.overlay;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = won ? '#22c55e' : '#ef4444';
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'VICTORY!' : 'GAME OVER', W / 2, H / 2 - 20);
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 15);
    ctx.fillText('Press ENTER to restart', W / 2, H / 2 + 45);
  }
}

function loop(time: number) {
  if (!ctx) return;
  update(time);
  draw();
  animId = requestAnimationFrame(loop);
}

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  ctx = canvas.getContext('2d')!;
  canvas.width = W;
  canvas.height = H;
  baseEnemySpeed = difficulty === 'easy' ? 1100 : difficulty === 'hard' ? 500 : 800;
  init();

  keyHandler = (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (gameOver && e.key === 'Enter' && Date.now() - gameOverTime > 1000) init();
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  };
  keyUpHandler = (e: KeyboardEvent) => { keys[e.key] = false; };
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('keyup', keyUpHandler);
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  window.removeEventListener('keyup', keyUpHandler);
}
