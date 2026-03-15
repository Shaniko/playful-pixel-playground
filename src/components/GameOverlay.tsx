import { useEffect, useRef } from 'react';

interface GameOverlayProps {
  gameId: string;
  onClose: () => void;
}

const GameOverlay = ({ gameId, onClose }: GameOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      if (!canvasRef.current) return;
      let mod: { start: (c: HTMLCanvasElement) => void; stop: () => void };
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
      mod.start(canvasRef.current);
      stopRef.current = mod.stop;
    };
    loadGame();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      stopRef.current?.();
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameId, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center gap-4">
        {/* Close button – top right, visible & tappable on mobile */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-xs font-mono hidden sm:inline">ESC</span>
          <span className="text-2xl leading-none font-light">✕</span>
        </button>
        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-[0_0_60px_-15px_hsl(142,71%,45%,0.2)]"
        />
        <div className="text-xs text-muted-foreground font-mono text-center">
          {gameId === 'tetris' && '← → Move  ↑ Rotate  ↓ Soft drop  SPACE Hard drop'}
          {gameId === 'snake' && '← → ↑ ↓ to move'}
          {gameId === 'pong' && '↑ ↓ to move paddle'}
          {gameId === 'breakout' && '← → to move  SPACE to launch'}
          {gameId === 'space-invaders' && '← → to move  SPACE to shoot'}
          {gameId === 'dino-runner' && 'SPACE / TAP to jump  ↓ to duck'}
          {gameId === 'sudoku' && 'Click cell + type 1-9  DELETE to clear  Arrow keys to navigate'}
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
