const W = 800, H = 300;
const GROUND_Y = H - 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let clickHandler: () => void;

let catY: number, catVY: number, isJumping: boolean;
let obstacles: { x: number; w: number; h: number; type: 'cactus' | 'bird'; birdY: number }[];
let clouds: { x: number; y: number; w: number }[];
let groundOffset: number;
let score: number, highScore: number;
let speed: number;
let gameOver: boolean;
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
  obstacles = [];
  groundOffset = 0;
  score = 0;
  speed = 6;
  gameOver = false;
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

function jump() {
  if (gameOver) { init(); started = true; return; }
  if (!started) { started = true; return; }
  if (!isJumping) {
    catVY = JUMP_FORCE;
    isJumping = true;
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
  tailPhase += 0.05;
  blinkTimer++;
  if (blinkTimer > 120) { isBlinking = true; }
  if (blinkTimer > 126) { isBlinking = false; blinkTimer = 0; }

  // gravity
  catVY += GRAVITY;
  catY += catVY;
  if (catY >= GROUND_Y) { catY = GROUND_Y; catVY = 0; isJumping = false; }

  // ground scroll
  groundOffset = (groundOffset + speed) % 20;

  // clouds
  clouds.forEach(c => { c.x -= speed * 0.3; if (c.x < -80) c.x = W + Math.random() * 100; });

  // obstacles
  if (frame % Math.max(40, 90 - Math.floor(score / 200)) === 0) spawnObstacle();
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x > -60);

  // score
  score++;
  if (score % 500 === 0) speed += 0.5;

  // collision
  const catX = 80, catR = 18;
  for (const o of obstacles) {
    let ox: number, oy: number, ow: number, oh: number;
    if (o.type === 'cactus') {
      ox = o.x; oy = GROUND_Y - o.h; ow = o.w; oh = o.h;
    } else {
      ox = o.x; oy = o.birdY; ow = o.w; oh = o.h;
    }
    // circle vs rect
    const closestX = Math.max(ox, Math.min(catX, ox + ow));
    const closestY = Math.max(oy, Math.min(catY - catR, oy + oh));
    const dx = catX - closestX, dy = (catY - catR) - closestY;
    if (dx * dx + dy * dy < (catR - 2) * (catR - 2)) {
      gameOver = true;
      if (score > highScore) { highScore = score; localStorage.setItem('dino-runner-hi', String(highScore)); }
    }
  }
}

