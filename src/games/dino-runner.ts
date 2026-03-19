import { sfxJump, sfxDie } from './sfx';
import { getTheme } from './theme';

const W = 600, H = 250;
const GROUND_Y = H - 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;
let clickHandler: () => void;
let canvasRef: HTMLCanvasElement;
let touchStartHandler: (e: TouchEvent) => void;
let touchEndHandler: (e: TouchEvent) => void;
let touchStartY: number;

let luigiY: number, luigiVY: number, isJumping: boolean, isDucking: boolean;
let obstacles: { x: number; w: number; h: number; type: 'cactus' | 'bird'; birdY: number }[];
let clouds: { x: number; y: number; w: number }[];
let groundOffset: number;
let score: number, highScore: number;
let speed: number;
let baseSpeed: number;
let gameOver: boolean;
let gameOverTime: number;
let started: boolean;
let frame: number;
let legPhase: number;
let armPhase: number;
let blinkTimer: number;
let isBlinking: boolean;

function init() {
  luigiY = GROUND_Y;
  luigiVY = 0;
  isJumping = false;
  isDucking = false;
  obstacles = [];
  groundOffset = 0;
  score = 0;
  speed = baseSpeed;
  gameOver = false;
  gameOverTime = 0;
  started = false;
  frame = 0;
  legPhase = 0;
  armPhase = 0;
  blinkTimer = 0;
  isBlinking = false;
  highScore = parseInt(localStorage.getItem('dino-runner-hi') || '0', 10);
  clouds = Array.from({ length: 4 }, (_, i) => ({
    x: i * 200 + Math.random() * 100,
    y: 30 + Math.random() * 40,
    w: 40 + Math.random() * 30,
  }));
}

function canRestart() {
  return gameOver && Date.now() - gameOverTime > 1000;
}

function jump() {
  if (gameOver) { if (canRestart()) { init(); started = true; } return; }
  if (!started) { started = true; return; }
  if (!isJumping) {
    luigiVY = JUMP_FORCE;
    isJumping = true;
    isDucking = false;
    sfxJump();
  }
}

function spawnObstacle() {
  const type = Math.random() > 0.7 ? 'bird' : 'cactus';
  if (type === 'cactus') {
    const h = 30 + Math.random() * 25;
    obstacles.push({ x: W + 20, w: 18 + Math.random() * 12, h, type, birdY: 0 });
  } else {
    obstacles.push({ x: W + 20, w: 28, h: 18, type, birdY: GROUND_Y - 50 - Math.random() * 40 });
  }
}

function update() {
  if (!started || gameOver) return;
  frame++;
  legPhase += 0.3;
  armPhase += 0.25;
  blinkTimer++;
  if (blinkTimer > 120) { isBlinking = true; }
  if (blinkTimer > 126) { isBlinking = false; blinkTimer = 0; }

  luigiVY += GRAVITY;
  luigiY += luigiVY;
  if (luigiY >= GROUND_Y) { luigiY = GROUND_Y; luigiVY = 0; isJumping = false; }

  groundOffset = (groundOffset + speed) % 20;

  clouds.forEach(c => { c.x -= speed * 0.3; if (c.x < -80) c.x = W + Math.random() * 100; });

  if (frame % Math.max(40, 90 - Math.floor(score / 200)) === 0) spawnObstacle();
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x > -60);

  score++;
  if (score % 500 === 0) speed += 0.5;

  const lx = 80;
  const lr = isDucking ? 10 : 18;
  const lCenterY = isDucking ? luigiY - 10 : luigiY - 18;
  for (const o of obstacles) {
    let ox: number, oy: number, ow: number, oh: number;
    if (o.type === 'cactus') {
      ox = o.x; oy = GROUND_Y - o.h; ow = o.w; oh = o.h;
    } else {
      ox = o.x; oy = o.birdY; ow = o.w; oh = o.h;
    }
    const closestX = Math.max(ox, Math.min(lx, ox + ow));
    const closestY = Math.max(oy, Math.min(lCenterY, oy + oh));
    const dx = lx - closestX, dy = lCenterY - closestY;
    if (dx * dx + dy * dy < (lr - 2) * (lr - 2)) {
      gameOver = true;
      gameOverTime = Date.now();
      sfxDie();
      if (score > highScore) { highScore = score; localStorage.setItem('dino-runner-hi', String(highScore)); }
    }
  }
}

