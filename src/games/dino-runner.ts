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

let catY: number, catVY: number, isJumping: boolean, isDucking: boolean;
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
let tailPhase: number;
let blinkTimer: number;
let isBlinking: boolean;

function init() {
  catY = GROUND_Y;
  catVY = 0;
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
  tailPhase = 0;
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
    catVY = JUMP_FORCE;
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
  tailPhase += 0.15;
  blinkTimer++;
  if (blinkTimer > 120) { isBlinking = true; }
  if (blinkTimer > 126) { isBlinking = false; blinkTimer = 0; }

  catVY += GRAVITY;
  catY += catVY;
  if (catY >= GROUND_Y) { catY = GROUND_Y; catVY = 0; isJumping = false; }

  groundOffset = (groundOffset + speed) % 20;

  clouds.forEach(c => { c.x -= speed * 0.3; if (c.x < -80) c.x = W + Math.random() * 100; });

  if (frame % Math.max(40, 90 - Math.floor(score / 200)) === 0) spawnObstacle();
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x > -60);

  score++;
  if (score % 500 === 0) speed += 0.5;

  const lx = 80;
  const lr = isDucking ? 10 : 18;
  const lCenterY = isDucking ? catY - 10 : catY - 18;
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

function drawCat(x: number, y: number, dead: boolean) {
  if (isDucking && !dead) {
    // Ducking cat — flat crouching pose
    const rw = 22, rh = 10;
    // Body (orange)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(x, y - rh, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stripes
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i += 8) {
      ctx.beginPath(); ctx.moveTo(x + i, y - rh - 6); ctx.lineTo(x + i + 3, y - rh + 6); ctx.stroke();
    }
    // Head (small when ducking)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(x + 14, y - rh - 2, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath(); ctx.moveTo(x + 9, y - rh - 7); ctx.lineTo(x + 12, y - rh - 14); ctx.lineTo(x + 16, y - rh - 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 14, y - rh - 7); ctx.lineTo(x + 17, y - rh - 14); ctx.lineTo(x + 21, y - rh - 7); ctx.fill();
    // Inner ears
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.moveTo(x + 10, y - rh - 7); ctx.lineTo(x + 12, y - rh - 12); ctx.lineTo(x + 15, y - rh - 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 15, y - rh - 7); ctx.lineTo(x + 17, y - rh - 12); ctx.lineTo(x + 20, y - rh - 7); ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + 12, y - rh - 1, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.arc(x + 13, y - rh - 1, 1, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.arc(x + 17, y - rh, 1.5, 0, Math.PI * 2); ctx.fill();
    // Tail (flat behind)
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - rw, y - rh);
    ctx.quadraticCurveTo(x - rw - 10, y - rh - 10, x - rw - 5, y - rh - 15);
    ctx.stroke();
    return;
  }

  const r = 18;

  // === TAIL (behind body) ===
  const tailWag = Math.sin(tailPhase) * 8;
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - r + 2);
  ctx.quadraticCurveTo(x - 22, y - r - 10 + tailWag, x - 18, y - r - 20 + tailWag);
  ctx.stroke();

  // === LEGS ===
  if (!dead) {
    const legOff1 = Math.sin(legPhase) * (isJumping ? 0 : 5);
    const legOff2 = Math.sin(legPhase + Math.PI) * (isJumping ? 0 : 5);
    // Legs (orange)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x - 7, y - 4 + legOff1, 6, 12 - legOff1);
    ctx.fillRect(x + 2, y - 4 + legOff2, 6, 12 - legOff2);
    // Paws (lighter)
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath(); ctx.arc(x - 4, y + 8, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 5, y + 8, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // === BODY (orange) ===
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.ellipse(x, y - r + 4, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiger stripes on body
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 1.5;
  for (let i = -6; i <= 6; i += 6) {
    ctx.beginPath(); ctx.moveTo(x + i, y - r - 6); ctx.lineTo(x + i + 2, y - r + 10); ctx.stroke();
  }

  // Belly (cream)
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(x, y - r + 6, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // === HEAD ===
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.ellipse(x + 1, y - r - 12, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // === EARS ===
  ctx.fillStyle = '#f97316';
  ctx.beginPath(); ctx.moveTo(x - 8, y - r - 17); ctx.lineTo(x - 4, y - r - 28); ctx.lineTo(x + 1, y - r - 17); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 2, y - r - 17); ctx.lineTo(x + 6, y - r - 28); ctx.lineTo(x + 11, y - r - 17); ctx.fill();
  // Inner ears (pink)
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath(); ctx.moveTo(x - 6, y - r - 17); ctx.lineTo(x - 4, y - r - 25); ctx.lineTo(x - 1, y - r - 17); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 4, y - r - 17); ctx.lineTo(x + 6, y - r - 25); ctx.lineTo(x + 9, y - r - 17); ctx.fill();

  // Forehead stripes
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 2, y - r - 18); ctx.lineTo(x + 1, y - r - 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 4, y - r - 18); ctx.lineTo(x + 1, y - r - 22); ctx.stroke();

  // === EYES ===
  if (dead) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    [-4, 6].forEach(ex => {
      ctx.beginPath(); ctx.moveTo(x + ex - 3, y - r - 15); ctx.lineTo(x + ex + 3, y - r - 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + ex + 3, y - r - 15); ctx.lineTo(x + ex - 3, y - r - 9); ctx.stroke();
    });
  } else {
    const eyeH = isBlinking ? 0.5 : 3.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x - 4, y - r - 13, 4.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 6, y - r - 13, 4.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    // Green cat eyes
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.ellipse(x - 3, y - r - 13, 2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 7, y - r - 13, 2, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    // Eye shine
    if (!isBlinking) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - 2, y - r - 14, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 8, y - r - 14, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // === NOSE (pink) ===
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.moveTo(x + 1, y - r - 9);
  ctx.lineTo(x - 1, y - r - 7);
  ctx.lineTo(x + 3, y - r - 7);
  ctx.fill();

  // === WHISKERS ===
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 0.8;
  // Left whiskers
  ctx.beginPath(); ctx.moveTo(x - 4, y - r - 8); ctx.lineTo(x - 16, y - r - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 4, y - r - 7); ctx.lineTo(x - 16, y - r - 6); ctx.stroke();
  // Right whiskers
  ctx.beginPath(); ctx.moveTo(x + 6, y - r - 8); ctx.lineTo(x + 18, y - r - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 6, y - r - 7); ctx.lineTo(x + 18, y - r - 6); ctx.stroke();

  // === MOUTH ===
  if (!dead) {
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x + 1, y - r - 7);
    ctx.lineTo(x - 1, y - r - 5);
    ctx.moveTo(x + 1, y - r - 7);
    ctx.lineTo(x + 3, y - r - 5);
    ctx.stroke();
  }
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

  drawCat(80, catY, gameOver);

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
    if ((e.target as HTMLElement)?.closest?.('button')) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    jump();
  };

  touchEndHandler = (e: TouchEvent) => {
    if ((e.target as HTMLElement)?.closest?.('button')) return;
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
  document.addEventListener('click', clickHandler);
  document.addEventListener('touchstart', touchStartHandler, { passive: false });
  document.addEventListener('touchend', touchEndHandler, { passive: false });
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
  window.removeEventListener('keyup', keyUpHandler);
  document.removeEventListener('click', clickHandler);
  document.removeEventListener('touchstart', touchStartHandler);
  document.removeEventListener('touchend', touchEndHandler);
}
