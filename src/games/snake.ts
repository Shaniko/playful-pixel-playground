import { sfxEat, sfxDie } from './sfx';
import { getTheme } from './theme';

const GRID = 20;
const CELL = 20;

let snake: { x: number; y: number }[];
let food: { x: number; y: number };
let dir: { x: number; y: number };
let nextDir: { x: number; y: number };
let score: number;
let gameOver: boolean;
let gameOverTime: number;
let ctx: CanvasRenderingContext2D;
let animId: number;
let lastMove: number;
let keyHandler: (e: KeyboardEvent) => void;
let baseDifficulty: 'easy' | 'medium' | 'hard';
let canvasRef: HTMLCanvasElement;
let touchStartX: number;
let touchStartY: number;
let touchHandler: (e: TouchEvent) => void;
let touchEndHandler: (e: TouchEvent) => void;

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function init() {
  const mid = Math.floor(GRID / 2);
  snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  gameOverTime = 0;
  lastMove = 0;
  placeFood();
}

function draw() {
  const t = getTheme();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const offX = (W - GRID * CELL) / 2;
  const offY = 40;

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = t.bgSub;
  ctx.fillRect(offX, offY, GRID * CELL, GRID * CELL);

  // food
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(offX + food.x * CELL + CELL / 2, offY + food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
    ctx.fillRect(offX + s.x * CELL + 1, offY + s.y * CELL + 1, CELL - 2, CELL - 2);
  });

  // HUD
  ctx.fillStyle = t.hud;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${score}`, W / 2, 24);

  if (gameOver) {
    ctx.fillStyle = t.overlay;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.hud;
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
    ctx.font = '400 16px "JetBrains Mono", monospace';
    ctx.fillStyle = t.textMuted;
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 + 15);
    ctx.fillText('Press SPACE or ENTER to restart', W / 2, H / 2 + 45);
  }
}

function update() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    gameOverTime = Date.now();
    sfxDie();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    sfxEat();
    placeFood();
  } else {
    snake.pop();
  }
}

function loop(time: number) {
  if (!ctx) return;
  const baseSpeed = baseDifficulty === 'easy' ? 200 : baseDifficulty === 'hard' ? 100 : 150;
  const speed = Math.max(60, baseSpeed - score);
  if (!gameOver && time - lastMove > speed) {
    update();
    lastMove = time;
  }
  draw();
  animId = requestAnimationFrame(loop);
}

export function start(canvas: HTMLCanvasElement, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  ctx = canvas.getContext('2d')!;
  canvasRef = canvas;
  canvas.width = 440;
  canvas.height = 440;
  baseDifficulty = difficulty;
  init();

  keyHandler = (e: KeyboardEvent) => {
    if (gameOver) { if ((e.key === 'Enter' || e.key === ' ') && Date.now() - gameOverTime > 1000) init(); return; }
    switch (e.key) {
      case 'ArrowUp': if (dir.y !== 1) nextDir = { x: 0, y: -1 }; break;
      case 'ArrowDown': if (dir.y !== -1) nextDir = { x: 0, y: 1 }; break;
      case 'ArrowLeft': if (dir.x !== 1) nextDir = { x: -1, y: 0 }; break;
      case 'ArrowRight': if (dir.x !== -1) nextDir = { x: 1, y: 0 }; break;
    }
    e.preventDefault();
  };

  touchHandler = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Tap to restart on game over
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
    const minSwipe = 20;
    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
      else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else {
      if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
    }
  };

  window.addEventListener('keydown', keyHandler);
  canvas.addEventListener('touchstart', touchHandler, { passive: false });
  canvas.addEventListener('touchend', touchEndHandler, { passive: false });
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  canvasRef?.removeEventListener('touchstart', touchHandler);
  canvasRef?.removeEventListener('touchend', touchEndHandler);
}