function drawCat(x: number, y: number, dead: boolean) {
  const r = 18;
  // tail
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const tw = Math.sin(tailPhase * 3) * 8;
  ctx.moveTo(x - r + 2, y - r);
  ctx.quadraticCurveTo(x - r - 12, y - r - 15 + tw, x - r - 8, y - r - 25);
  ctx.stroke();

  // body
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(x, y - r, r, r + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // belly
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.ellipse(x + 2, y - r + 5, r * 0.55, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - r * 2 + 4);
  ctx.lineTo(x - 16, y - r * 2 - 10);
  ctx.lineTo(x - 3, y - r * 2 + 1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 10, y - r * 2 + 4);
  ctx.lineTo(x + 16, y - r * 2 - 10);
  ctx.lineTo(x + 3, y - r * 2 + 1);
  ctx.fill();

  // inner ears
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - r * 2 + 4);
  ctx.lineTo(x - 13, y - r * 2 - 5);
  ctx.lineTo(x - 5, y - r * 2 + 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 9, y - r * 2 + 4);
  ctx.lineTo(x + 13, y - r * 2 - 5);
  ctx.lineTo(x + 5, y - r * 2 + 2);
  ctx.fill();

  // eyes
  if (dead) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    [-6, 8].forEach(ex => {
      ctx.beginPath(); ctx.moveTo(x + ex - 4, y - r - 6); ctx.lineTo(x + ex + 4, y - r + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + ex + 4, y - r - 6); ctx.lineTo(x + ex - 4, y - r + 2); ctx.stroke();
    });
  } else {
    const eyeH = isBlinking ? 1 : 5;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x - 6, y - r - 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 8, y - r - 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(x - 5, y - r - 1, 2.5, eyeH > 1 ? 3 : 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 9, y - r - 1, 2.5, eyeH > 1 ? 3 : 0.5, 0, 0, Math.PI * 2); ctx.fill();
    // eye shine
    if (!isBlinking) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x - 4, y - r - 3, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 10, y - r - 3, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // mouth
  if (!dead) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - r + 7);
    ctx.quadraticCurveTo(x - 5, y - r + 12, x - 8, y - r + 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - r + 7);
    ctx.quadraticCurveTo(x + 5, y - r + 12, x + 8, y - r + 9);
    ctx.stroke();
    // nose
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.ellipse(x, y - r + 6, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // whiskers
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 0.8;
    [-1, 1].forEach(s => {
      ctx.beginPath(); ctx.moveTo(x + s * 8, y - r + 6); ctx.lineTo(x + s * 22, y - r + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 8, y - r + 8); ctx.lineTo(x + s * 22, y - r + 10); ctx.stroke();
    });
  }

  // legs (animated)
  if (!dead) {
    ctx.fillStyle = '#f59e0b';
    const legOff1 = Math.sin(legPhase) * (isJumping ? 0 : 5);
    const legOff2 = Math.sin(legPhase + Math.PI) * (isJumping ? 0 : 5);
    // front legs
    ctx.fillRect(x + 5, y - 2 + legOff1, 5, 10 - legOff1);
    ctx.fillRect(x - 2, y - 2 + legOff2, 5, 10 - legOff2);
    // paws
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(x + 7.5, y + 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 0.5, y + 8, 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCactus(o: { x: number; w: number; h: number }) {
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(o.x, GROUND_Y - o.h, o.w, o.h);
  // arms
  ctx.fillRect(o.x - 5, GROUND_Y - o.h * 0.7, 6, o.h * 0.3);
  ctx.fillRect(o.x + o.w - 1, GROUND_Y - o.h * 0.6, 6, o.h * 0.25);
  // spines
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
  // wing
  ctx.beginPath();
  ctx.moveTo(o.x + 10, o.birdY);
  ctx.lineTo(o.x + 5, o.birdY - 12 + wingY);
  ctx.lineTo(o.x + 20, o.birdY);
  ctx.fill();
  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(o.x + 22, o.birdY - 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(o.x + 23, o.birdY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
  // beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(o.x + 28, o.birdY); ctx.lineTo(o.x + 34, o.birdY + 2); ctx.lineTo(o.x + 28, o.birdY + 4); ctx.fill();
}

function draw() {
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  // clouds
  ctx.fillStyle = '#1a1a2e';
  clouds.forEach(c => {
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.5, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + 15, c.y - 5, c.w * 0.3, 8, 0, 0, Math.PI * 2); ctx.fill();
  });

  // ground
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 10); ctx.lineTo(W, GROUND_Y + 10); ctx.stroke();
  // ground dots
  ctx.fillStyle = '#333';
  for (let i = -1; i < W / 20 + 1; i++) {
    const dx = i * 20 - groundOffset;
    ctx.fillRect(dx, GROUND_Y + 14, 2, 2);
    ctx.fillRect(dx + 10, GROUND_Y + 20, 1, 1);
  }

  // obstacles
  for (const o of obstacles) {
    if (o.type === 'cactus') drawCactus(o);
    else drawBird(o);
  }

  // cat
  drawCat(80, catY, gameOver);

  // HUD
  ctx.fillStyle = '#22c55e';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${String(score).padStart(5, '0')}`, W - 20, 30);
  ctx.fillStyle = '#555';
  ctx.fillText(`HI ${String(highScore).padStart(5, '0')}`, W - 100, 30);

  if (!started) {
    ctx.fillStyle = '#aaa';
    ctx.font = '400 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE or TAP to start', W / 2, H / 2);
  }

  if (gameOver) {
    ctx.fillStyle = '#22c55e';
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 30);
    ctx.fillStyle = '#aaa';
    ctx.font = '400 14px "JetBrains Mono", monospace';
    ctx.fillText(`Score: ${score}`, W / 2, H / 2);
    ctx.fillText('Press SPACE to restart', W / 2, H / 2 + 25);
  }
}

function loop() {
  if (!ctx) return;
  update();
  draw();
  animId = requestAnimationFrame(loop);
}

export function start(canvas: HTMLCanvasElement) {
  ctx = canvas.getContext('2d')!;
  canvas.width = W;
  canvas.height = H;
  init();

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'ArrowUp') { jump(); e.preventDefault(); }
    if (e.key === 'Enter' && gameOver) { init(); started = true; }
  };
  clickHandler = () => jump();
  window.addEventListener('keydown', keyHandler);
  canvas.addEventListener('click', clickHandler);
  animId = requestAnimationFrame(loop);
}

export function stop() {
  cancelAnimationFrame(animId);
  window.removeEventListener('keydown', keyHandler);
}
