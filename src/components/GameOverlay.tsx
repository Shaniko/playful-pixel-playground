import { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameOverlayProps {
  gameId: string;
  onClose: () => void;
}

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Relaxed pace', color: 'text-green-400 border-green-500/40 hover:bg-green-500/10 active:bg-green-500/20' },
  { value: 'medium', label: 'Medium', desc: 'Balanced challenge', color: 'text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10 active:bg-yellow-500/20' },
  { value: 'hard', label: 'Hard', desc: 'Intense action', color: 'text-red-400 border-red-500/40 hover:bg-red-500/10 active:bg-red-500/20' },
];

const TOUCH_INSTRUCTIONS: Record<string, string> = {
  tetris: 'Tap rotate · Swipe ←→ move · Swipe ↓ drop · Swipe ↑ hard drop',
  snake: 'Swipe to change direction',
  pong: 'Drag to move paddle',
  breakout: 'Drag to move · Tap to launch',
  'space-invaders': 'Drag to move · Hold to shoot',
  'dino-runner': 'Tap to jump · Swipe ↓ to duck',
  sudoku: 'Tap cell · Pick number below',
};

const KEY_INSTRUCTIONS: Record<string, string> = {
  tetris: '← → Move  ↑ Rotate  ↓ Soft drop  SPACE Hard drop',
  snake: '← → ↑ ↓ to move',
  pong: '↑ ↓ to move paddle',
  breakout: '← → to move  SPACE to launch',
  'space-invaders': '← → to move  SPACE to shoot',
  'dino-runner': 'SPACE / TAP to jump  ↓ to duck',
};

const GameOverlay = ({ gameId, onClose }: GameOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    if (difficulty === null) return;

    const loadGame = async () => {
      if (!canvasRef.current) return;
      let mod: { start: (c: HTMLCanvasElement, d: Difficulty) => void; stop: () => void };
      switch (gameId) {
        case 'tetris': mod = await import('@/games/tetris'); break;
        case 'snake': mod = await import('@/games/snake'); break;
        case 'pong': mod = await import('@/games/pong'); break;
        case 'breakout': mod = await import('@/games/breakout'); break;
        case 'space-invaders': mod = await import('@/games/space-invaders'); break;
        case 'dino-runner': mod = await import('@/games/dino-runner'); break;
        case 'sudoku': mod = await import('@/games/sudoku'); break;
        default: return;
      }
      mod.start(canvasRef.current, difficulty);
      stopRef.current = mod.stop;
    };
    loadGame();

    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [gameId, difficulty]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const touch = isTouchDevice();
  const instructions = touch ? TOUCH_INSTRUCTIONS[gameId] : KEY_INSTRUCTIONS[gameId];

  // Difficulty selection screen
  if (difficulty === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative flex flex-col items-center gap-6 sm:gap-8 px-4 w-full max-w-md">
          <button
            onClick={onClose}
            className="absolute -top-2 left-0 flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all font-mono text-sm min-h-[44px] min-w-[44px]"
          >
            ← BACK
          </button>
          <h2 className="text-2xl font-bold font-mono text-primary mt-10">Choose Difficulty</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`flex flex-col items-center gap-1 sm:gap-2 px-6 sm:px-8 py-4 sm:py-6 rounded-xl border-2 ${opt.color} bg-background/50 transition-all hover:scale-105 active:scale-95 font-mono min-h-[44px]`}
              >
                <span className="text-lg font-bold">{opt.label}</span>
                <span className="text-xs opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-background backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-3xl px-4 pt-3 pb-1 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all font-mono text-sm min-h-[44px] min-w-[44px]"
        >
          ← BACK
          <span className="text-xs opacity-50 hidden sm:inline">(ESC)</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-4 min-h-0 w-full">
        <div className="flex-1 min-h-0 flex items-center justify-center w-full px-4">
          <canvas
            ref={canvasRef}
            className="rounded-2xl shadow-[0_0_60px_-15px_hsl(var(--primary)/0.2)]"
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', touchAction: 'none' }}
          />
        </div>
        {instructions && (
          <div className="text-xs text-muted-foreground font-mono text-center shrink-0 px-4">
            {instructions}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOverlay;
