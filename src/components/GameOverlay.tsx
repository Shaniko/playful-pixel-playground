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
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          ESC to exit
        </button>
        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-[0_0_60px_-15px_hsl(142,71%,45%,0.2)]"
        />
        <div className="text-xs text-muted-foreground font-mono">
          {gameId === 'tetris' && '← → Move  ↑ Rotate  ↓ Soft drop  SPACE Hard drop'}
          {gameId === 'snake' && '← → ↑ ↓ to move'}
          {gameId === 'pong' && '↑ ↓ to move paddle'}
          {gameId === 'breakout' && '← → to move  SPACE to launch'}
          {gameId === 'space-invaders' && '← → to move  SPACE to shoot'}
          {gameId === 'dino-runner' && 'SPACE / TAP to jump'}
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
