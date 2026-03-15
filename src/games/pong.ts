let ctx: CanvasRenderingContext2D;
let animId: number;
let keyHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;

const W = 700, H = 500;
const PADDLE_W = 12, PADDLE_H = 80, BALL_R = 8;
const PADDLE_SPEED = 6, AI_SPEED = 4;

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

  // player
  if (keys['ArrowUp']) playerY = Math.max(0, playerY - PADDLE_SPEED);
  if (keys['ArrowDown']) playerY = Math.min(H - PADDLE_H, playerY + PADDLE_SPEED);

  // AI
  const aiCenter = aiY + PADDLE_H / 2;
  if (aiCenter < ballY - 10) aiY += AI_SPEED;
  else if (aiCenter > ballY + 10) aiY -= AI_SPEED;
  aiY = Math.max(0, Math.min(H - PADDLE_H, aiY));

  // ball
  ballX += ballVX;
  ballY += ballVY;

  if (ballY <= BALL_R || ballY >= H - BALL_R) ballVY = -ballVY;

  // paddle collision
  if (ballX - BALL_R <= 30 + PADDLE_W && ballY >= playerY && ballY <= playerY + PADDLE_H && ballVX < 0) {
    ballVX = -ballVX * 1.05;
    ballVY += (ballY - (playerY + PADDLE_H / 2)) * 0.15;
  }
  if (ballX + BALL_R >= W - 30 - PADDLE_W && ballY >= aiY && ballY <= aiY + PADDLE_H && ballVX > 0) {
    ballVX = -ballVX * 1.05;
    ballVY += (ballY - (aiY + PADDLE_H / 2)) * 0.15;
  }

  // score
  if (ballX < 0) { aiScore++; checkWin(); resetBall(1); }
  if (ballX > W) { playerScore++; checkWin(); resetBall(-1); }
}

function checkWin() {
  if (playerScore >= 7 || aiScore >= 7) { gameOver = true; gameOverTime = Date.now(); }
}

function draw() {
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, W, H);

  // center line
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.setLineDash([]);

  // paddles
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(30, playerY, PADDLE_W, PADDLE_H);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(W - 30 - PADDLE_W, aiY, PADDLE_W, PADDLE_H);

  // ball
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  // score
  ctx.font = '700 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#22c55e';
  ctx.fillText(`${playerScore}`, W / 2 - 60, 50);
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(`${aiScore}`, W / 2 + 60, 50);

  if (gameOver) {
    ctx.fillStyle = 'rgba(9,9,11,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = playerScore >= 7 ? '#22c55e' : '#3b82f6';
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.fillText(playerScore >= 7 ? 'YOU WIN!' : 'AI WINS!', W / 2, H / 2 - 20);
    ctx.fillStyle = '#aaa';
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

export function start(canvas: HTMLCanvasElement) {
  ctx = canvas.getContext('2d')!;
  canvas.width = W;
  canvas.height = H;
  init();

  keyHandler = (e: KeyboardEvent) => {
    keys[e.key] = true;
    if (gameOver && e.key === 'Enter') init();
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
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