function drawLuigi(x: number, y: number, dead: boolean) {
  if (isDucking && !dead) {
    // Ducking Luigi — flat/crouching pose
    const rw = 22, rh = 10;

    // Body (blue overalls, flat)
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.ellipse(x, y - rh, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green shirt visible at edges
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x - rw + 4, y - rh - 3, 8, 6);
    ctx.fillRect(x + rw - 12, y - rh - 3, 8, 6);

    // Head (skin tone, small when ducking)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - rh - 2, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cap (green, flat)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - rh - 7, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cap brim
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 10, y - rh - 5, 12, 3);

    // Eyes (small)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 12, y - rh - 1, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e40af';
    ctx.beginPath(); ctx.arc(x + 13, y - rh - 1, 1, 0, Math.PI * 2); ctx.fill();

    // Mustache
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 8, y - rh + 2, 8, 2);
    return;
  }

  const r = 18;

  // === LEGS (behind body) ===
  if (!dead) {
    const legOff1 = Math.sin(legPhase) * (isJumping ? 0 : 5);
    const legOff2 = Math.sin(legPhase + Math.PI) * (isJumping ? 0 : 5);
    // Blue overalls legs
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(x - 5, y - 4 + legOff1, 6, 12 - legOff1);
    ctx.fillRect(x + 4, y - 4 + legOff2, 6, 12 - legOff2);
    // Brown shoes
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(x - 2, y + 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 7, y + 8, 4, 0, Math.PI * 2); ctx.fill();
  }

  // === BODY — Blue overalls ===
  ctx.fillStyle = '#1e40af';
  ctx.beginPath();
  ctx.ellipse(x, y - r + 4, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Overall straps
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 6, y - r - 4, 3, 10);
  ctx.fillRect(x + 3, y - r - 4, 3, 10);

  // Overall buttons (yellow)
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(x - 5, y - r + 1, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - r + 1, 1.5, 0, Math.PI * 2); ctx.fill();

  // === GREEN SHIRT (visible at sleeves) ===
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(x, y - r - 2, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ARMS ===
  if (!dead) {
    const armSwing1 = Math.sin(armPhase) * (isJumping ? 3 : 6);
    const armSwing2 = Math.sin(armPhase + Math.PI) * (isJumping ? 3 : 6);
    ctx.fillStyle = '#16a34a';
    // Left arm
    ctx.save();
    ctx.translate(x - 12, y - r - 2);
    ctx.rotate(armSwing1 * 0.05);
    ctx.fillRect(-3, 0, 5, 12);
    ctx.restore();
    // Right arm
    ctx.save();
    ctx.translate(x + 12, y - r - 2);
    ctx.rotate(armSwing2 * 0.05);
    ctx.fillRect(-2, 0, 5, 12);
    ctx.restore();

    // Gloves (white)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x - 13, y - r + 10 + armSwing1 * 0.3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, y - r + 10 + armSwing2 * 0.3, 3, 0, Math.PI * 2); ctx.fill();
  }

  // === HEAD ===
  // Face (skin)
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(x + 1, y - r - 12, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // === CAP (green) ===
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(x + 1, y - r - 18, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cap brim
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.moveTo(x + 4, y - r - 14);
  ctx.lineTo(x + 18, y - r - 15);
  ctx.lineTo(x + 16, y - r - 12);
  ctx.lineTo(x + 4, y - r - 12);
  ctx.fill();

  // "L" emblem on cap
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 1, y - r - 19, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('L', x + 1, y - r - 16);

  // === EYES ===
  if (dead) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    [-4, 6].forEach(ex => {
      ctx.beginPath(); ctx.moveTo(x + ex - 3, y - r - 15); ctx.lineTo(x + ex + 3, y - r - 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + ex + 3, y - r - 15); ctx.lineTo(x + ex - 3, y - r - 9); ctx.stroke();
    });
  } else {
    const eyeH = isBlinking ? 0.5 : 3;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x - 4, y - r - 13, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 6, y - r - 13, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e40af';
    ctx.beginPath(); ctx.ellipse(x - 3, y - r - 13, 2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 7, y - r - 13, 2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    if (!isBlinking) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - 2, y - r - 14, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y - r - 14, 0.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  // === NOSE ===
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(x + 1, y - r - 10, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MUSTACHE ===
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - r - 8);
  ctx.quadraticCurveTo(x - 4, y - r - 5, x + 1, y - r - 7);
  ctx.quadraticCurveTo(x + 6, y - r - 5, x + 10, y - r - 8);
  ctx.quadraticCurveTo(x + 6, y - r - 6, x + 1, y - r - 8);
  ctx.quadraticCurveTo(x - 4, y - r - 6, x - 8, y - r - 8);
  ctx.fill();
}

function drawCactus(o: { x: number; w: number; h: number }) {
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(o.x, GROUND_Y - o.h, o.w, o.h);
  ctx.fillRect(o.x - 5, GROUND_Y - o.h * 0.7, 6, o.h * 0.3);
  ctx.fillRect(o.x + o.w - 1, GROUND_Y - o.h * 0.6, 6, o.h * 0.25);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const sy = GROUND_Y - o.h + i * (o.h / 4) + 5;
    ctx.beginPath(); ctx.moveTo(o.x, sy); ctx.lineTo(o.x - 4, sy - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.x + o.w, sy); ctx.lineTo(o.x + o.w + 4, sy - 3); ctx.stroke();
  }
}

function drawBird(o: { x: number; birdY: number }) {
  const wingY = Math.sin(frame * 0.2) * 6;
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath(); ctx.ellipse(o.x + 14, o.birdY, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(o.x + 10, o.birdY);
  ctx.lineTo(o.x + 5, o.birdY - 12 + wingY);
  ctx.lineTo(o.x + 20, o.birdY);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(o.x + 22, o.birdY - 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(o.x + 23, o.birdY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(o.x + 28, o.birdY); ctx.lineTo(o.x + 34, o.birdY + 2); ctx.lineTo(o.x + 28, o.birdY + 4); ctx.fill();
}

function draw() {
  const t = getTheme();
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = t.cloud;
  clouds.forEach(c => {
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.5, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + 15, c.y - 5, c.w * 0.3, 8, 0, 0, Math.PI * 2); ctx.fill();
  });

  ctx.strokeStyle = t.ground;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 10); ctx.lineTo(W, GROUND_Y + 10); ctx.stroke();
  ctx.fillStyle = t.groundDot;
  for (let i = -1; i < W / 20 + 1; i++) {
    const dx = i * 20 - groundOffset;
    ctx.fillRect(dx, GROUND_Y + 14, 2, 2);
    ctx.fillRect(dx + 10, GROUND_Y + 20, 1, 1);
  }

  for (const o of obstacles) {
    if (o.type === 'cactus') drawCactus(o);
    else drawBird(o);
  }

  drawLuigi(80, luigiY, gameOver);

  ctx.fillStyle = t.hud;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${String(score).padStart(5, '0')}`, W - 20, 30);
  ctx.fillStyle = t.textMuted;
  ctx.fillText(`HI ${String(highScore).padStart(5, '0')}`, W - 100, 30);

  if (!started) {
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE or TAP to start', W / 2, H / 2);
  }

  if (gameOver) {
    ctx.fillStyle = t.hud;
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 30);
    ctx.fillStyle = t.textMuted;
    ctx.font = '400 14px "JetBrains Mono", monospace';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2);
    const canR = canRestart();
    ctx.fillStyle = canR ? t.textMuted : t.ground;
    ctx.fillText(canR ? 'Press SPACE to restart' : 'Wait...', W / 2, H / 2 + 25);
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
  baseSpeed = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 8 : 6;
  init();

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'ArrowUp') { jump(); e.preventDefault(); }
    if (e.key === 'ArrowDown') { isDucking = true; e.preventDefault(); }
    if (e.key === 'Enter' && canRestart()) { init(); started = true; }
  };
  keyUpHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') isDucking = false;
  };
  clickHandler = () => jump();

  touchStartHandler = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    jump();
  };

  touchEndHandler = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dy = touch.clientY - touchStartY;
    if (dy > 30) {
      isDucking = true;
      setTimeout(() => { isDucking = false; }, 500);
    }
  };

  window.addEventListener('keydown', keyHandler);
  window.addEventListener('keyup', keyUpHandler);
  canvas.addEventListener('click', clickHandler);
  canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
  canvas.addEventListener('touchend', touchEndHandler, { passive: false });
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  window.removeEventListener('keyup', keyUpHandler);
  canvasRef?.removeEventListener('click', clickHandler);
  canvasRef?.removeEventListener('touchstart', touchStartHandler);
  canvasRef?.removeEventListener('touchend', touchEndHandler);
}
