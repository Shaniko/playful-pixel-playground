import { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameOverlayProps {
  gameId: string;
  onClose: () => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Relaxed pace', color: 'text-green-400 border-green-500/40 hover:bg-green-500/10' },
  { value: 'medium', label: 'Medium', desc: 'Balanced challenge', color: 'text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', desc: 'Intense action', color: 'text-red-400 border-red-500/40 hover:bg-red-500/10' },
];

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

  // Difficulty selection screen
  if (difficulty === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative flex flex-col items-center gap-8">
          <button
            onClick={onClose}
            className="absolute -top-2 left-0 flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-mono text-sm"
          >
            ← BACK
          </button>
          <h2 className="text-2xl font-bold font-mono text-primary mt-10">Choose Difficulty</h2>
          <div className="flex gap-4">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`flex flex-col items-center gap-2 px-8 py-6 rounded-xl border-2 ${opt.color} bg-background/50 transition-all hover:scale-105 font-mono`}
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-mono text-sm"
        >
          ← BACK
          <span className="text-xs opacity-50 hidden sm:inline">(ESC)</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 pb-4 min-h-0 w-full">
        <div className="flex-1 min-h-0 flex items-center justify-center w-full px-4">
          <canvas
            ref={canvasRef}
            className="rounded-2xl shadow-[0_0_60px_-15px_hsl(142,71%,45%,0.2)]"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono text-center shrink-0">
          {gameId === 'tetris' && '← → Move  ↑ Rotate  ↓ Soft drop  SPACE Hard drop'}
          {gameId === 'snake' && '← → ↑ ↓ to move'}
          {gameId === 'pong' && '↑ ↓ to move paddle'}
          {gameId === 'breakout' && '← → to move  SPACE to launch'}
          {gameId === 'space-invaders' && '← → to move  SPACE to shoot'}
          {gameId === 'dino-runner' && 'SPACE / TAP to jump  ↓ to duck'}
          {/* sudoku has built-in instructions on canvas */}
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
